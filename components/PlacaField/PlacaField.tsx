"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import TextViewer from "../TextViewer/TextViewer";
import { PlacaFieldProps } from "./PlacaField.type";

export default memo(function PlacaField({
  name,
  label,
  explain,
  value = "",
  validations,
  onChange,
  onValidationChange,
}: PlacaFieldProps) {
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

  const validate = (inputValue: string): boolean => {
    if (!touched) return true;

    const trimmed = inputValue.trim();

    if (required && !trimmed) {
      setError("Este campo es obligatorio");
      return false;
    }

    if (!trimmed) {
      setError(null);
      return true;
    }

    const placaRegex = /^[A-Z]{3}\d{2}[A-Z0-9]?$/;
    if (!placaRegex.test(trimmed)) {
      setError('Formato inválido. Use: "AAA00A"');
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

  const handleChange = (userInput: string) => {
    let clean = userInput.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let formatted = "";

    const letters = clean.slice(0, 3).replace(/[^A-Z]/g, "");
    formatted += letters;

    const numbers = clean.slice(letters.length, letters.length + 2).replace(/[^0-9]/g, "");
    formatted += numbers;

    const remaining = clean.slice(letters.length + numbers.length);
    if (remaining.length > 0 && /[A-Z0-9]/.test(remaining[0])) {
      formatted += remaining[0];
    }

    formatted = formatted.slice(0, 6);

    onChange(name, formatted);
    handleDebouncedValidation(formatted);
  }

  return (
    <div className="space-y-2">
      <div className="flex-1">
        <Label htmlFor={name} className="text-sm font-light">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {explain && <Label className="text-xs text-muted-foreground font-light">
          <TextViewer text={explain} />
        </Label>}
      </div>
      <Input
        id={name}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setTouched(true)}
        maxLength={6}
        placeholder={`Ingrese ${label.toLowerCase()}`}
        className={`${error ? "border-destructive" : ""} placeholder:font-light`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})