"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { Country, CustomPhoneFieldProps } from "./CustomPhoneField.type";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Check } from "lucide-react";
import { Input } from "../ui/input";
import { CountryFlagEmoji } from "../CountryFlagEmoji";
import api from "@/lib/axiosInstance";

export function CustomPhoneField({
  name,
  label,
  value = "",
  validations = [],
  onChange,
  onValidationChange,
}: CustomPhoneFieldProps) {
  const [countryCode, setCountryCode] = useState<string>("CO");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const required = validations?.find(value => value.name === "required")?.value as boolean;

  useEffect(() => {
    if (value) {
      setTouched(true);
      for (let len = 3; len >= 1; len--) {
        const prefix = value.substring(0, len);
        const country = countries.find((c) => c.phoneCode === prefix)
        if (country) {
          setCountryCode(country?.code);
          setPhoneNumber(value.substring(len));
          break;
        }
      }
    }
  }, [countries]);

  useEffect(() => {
    async function fetchCountries() {
        try {
          const response = await api.get('countries?limit=0&sort=name');
          const data = response.data;
          setCountries(data.docs);
        } catch (error) {
            console.log('Error al cargar países:', error);
        }
    }

    fetchCountries();
  }, []);

  useEffect(() => {
    if (countries.length > 0 && !countryCode) {
      setCountryCode("CO");
    }
  }, [countries]);  

  const validate = (code: string, number: string): boolean => {
    if (!touched) return true;

    if (!required) {
      setError(null);
      return true;
    }

    if (!code || !number || number.length !== 10) {
      setError("El teléfono debe tener al menos 10 dígitos");
      return false;
    }

    setError(null);
    return true;
  };

  const handleChange = (number: string) => {
    const country = countries.find((c) => c.code === countryCode);
    const dialCode = country?.phoneCode || "";
    const fullValue = dialCode + number;

    const isValid = validate(countryCode, number);
    onChange(name, fullValue);
    onValidationChange?.(name, isValid, fullValue);
  }

  const handleCountryChange = (newCode: string) => {
    setCountryCode(newCode);
    const country = countries.find((c) => c.code === newCode);
    const dialCode = country?.phoneCode || "";
    const fullValue = dialCode + phoneNumber;
    const isValid = validate(newCode, phoneNumber);
    setTouched(true);
    setOpen(!open);
    onChange(name, fullValue);
    onValidationChange?.(name, isValid, fullValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const onlyNumbers = raw.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(onlyNumbers);
    setTouched(true);

    handleChange(onlyNumbers);
  };

  const handleOnAttention = () => {
    setTouched(true);
    const isValid = validate(countryCode, phoneNumber);
    onValidationChange?.(name, isValid, value);
  };

  const selectedCountry = countries.find((c) => c.code === countryCode);
  const dialCode = selectedCountry?.phoneCode || "+57";
  const filteredCountries = countries.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex space-x-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-10 border rounded-md px-3 flex items-center justify-between w-[90px] bg-background text-sm cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <div className="flex items-center gap-1">
                <CountryFlagEmoji countryCode={countryCode} />
                <span>+{dialCode}</span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w[100px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar países..." value={searchTerm} onValueChange={setSearchTerm} />
              <CommandList>
                <CommandEmpty>No se encontraron países.</CommandEmpty>
                <CommandGroup>
                  {filteredCountries.map((country) => (
                    <CommandItem
                      key={country.id}
                      onSelect={() => handleCountryChange(country.code)}
                      className="cursor-pointer"
                      onClick={() => setTouched(true)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", country.code === countryCode ? "opacity-100" : "opacity-0")} />
                      <CountryFlagEmoji countryCode={country.code} />
                      <span>{country.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{country.phoneCode}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          type="tel"
          id={name}
          value={phoneNumber}
          onChange={handlePhoneChange}
          onFocus={() => setTouched(true)}
          placeholder="3101234567"
          maxLength={10}
          />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}