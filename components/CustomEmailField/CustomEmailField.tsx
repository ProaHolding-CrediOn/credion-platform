"use client";

import React, { useState, useEffect, memo, useRef } from "react";
import { Label } from "@radix-ui/react-label";
import { CustomEmailFieldProps } from "./CustomEmailField.type";
import { Input } from "../ui/input";


export default memo(function CustomEmailField({
  name,
  label,
  value = "",
  validations = [],
  onChange,
  onValidationChange,
}: CustomEmailFieldProps) {
  const [internalValue, setInternalValue] = useState<string>(value);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedValidationRef = useRef<number | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

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

  const validate = (value: string): boolean => {
    if (!touched) return true;

    if (!required && value.trim() === "") {
      setError(null);
      return true;
    }

    if (required && value.trim() === "") {
      setError("Este campo es obligatorio");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setError("Correo electrónico inválido");
      return false;
    }

    setError(null);
    return true;
  };

  const handleChange = (inputValue: string) => {
    setInternalValue(inputValue);
    setTouched(true);
    onChange(name, inputValue);
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
        type="email"
        value={internalValue}
        onChange={(e) => {
          handleChange(e.target.value)
          handleDebouncedValidation(e.target.value)
        }}
        onBlur={() => setTouched(true)}
        placeholder="correo@example.com"
        className="placeholder:font-light"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})