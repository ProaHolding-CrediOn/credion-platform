"use client";

import { memo, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { FileUploadFieldProps, UploadedFile, UploadingFile } from "./FileUploadField.type";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import TextViewer from "../TextViewer/TextViewer";

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const required = validations?.find(value => value.name === "required")?.value as boolean;
  let maxFiles = validations?.find(value => value.name === "maxFiles")?.value as number;
  if (!maxFiles) maxFiles = 1;

  useEffect(() => {
    if (value) {
      setTouched(true);
    }
  }, []);

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

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

  const uploadFile = (
    file: File,
    onProgress: (percent: number) => void
  ): Promise<{ id?: string; error?: string }> => {
    return new Promise((resolve) => {
      // 'token' lo setean los flujos con signedUrl (desembolso/vehiculo/
      // complementario); 'auth_token' el flujo abierto verificado por OTP.
      // Se prioriza 'token' para no romper los formularios por signedUrl.
      const token = localStorage.getItem("token") ?? localStorage.getItem("auth_token");

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({ id: response?.doc?.id });
          } catch {
            resolve({ error: "No se pudo procesar la respuesta del servidor" });
          }
        } else {
          // 401 = sesion expirada (lo marca el route /api/media). Mensaje claro
          // para que el cliente recargue en vez de reintentar a ciegas.
          let message = "Error al subir el archivo";
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed?.error) message = parsed.error;
          } catch {
            /* respuesta sin JSON: dejamos el mensaje por defecto */
          }
          if (xhr.status === 401) {
            message =
              "Tu sesión expiró. Recarga la página e ingresa de nuevo para continuar.";
          }
          resolve({ error: message });
        }
      };

      xhr.onerror = () => resolve({ error: "Error de conexión al subir el archivo" });

      xhr.open("POST", "/api/media");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const selectedFiles = Array.from(selected);
    const currentUploaded = value ?? [];

    const remainingSlots = maxFiles - currentUploaded.length;
    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    let uploadedNow: UploadedFile[] = [...(value ?? [])];
    for (const file of filesToAdd) {
      const tempId = crypto.randomUUID();

      setUploadingFiles((prev) => [
        ...prev,
        { id: tempId, file, progress: 0, error: false },
      ]);

      const result = await uploadFile(file, (percent) => {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, progress: percent } : f
          )
        );
      });

      if (result?.id) {
        // Subida exitosa: agregar al value y notificar
        uploadedNow.push({ id: result.id, name: file.name })
        onChange(name, [...uploadedNow]);
        const isValid = validate(uploadedNow);
        onValidationChange?.(name, isValid, uploadedNow);
      } else {
        // Subida fallida: mostrar el motivo (sesion expirada, etc.) y un
        // error temporal en la barra de progreso del archivo.
        setError(result?.error ?? "Error al subir el archivo");
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, error: true, progress: 100 } : f
          )
        );
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
        }, 4000);
      }

      // Quitar de la lista si ya se subió
      setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
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
            <div key={f.id} className="flex items-center gap-4">
              <div className="flex-1">
                <p className={`text-sm truncate ${f.error ? "text-red-500" : ""}`}>
                  {f.file.name}
                </p>
                <Progress value={f.progress} className="mt-1" />
                {f.error && <p className="text-xs text-red-500">Error al subir archivo</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})