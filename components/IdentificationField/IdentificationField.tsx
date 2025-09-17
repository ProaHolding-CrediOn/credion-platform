"use client";

import { memo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import TextViewer from "../TextViewer/TextViewer";
import { IdentificationFieldProps } from "./IdentificationField.type";

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
  const debouncedValidationRef = useRef<number | null>(null);

  const required =
    validations?.find((v) => v.name === "required")?.value as boolean;

  const isNumeric = (val: string) => /^\d+$/.test(val);

  const validate = (inputValue: string): boolean => {
    if (required && inputValue.trim() === "") {
      setError("Este campo es obligatorio");
      return false;
    }

    if (inputValue.trim() === "") {
      setError(null);
      return true;
    }

    if (isNumeric(inputValue)) {
      if (inputValue.length >= 6 && inputValue.length <= 10) {
        setError(null);
        return true;
      }
      if (inputValue.length >= 9 && inputValue.length <= 10) {
        setError(null);
        return true;
      }
      setError("Número de documento inválido");
      return false;
    }

    if (inputValue.length >= 3) {
      setError(null);
      return true;
    }

    setError("Documento inválido");
    return false;
  };

  const handleDebouncedValidation = (inputValue: string) => {
    if (debouncedValidationRef.current) {
      window.clearTimeout(debouncedValidationRef.current);
    }

    debouncedValidationRef.current = window.setTimeout(() => {
      const isValid = validate(inputValue);
      onValidationChange?.(name, isValid, inputValue);
    }, 300);
  };

  const formatValue = (val: string) => {
    if (isNumeric(val)) {
      return Number(val).toLocaleString("es-CO");
    }
    return val;
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
        value={formatValue(value)}
        onChange={(e) => {
          const inputValue = e.target.value.replace(/\./g, "").replace(/,/g, "");
          onChange(name, inputValue);
          handleDebouncedValidation(inputValue);
        }}
        onBlur={(e) => {
          const val = e.target.value.replace(/\./g, "").replace(/,/g, "");
          const isValid = validate(val);
          onValidationChange?.(name, isValid, val);
        }}
        placeholder={`Ingrese ${label.toLowerCase()}`}
        className={`${error ? "border-destructive" : ""} placeholder:font-light`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && value && <p className="text-sm text-muted-foreground">Documento válido</p>}
    </div>
  );
});
