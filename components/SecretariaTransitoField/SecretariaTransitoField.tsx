"use client";

import React, { useState, useEffect, memo } from "react";
import { Label } from "@radix-ui/react-label";
import CustomSelectField from "../CustomSelectField/CustomSelectField";
import { FieldOption } from "@/types/FormField";
import { SecretariaLocationValue, SecretariaTransitoFieldProps, TrafficSecretary } from "./SecretariaTransitoField.type";
import { MapPin, MapPinIcon } from "lucide-react";
import TextViewer from "../TextViewer/TextViewer";

export default memo(function SecretariaTransitoField({
  name,
  label,
  explain,
  value = {},
  validations = [],
  onChange,
  onValidationChange,
}: SecretariaTransitoFieldProps) {
  const [trafficSecretaries, setTrafficSecretaries] = useState<TrafficSecretary[]>([]);
  const [locationValue, setLocationValue] = useState<SecretariaLocationValue>(value);
  const [stateId, setStateId] = useState<string | undefined>(locationValue?.estado?.id ?? undefined);

  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const required = validations?.find(value => value.name === "required")?.value as boolean;
  const fieldNameSecretariaTransito = 'secretariaDeTransito'

  useEffect(() => {
    async function fetchSecretaries() {
      try {
        const response = await fetch('/api/trafficSecretaries')
        if (!response.ok) throw new Error()
        const data = await response.json()
        setTrafficSecretaries(data.docs);
      } catch (error) {
        console.log('Error al cargar países:', error);
      }
    }

    fetchSecretaries();
  }, []);

  const validate = (location: SecretariaLocationValue): boolean => {
    if (!touched) return true;

    if (!required) {
      setError(null);
      return true;
    }

    const isValid = !!(location.estado && location.estado.nombre !== '' &&
        location.ciudad && location.ciudad.nombre !== '' &&
        location.secretaria && location.secretaria.nombre !== '');
    if (!isValid) {
      setError("Debe seleccionar estado y secretaría");
    } else {
      setError(null);
    }
    return isValid;
  };

  const handleStateChange = (fieldName: string, name: string) => {
    const selectedState = trafficSecretaries.find((s) => s.city?.state?.name === name);
    if (!selectedState) return;

    const data = {
        estado: { id: selectedState.city?.state?.id ?? '', nombre: selectedState.city?.state?.name ?? '' },
    };
    setLocationValue(data)
    setStateId(selectedState.city?.state?.id);

    onChange(fieldNameSecretariaTransito, data);
    onValidationChange?.(fieldNameSecretariaTransito, validate(data), data);
  };

  const handleCityChange = (fieldName: string, name: string) => {
    const selectedSecretary = trafficSecretaries.find((c) => c.city?.name === name);
    if (!selectedSecretary) return;

    const data = {
        estado: { id: selectedSecretary.city?.state?.id ?? '', nombre: selectedSecretary.city?.state?.name ?? '' },
        ciudad: { id: selectedSecretary.city?.id ?? '', nombre: selectedSecretary.city?.name ?? '' },
        secretaria: { id: selectedSecretary.id ?? '', nombre: selectedSecretary.name ?? '' },
    };
    setLocationValue(data)

    onChange(fieldNameSecretariaTransito, data);
    onValidationChange?.(fieldNameSecretariaTransito, validate(data), data);
  };

  const seen = new Set();
  const stateOptions: Array<FieldOption> = trafficSecretaries
    .map((trafficSecretary) => ({
        id: trafficSecretary.city?.state?.id ?? '',
        label: trafficSecretary.city?.state?.name ?? '',
        value: trafficSecretary.city?.state?.name ?? '',
    }))
    .filter((option) => {
        if (!option.id || seen.has(option.id)) return false;
        seen.add(option.id);
        return true;
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const cityOptions: Array<FieldOption> = trafficSecretaries
    .filter((trafficSecretary) => (trafficSecretary.city?.state?.id === stateId))
    .map((trafficSecretary) => {
        return {
            id: trafficSecretary?.city?.id ?? '',
            label: trafficSecretary?.city?.name ?? '',
            value: trafficSecretary?.city?.name ?? '',
        };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-light">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {explain && <Label className="text-xs text-muted-foreground font-light">
        <TextViewer text={explain} />
      </Label>}

      <div className="flex flex-nowrap justify-between gap-2" onClick={() => setTouched(true)}>
        <div className="w-[50%]">
          <CustomSelectField
            name={`${name}-state`}
            label="Departamento"
            value={locationValue.estado?.nombre}
            options={stateOptions}
            validations={
              required ? [{ name: "required", value: true }] : []
            }
            onChange={handleStateChange}
          />
        </div>

        <div className="w-[50%]">
          <CustomSelectField
            name={`${name}-city`}
            label="Ciudad"
            value={locationValue.ciudad?.nombre}
            options={cityOptions}
            disabled={!stateId}
            validations={
              required ? [{ name: "required", value: true }] : []
            }
            onChange={handleCityChange}
          />
        </div>
      </div>

      {locationValue.ciudad && locationValue.ciudad.id !== '' && (
        <span className="text-sm text-muted-foreground font-light">
          <MapPinIcon className="mr-1 w-4 h-4 inline-block" />
          {locationValue.secretaria?.nombre}
        </span>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})