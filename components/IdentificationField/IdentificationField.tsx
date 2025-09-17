"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import TextViewer from "../TextViewer/TextViewer";
import { IdentificationFieldProps } from "./IdentificationField.type";

type TipoDoc = "CC" | "CE" | "NIT" | "PASAPORTE" | "INVALIDO";

function calcularNITDV(nit: string): number {
  const pesos = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  let suma = 0;
  const nitReversed = nit.split("").reverse();
  for (let i = 0; i < nitReversed.length; i++) {
    suma += parseInt(nitReversed[i], 10) * pesos[i];
  }
  const resto = suma % 11;
  return resto > 1 ? 11 - resto : resto;
}

function validarDocumento(doc: string): { tipo: TipoDoc; valido: boolean; mensaje?: string } {
  const limpio = doc.trim().toUpperCase();

  if (!/^[A-Z0-9]+$/.test(limpio)) {
    return { tipo: "INVALIDO", valido: false, mensaje: "Formato inválido" };
  }

  if (/[A-Z]/.test(limpio)) {
    return {
      tipo: "PASAPORTE",
      valido: limpio.length >= 6 && limpio.length <= 9,
      mensaje: limpio.length >= 6 && limpio.length <= 9 ? "Pasaporte válido" : "Pasaporte inválido",
    };
  }

  if (/^\d+$/.test(limpio)) {
    if (limpio.length >= 6 && limpio.length <= 10) {
      return { tipo: "CC", valido: true, mensaje: "Cédula válida" };
    }

    if (limpio.length === 9 || limpio.length === 10) {
      const base = limpio.slice(0, -1);
      const dv = parseInt(limpio.slice(-1), 10);
      const calc = calcularNITDV(base);
      return {
        tipo: "NIT",
        valido: dv === calc,
        mensaje: dv === calc ? "NIT válido" : "NIT inválido",
      };
    }

    return { tipo: "CE", valido: true, mensaje: "Cédula de extranjería válida" };
  }

  return { tipo: "INVALIDO", valido: false, mensaje: "Documento inválido" };
}

function formatNumberWithDots(value: string): string {
  if (!/^\d+$/.test(value)) return value; // si tiene letras, no se formatea
  return new Intl.NumberFormat("es-CO").format(Number(value));
}

export default memo(function IdentificationField({
  name,
  label,
  explain,
  value = "",
  validations,
  onChange,
  onValidationChange,
}: IdentificationFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [docInfo, setDocInfo] = useState<{ tipo: TipoDoc; valido: boolean; mensaje?: string } | null>(null);
  const debouncedValidationRef = useRef<number | null>(null);

  const [rawValue, setRawValue] = useState(value.replace(/\./g, ""));

  useEffect(() => {
    if (value) {
      setTouched(true);
      setRawValue(value.replace(/\./g, ""));
    }

    return () => {
      if (debouncedValidationRef.current) {
        window.clearTimeout(debouncedValidationRef.current);
      }
    };
  }, [value]);

  const required = validations?.find((v) => v.name === "required")?.value as boolean;

  const validate = (inputValue: string): boolean => {
    if (!touched) return true;

    if (!required && inputValue.trim() === "") {
      setError(null);
      return true;
    }

    if (required && inputValue.trim() === "") {
      setError("Este campo es obligatorio");
      return false;
    }

    const info = validarDocumento(inputValue);
    setDocInfo(info);

    if (!info.valido) {
      setError(info.mensaje || "Documento inválido");
      return false;
    }

    setError(null);
    return true;
  };

  const handleDebouncedValidation = (inputValue: string) => {
    if (debouncedValidationRef.current) {
      window.clearTimeout(debouncedValidationRef.current);
    }

    debouncedValidationRef.current = window.setTimeout(() => {
      const isValid = validate(inputValue);
      onValidationChange?.(name, isValid, inputValue);
    }, 500);
  };

  return (
    <div className="space-y-2">
      <div className="flex-1">
        <Label htmlFor={name} className="text-sm font-light">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {explain && (
          <Label className="text-xs text-muted-foreground font-light">
            <TextViewer text={explain} />
          </Label>
        )}
      </div>
      <Input
        id={name}
        type="text"
        value={
          docInfo?.tipo === "PASAPORTE"
            ? rawValue // se escribe tal cual
            : formatNumberWithDots(rawValue) // numérico con miles
        }
        onChange={(e) => {
          let inputValue = e.target.value.replace(/\./g, "");
          setRawValue(inputValue);
          onChange(name, inputValue);
          handleDebouncedValidation(inputValue);
        }}
        onFocus={() => setTouched(true)}
        placeholder={`Ingrese ${label.toLowerCase()}`}
        className={`${error ? "border-destructive" : ""} placeholder:font-light`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && docInfo?.mensaje && (
        <p className="text-sm text-muted-foreground">Documento válido</p>
      )}
    </div>
  );
});
