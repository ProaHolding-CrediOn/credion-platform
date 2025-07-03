"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CustomPriceFieldProps } from "./CustomPriceField.type";

export default memo(function CustomPriceField({
  name,
  label,
  value = 0,
  validations,
  onChange,
  onValidationChange,
}: CustomPriceFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [internalValue, setInternalValue] = useState<string>();
  const debouncedValidationRef = useRef<number | null>(null);

  useEffect(() => {
    if (value) {
      setTouched(true);
      setInternalValue(formatPrice(value));
    }

    return () => {
      if (debouncedValidationRef.current) {
        window.clearTimeout(debouncedValidationRef.current);
      }
    }
  }, []);

  const required = validations?.find(value => value.name === "required")?.value as boolean;
  const maxValue = validations?.find(value => value.name === "maxValue")?.value as number;
  const minValue = validations?.find(value => value.name === "minValue")?.value as number;

  const validate = (value: number): boolean => {
    if (!touched) return true;

    if (!required && value === 0) {
        setError(null);
        return true;
    }

    if (required && value <= 0) {
      setError("Este campo es obligatorio");
      return false;
    }

    if (minValue && value < minValue) {
        setError(`El valor mínimo es ${minValue}`);
        return false;
    }

    if (maxValue && value > maxValue) {
        setError(`El valor máximo es ${maxValue}`);
        return false;
    }

    setError(null);
    return true;
  };

  function formatPrice(price: number) {
    return new Intl.NumberFormat("es-CO").format(price);
  };

  const parseNumber = (value: string): number => {
    if (!value) return 0;
    const cleaned = value?.replace(/\D/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  }

  const handleChange = (inputValue: string) => {
    const onlyNumbers = inputValue.replace(/\D/g, "");

    if (!onlyNumbers) {
        setInternalValue("");
        onChange(name, 0);
        onValidationChange?.(name, required ? false : true, 0);
        return;
    }

    const numericValue = parseInt(onlyNumbers, 10);
    const formattedValue = formatPrice(numericValue);

    setInternalValue(formattedValue);
    onChange(name, numericValue);
  }

  const handleDebouncedValidation = (inputValue: number) => {
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
      <div className="relative">
        <Input
            id={name}
            type="text"
            value={internalValue}
            onChange={(e) => {
              const inputValue = e.target.value;
              handleChange(inputValue)
              handleDebouncedValidation(parseNumber(inputValue))
            }}
            onFocus={() => setTouched(true)}
            placeholder={`0`}
            className={`pr-16 placeholder:font-light ${error ? "border-destructive" : ""}`}
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            COP
        </span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})