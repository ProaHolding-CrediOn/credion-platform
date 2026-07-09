"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { FileUploadFieldProps, UploadedFile, UploadingFile } from "./FileUploadField.type";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCw, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import TextViewer from "../TextViewer/TextViewer";

// Reintentos automáticos ante fallos de conexión/servidor antes de rendirse.
const MAX_ATTEMPTS = 3;
// Tope por archivo (debe ir por debajo del client_max_body_size de nginx = 50M).
const MAX_FILE_MB = 45;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
// Corta un intento colgado para poder reintentar (conexiones móviles que se caen).
const UPLOAD_TIMEOUT_MS = 120_000;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

type UploadOutcome =
  | { ok: true; id: string }
  | { ok: false; message: string; retryable: boolean };

// Traduce el código HTTP a un mensaje claro y dice si vale la pena reintentar.
function mapHttpError(status: number, serverMsg: string): UploadOutcome {
  if (status === 401 || status === 403)
    return { ok: false, message: "Tu sesión expiró. Recarga la página e ingresa de nuevo para continuar.", retryable: false };
  if (status === 413)
    return { ok: false, message: `El archivo es muy pesado (supera ${MAX_FILE_MB} MB). Usa una foto de menor resolución.`, retryable: false };
  if (status === 415)
    return { ok: false, message: "Tipo de archivo no permitido. Sube una imagen (JPG/PNG) o un PDF.", retryable: false };
  if (status === 400)
    return { ok: false, message: serverMsg || "El archivo no es válido. Verifica que sea una imagen o un PDF.", retryable: false };
  if (status === 429)
    return { ok: false, message: "Demasiados intentos seguidos. Espera unos segundos e inténtalo de nuevo.", retryable: true };
  if (status === 408)
    return { ok: false, message: "La subida tardó demasiado. Inténtalo de nuevo.", retryable: true };
  if (status >= 500)
    return { ok: false, message: "El servidor tuvo un problema al guardar el archivo. Inténtalo de nuevo.", retryable: true };
  return { ok: false, message: serverMsg || "No se pudo subir el archivo. Inténtalo de nuevo.", retryable: true };
}

