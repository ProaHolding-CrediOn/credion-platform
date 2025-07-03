"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CustomTextFieldProps } from "./CustomTextField.type";

export default memo(function CustomTextField({
  name,
  label,
  value = "",
  validations,
  onChange,
  onValidationChange,
}: CustomTextFieldProps) {
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
  const maxLength = validations?.find(value => value.name === "maxLength")?.value as number;
  const minLength = validations?.find(value => value.name === "minLength")?.value as number;

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

    if (minLength > 0 && inputValue.length < minLength) {
      setError(`Debe tener al menos ${minLength} caracteres`);
      return false;
    }

    if (inputValue.length > maxLength) {
      setError(`Máximo ${maxLength} caracteres permitidos`);
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

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-light">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        type="text"
        value={value}
        onChange={(e) => {
          const inputValue = e.target.value;
          onChange(name, inputValue);
          handleDebouncedValidation(inputValue)
        }}
        onFocus={() => setTouched(true)}
        maxLength={maxLength}
        placeholder={`Ingrese ${label.toLowerCase()}`}
        className={`${error ? "border-destructive" : ""} placeholder:font-light`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})