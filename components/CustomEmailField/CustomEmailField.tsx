"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@radix-ui/react-label";
import { CustomEmailFieldProps } from "./CustomEmailField.type";
import { Input } from "../ui/input";


export function CustomEmailField({
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

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (value) {
      setTouched(true);
      validate(value);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setTouched(true);
    const isValid = validate(newValue);
    onChange(name, newValue);
    onValidationChange?.(name, isValid, newValue);
  };

  const handleOnAttention = () => {
    setTouched(true);
    const isValid = validate(value);
    onValidationChange?.(name, isValid, value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        type="email"
        value={internalValue}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        placeholder="correo@example.com"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}