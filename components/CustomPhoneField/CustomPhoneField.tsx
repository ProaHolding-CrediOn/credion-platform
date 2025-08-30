"use client";

import React, { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { Country, CustomPhoneFieldProps } from "./CustomPhoneField.type";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Check } from "lucide-react";
import { Input } from "../ui/input";
import { CountryFlagEmoji } from "../CountryFlagEmoji";
import { Button } from "../ui/button";
import TextViewer from "../TextViewer/TextViewer";

export default memo(function CustomPhoneField({
  name,
  label,
  explain,
  value = { codigoPais: "", codigoTelefono: "", telefono: "" },
  validations = [],
  onChange,
  onValidationChange,
}: CustomPhoneFieldProps) {
  const [countryCode, setCountryCode] = useState<string>("");
  const [phoneCode, setPhoneCode] = useState<string>("");
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
      setCountryCode(value.codigoPais || "CO")
      setPhoneCode(value.codigoTelefono || "57")
      setPhoneNumber(value.telefono || "")
    }
  }, [countries]);

  useEffect(() => {
    async function fetchCountries() {
        try {
          const response = await fetch('/api/countries')
          if (!response.ok) throw new Error()
          const data = await response.json()
          setCountries(data.docs);
        } catch (error) {
            console.log('Error al cargar países:', error);
        }
    }

    fetchCountries();
  }, []);

  const validate = (code: string, phoneCode: string, number: string): boolean => {
    if (!touched) return true;

    if (!required) {
      setError(null);
      return true;
    }

    if (!code || !phoneCode) {
      setError("Todos los campos son obligatorios");
      return false;
    }

    // Validación solo para Colombia
    if (phoneCode === '57' && number.length !== 10) {
      setError("El teléfono debe tener 10 dígitos");
      return false;
    } else if (phoneCode !== '57' && number.length < 5) {
      setError("El teléfono debe tener al menos 5 dígitos");
      return false;
    }

    if (!phoneCode || !(phoneCode.length > 0)) {
      setError("El código debe tener al menos 1 dígito");
      return false;
    }

    setError(null);
    return true;
  };

  const handleChange = (number: string) => {
    const isValid = validate(countryCode, phoneCode, number);
    const value = { codigoPais: countryCode, codigoTelefono: phoneCode, telefono: number };
    onChange(name, value);
    onValidationChange?.(name, isValid, value);
  }

  const handleCountryChange = (newCountryCode: string, newPhoneCode: string) => {
    setCountryCode(newCountryCode);
    setPhoneCode(newPhoneCode);
    const isValid = validate(newCountryCode, newPhoneCode, phoneNumber);
    setTouched(true);
    setOpen(!open);
    const value = { codigoPais: newCountryCode, codigoTelefono: newPhoneCode, telefono: phoneNumber };
    onChange(name, value);
    onValidationChange?.(name, isValid, value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const onlyNumbers = raw.replace(/\D/g, "").slice(0, 15);
    setPhoneNumber(onlyNumbers);
    setTouched(true);

    handleChange(onlyNumbers);
  };

  const filteredCountries = countries.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-light">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {explain && <Label className="text-xs text-muted-foreground font-light">
        <TextViewer text={explain} />
      </Label>}
      <div className="flex space-x-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
            >
              <CountryFlagEmoji countryCode={countryCode} />
              <span className="font-light">+{phoneCode}</span>
            </Button>
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
                      onSelect={() => handleCountryChange(country.code, country.phoneCode)}
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
          placeholder="Ingrese su numero"
          maxLength={15}
          className="placeholder:font-light"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})