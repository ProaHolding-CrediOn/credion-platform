"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CustomNumberFieldProps } from "./CustomNumberField.type";
import TextViewer from "../TextViewer/TextViewer";

function formatNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (!cleaned) return "";
  return Number(cleaned).toLocaleString("es-CO");
}

export default memo(function CustomNumberField({
  name,
  label,
  explain,
  value = "",
  validations,
  onChange,
  onValidationChange,
}: CustomNumberFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const debouncedValidationRef = useRef<number | null>(null);

  useEffect(() => {
    if (value) {
      setTouched(true);
    }

    return () => {
      if (debouncedValidationRef.current) {
        window.clearTimeout(debouncedValidationRef.current);
      }
    }
  }, []);

  const required = validations?.find(value => value.name === "required")?.value as boolean;
  const maxValue = validations?.find(value => value.name === "maxValue")?.value as number || 250;
  const minValue = validations?.find(value => value.name === "minValue")?.value as number || 0;

  const validate = (inputValue: string): boolean => {
    if (!touched) return true;

    const cleaned = inputValue.replace(/\D/g, "");

    if (!required && cleaned === "") {
        setError(null);
        return true;
    }

    if (required && cleaned === "") {
      setError("Este campo es obligatorio");
      return false;
    }

    if (minValue && Number(cleaned) < minValue) {
      setError(`El valor minimo es ${formatNumber(String(minValue))}`);
      return false;
    }

    if (maxValue && Number(cleaned) > maxValue) {
      setError(`El valor máximo es ${formatNumber(String(maxValue))}`);
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
    }, 500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    onChange(name, formatted);
    handleDebouncedValidation(formatted);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-light">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {explain && <Label className="text-xs text-muted-foreground font-light">
        <TextViewer text={explain} />
      </Label>}
      <Input
        id={name}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setTouched(true)}
        placeholder={`Ingrese ${label.toLowerCase()}`}
        className={`${error ? "border-destructive" : ""} placeholder:font-light`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})