export default memo(function FileUploadField({
  name,
  label,
  explain,
  value = [],
  validations,
  onChange,
  onValidationChange,
}: FileUploadFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // Ref al value más reciente: al terminar una subida (posiblemente tras varios
  // reintentos o subidas concurrentes) se debe anexar sobre el value actual,
  // no sobre el capturado en el closure del handler.
  const valueRef = useRef<UploadedFile[]>(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const required = validations?.find(value => value.name === "required")?.value as boolean;
  let maxFiles = validations?.find(value => value.name === "maxFiles")?.value as number;
  if (!maxFiles) maxFiles = 1;

  useEffect(() => {
    if (value) {
      setTouched(true);
    }
  }, []);

  const validate = (uploaded: UploadedFile[]): boolean => {
    if (!touched) return true;

    if (!required && uploaded.length === 0) {
      setError(null);
      return true;
    }

    if (required && uploaded.length === 0) {
      setError("Este campo es obligatorio");
      return false;
    }

    if (uploaded.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivo${maxFiles > 1 ? "s" : ""} permitidos`);
      return false;
    }

    setError(null);
    return true;
  };

  // Una sola petición de subida. Distingue red (onerror), timeout y códigos HTTP.
  const doUpload = (file: File, onProgress: (percent: number) => void): Promise<UploadOutcome> => {
    return new Promise((resolve) => {
      // 'token' lo setean los flujos con signedUrl (desembolso/vehiculo/
      // complementario); 'auth_token' el flujo abierto verificado por OTP.
      // Se prioriza 'token' para no romper los formularios por signedUrl.
      const token = localStorage.getItem("token") ?? localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.timeout = UPLOAD_TIMEOUT_MS;

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response?.doc?.id) return resolve({ ok: true, id: response.doc.id });
            return resolve({ ok: false, message: "No se pudo procesar la respuesta del servidor. Inténtalo de nuevo.", retryable: true });
          } catch {
            return resolve({ ok: false, message: "No se pudo procesar la respuesta del servidor. Inténtalo de nuevo.", retryable: true });
          }
        }
        let serverMsg = "";
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.error) serverMsg = parsed.error;
        } catch {
          /* respuesta sin JSON */
        }
        resolve(mapHttpError(xhr.status, serverMsg));
      };

      // Fallo a nivel de red: la petición no llegó / no hubo respuesta.
      xhr.onerror = () =>
        resolve({ ok: false, message: "No se pudo conectar. Revisa tu conexión a internet e inténtalo de nuevo.", retryable: true });
      // Se agotó el tiempo (conexión lenta o caída a mitad de la subida).
      xhr.ontimeout = () =>
        resolve({ ok: false, message: "La subida tardó demasiado (conexión lenta). Inténtalo de nuevo.", retryable: true });

      xhr.open("POST", "/api/media");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    });
  };

  // Sube con reintentos automáticos ante errores recuperables (red/timeout/5xx).
  const uploadWithRetry = async (
    file: File,
    onProgress: (percent: number) => void,
    onAttempt: (attempt: number) => void,
  ): Promise<UploadOutcome> => {
    let last: UploadOutcome = { ok: false, message: "No se pudo subir el archivo.", retryable: true };
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      onAttempt(attempt);
      onProgress(0);
      const res = await doUpload(file, onProgress);
      if (res.ok) return res;
      last = res;
      if (!res.retryable) return res;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 1000 * attempt)); // backoff 1s, 2s
      }
    }
    return last;
  };

  const patch = (id: string, data: Partial<UploadingFile>) =>
    setUploadingFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));

  // Corre la subida de un archivo ya presente en uploadingFiles (por id).
  const runUpload = async (tempId: string, file: File) => {
    const res = await uploadWithRetry(
      file,
      (percent) => patch(tempId, { progress: percent }),
      (attempt) => patch(tempId, { status: attempt > 1 ? "retrying" : "uploading", attempt }),
    );

    if (res.ok) {
      const next = [...(valueRef.current ?? []), { id: res.id, name: file.name }];
      onChange(name, next);
      const isValid = validate(next);
      onValidationChange?.(name, isValid, next);
      setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
    } else {
      patch(tempId, { status: "error", errorMsg: res.message, retryable: res.retryable, progress: 100 });
    }
  };

  const retryFile = (tempId: string) => {
    const entry = uploadingFiles.find((f) => f.id === tempId);
    if (!entry) return;
    setError(null);
    patch(tempId, { status: "uploading", progress: 0, errorMsg: undefined, attempt: 1 });
    runUpload(tempId, entry.file);
  };

  const dismissFile = (tempId: string) =>
    setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const selectedFiles = Array.from(selected);
    const remainingSlots = maxFiles - (value?.length ?? 0);
    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      const tempId = crypto.randomUUID();

      // Validaciones locales → mensaje inmediato y claro (no gastamos la subida).
      if (file.size > MAX_FILE_BYTES) {
        setUploadingFiles((prev) => [
          ...prev,
          { id: tempId, file, progress: 100, status: "error", retryable: false, errorMsg: `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y supera el límite de ${MAX_FILE_MB} MB. Usa una foto de menor resolución.` },
        ]);
        continue;
      }
      const tipoOk = file.type.startsWith("image/") || ALLOWED_TYPES.includes(file.type);
      if (!tipoOk) {
        setUploadingFiles((prev) => [
          ...prev,
          { id: tempId, file, progress: 100, status: "error", retryable: false, errorMsg: "Tipo de archivo no permitido. Sube una imagen (JPG/PNG) o un PDF." },
        ]);
        continue;
      }

      setUploadingFiles((prev) => [...prev, { id: tempId, file, progress: 0, status: "uploading", attempt: 1 }]);
      runUpload(tempId, file);
    }

    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-light">
        {label} {required && <span className="text-destructive">*</span>} {maxFiles > 1 && value.length === 0 ? `Máximo ${maxFiles} archivos` :`(${value.length}/${maxFiles})`}
      </Label>
      {explain && <Label className="text-xs text-muted-foreground font-light">
        <TextViewer text={explain} />
      </Label>}

      <Input
        id={name}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
        multiple
        onChange={handleFileInput}
        onFocus={() => setTouched(true)}
        disabled={(value?.length ?? 0) >= maxFiles}
        className={`${error ? "border-destructive" : ""} placeholder:font-light cursor-pointer`}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value && value.length > 0 && (
        <div className="space-y-2 mt-2">
          {value.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between border p-2 rounded text-sm"
            >
              <span className="truncate">{f.name}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  const updated = value.filter((item) => item.id !== f.id);
                  onChange(name, updated);
                  const isValid = validate(updated);
                  onValidationChange?.(name, isValid, updated);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {uploadingFiles.length > 0 && (
        <div className="space-y-2 mt-4">
          {uploadingFiles.map((f) => (
            <div key={f.id} className="flex items-start gap-3 border rounded p-2">
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${f.status === "error" ? "text-destructive" : ""}`}>
                  {f.file.name}
                </p>

                {f.status === "error" ? (
                  <p className="text-xs text-destructive mt-1">{f.errorMsg}</p>
                ) : (
                  <>
                    <Progress value={f.progress} className="mt-1" />
                    {f.status === "retrying" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reintentando… (intento {f.attempt} de {MAX_ATTEMPTS})
                      </p>
                    )}
                  </>
                )}
              </div>

              {f.status === "error" && (
                <div className="flex items-center gap-1 shrink-0">
                  {f.retryable && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs"
                      onClick={() => retryFile(f.id)}
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Reintentar
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => dismissFile(f.id)}
                    aria-label="Descartar"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
