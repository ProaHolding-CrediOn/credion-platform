"use client";

import React, { useState, useEffect, memo } from "react";
import { Label } from "@radix-ui/react-label";
import { City, Country, LocationFieldProps, LocationValue, State } from "./LocationField.type";
import CustomSelectField from "../CustomSelectField/CustomSelectField";
import { FieldOption } from "@/types/FormField";
import TextViewer from "../TextViewer/TextViewer";

export default memo(function LocationField({
  name,
  label,
  explain,
  value = {},
  validations = [],
  onChange,
  onValidationChange,
}: LocationFieldProps) {
  const [countryId, setCountryId] = useState<string | undefined>(undefined);
  const [countries, setCountries] = useState<Country[]>([]);
  const [stateId, setStateId] = useState<string | undefined>(undefined);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [locationValue, setLocationValue] = useState<LocationValue>(value);

  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const required = validations?.find(value => value.name === "required")?.value as boolean;

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

  useEffect(() => {
    if (!countryId) return;

    async function fetchStates() {
      try {
        const response = await fetch(`/api/countries/${countryId}/states`)
        if (!response.ok) throw new Error()
        const data = await response.json()
        setStates(data.docs);
      } catch (error) {
        console.log('Error al cargar los estados:', error);
      }
    }

    fetchStates();
  }, [countryId]);

  useEffect(() => {
    if (!stateId) return;

    async function fetchCities() {
      try {
        const response = await fetch(`/api/countries/${countryId}/states/${stateId}/cities`)
        if (!response.ok) throw new Error()
        const data = await response.json()
        setCities(data.docs);
      } catch (error) {
        console.log('Error al cargar las ciudades:', error);
      }
    }

    fetchCities();
  }, [stateId]);

  const validate = (location: LocationValue): boolean => {
    if (!touched) return true;

    if (!required) {
      setError(null);
      return true;
    }

    const isValid = !!(location.pais && location.pais?.value !== '' &&
      location.estado && location.estado?.value !== '' &&
      location.ciudad && location.ciudad?.value !== '');
    if (!isValid) {
      setError("Debe seleccionar país, estado y ciudad");
    } else {
      setError(null);
    }
    return isValid;
  };

  const handleCountryChange = (fieldName: string, countryName: string) => {
    const selectedCountry = countries.find((c) => c.name === countryName);
    if (!selectedCountry) return;

    const data = { pais: { id: selectedCountry.id, value: selectedCountry.name }, estado: { id: "", value: "" }, ciudad: { id: "", value: "" } }
    setLocationValue(data);
    setCountryId(selectedCountry.id);

    onChange(name, data);
    onValidationChange?.(name, validate(data), data);
  };

  const handleStateChange = (fieldName: string, stateName: string) => {
    const selectedState = states.find((s) => s.name === stateName);
    if (!selectedState) return;

    const data = { ...locationValue, estado: { id: selectedState.id, value: selectedState.name }, ciudad: { id: "", value: "" } };
    setLocationValue(data)
    setStateId(selectedState.id);

    onChange(name, data);
    onValidationChange?.(name, validate(data), data);
  };

  const handleCityChange = (fieldName: string, cityName: string) => {
    const selectedCity = cities.find((c) => c.name === cityName);
    if (!selectedCity) return;

    const data = { ...locationValue, ciudad: { id: selectedCity.id, value: selectedCity.name } };
    setLocationValue(data)

    onChange(name, data);
    onValidationChange?.(name, validate(data), data);
  };

  // Opciones para los comboboxes
  const countryOptions: Array<FieldOption> = countries.map((country) => ({
    id: country.id,
    label: country.name,
    value: country.name,
  }));

  if (countryOptions.length === 0 && locationValue.pais?.id) {
    countryOptions.push({
      id: locationValue.pais.id,
      label: locationValue.pais.value,
      value: locationValue.pais.value,
    });
    if (!countryId) setCountryId(locationValue.pais.id);
  }

  const stateOptions: Array<FieldOption> = states.map((state) => ({
    id: state.id,
    label: state.name,
    value: state.name,
  }));

  if (stateOptions.length === 0 && locationValue.estado?.id) {
    stateOptions.push({
      id: locationValue.estado.id,
      label: locationValue.estado.value,
      value: locationValue.estado.value,
    });
    if (!stateId) setStateId(locationValue.estado.id);
  }

  const cityOptions: Array<FieldOption> = cities.map((city) => ({
    id: city.id,
    label: city.name,
    value: city.name,
  }));

  if (cityOptions.length === 0 && locationValue.ciudad?.id) {
    cityOptions.push({
      id: locationValue.ciudad.id,
      label: locationValue.ciudad.value,
      value: locationValue.ciudad.value,
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-light">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {explain && <Label className="text-xs text-muted-foreground font-light">
        <TextViewer text={explain} />
      </Label>}
      <div className="flex flex-nowrap justify-between gap-2" onClick={() => setTouched(true)}>
        <div className="w-[32%]">
          <CustomSelectField
            name={`${name}-country`}
            label="País"
            value={locationValue.pais?.value}
            options={countryOptions}
            validations={
              required ? [{ name: "required", value: true }] : []
            }
            onChange={handleCountryChange}
          />
        </div>

        <div className="w-[32%]">
          <CustomSelectField
            name={`${name}-state`}
            label="Estado"
            value={locationValue.estado?.value}
            options={stateOptions}
            validations={
              required ? [{ name: "required", value: true }] : []
            }
            onChange={handleStateChange}
          />
        </div>

        <div className="w-[32%]">
          <CustomSelectField
            name={`${name}-city`}
            label="Ciudad"
            value={locationValue.ciudad?.value}
            options={cityOptions}
            validations={
              required ? [{ name: "required", value: true }] : []
            }
            onChange={handleCityChange}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})