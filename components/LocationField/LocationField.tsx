"use client";

import React, { useState, useEffect, memo } from "react";
import { Label } from "@radix-ui/react-label";
import { City, Country, LocationFieldProps, LocationValue, State } from "./LocationField.type";
import CustomSelectField from "../CustomSelectField/CustomSelectField";
import { FieldOption } from "@/types/FormField";
import api from "@/lib/axiosInstance";

export default memo(function LocationField({
  name,
  label,
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
  const fieldNameResidencia = 'residencia'

  useEffect(() => {
    async function fetchCountries() {
      const response = await api.get('countries?limit=0&sort=name');
      const data = response.data;
      setCountries(data.docs);
    }

    fetchCountries();
  }, []);

  useEffect(() => {
    if (!countryId) return;

    async function fetchStates() {
      const response = await api.get(`states?where[country][equals]=${countryId}&limit=0&sort=name`);
      const data = response.data;
      setStates(data.docs);
    }

    fetchStates();
  }, [countryId]);

  useEffect(() => {
    if (!stateId) return;

    async function fetchCities() {
      const response = await api.get(`cities?where[state][equals]=${stateId}&limit=0&sort=name`);
      const data = response.data;
      setCities(data.docs);
    }

    fetchCities();
  }, [stateId]);

  const validate = (location: LocationValue): boolean => {
    if (!touched) return true;

    if (!required) {
      setError(null);
      return true;
    }

    const isValid = !!(location.country?.name && location.state?.name && location.city?.name);
    if (!isValid) {
      setError("Debe seleccionar país, estado y ciudad");
    } else {
      setError(null);
    }
    return isValid;
  };

  const handleCountryChange = (fieldName: string, name: string) => {
    const selectedCountry = countries.find((c) => c.name === name);
    if (!selectedCountry) return;

    const data = { country: { id: selectedCountry.id, name: selectedCountry.name }, state: { id: "", name: "" }, city: { id: "", name: "" } }
    setLocationValue(data);
    setCountryId(selectedCountry.id);

    onChange(fieldNameResidencia, data);
    onValidationChange?.(fieldNameResidencia, validate(data), data);
  };

  const handleStateChange = (fieldName: string, name: string) => {
    const selectedState = states.find((s) => s.name === name);
    if (!selectedState) return;

    const data = { ...locationValue, state: { id: selectedState.id, name: selectedState.name }, city: { id: "", name: "" } };
    setLocationValue(data)
    setStateId(selectedState.id);

    onChange(fieldNameResidencia, data);
    onValidationChange?.(fieldNameResidencia, validate(data), data);
  };

  const handleCityChange = (fieldName: string, name: string) => {
    const selectedCity = cities.find((c) => c.name === name);
    if (!selectedCity) return;

    const data = { ...locationValue, city: { id: selectedCity.id, name: selectedCity.name } };
    setLocationValue(data)

    onChange(fieldNameResidencia, data);
    onValidationChange?.(fieldNameResidencia, validate(data), data);
  };

  // Opciones para los comboboxes
  const countryOptions: Array<FieldOption> = countries.map((country) => ({
    id: country.id,
    label: country.name,
    value: country.name,
  }));

  if (countryOptions.length === 0 && locationValue.country?.id) {
    countryOptions.push({
      id: locationValue.country.id,
      label: locationValue.country.name,
      value: locationValue.country.name,
    });
    if (!countryId) setCountryId(locationValue.country.id);
  }

  const stateOptions: Array<FieldOption> = states.map((state) => ({
    id: state.id,
    label: state.name,
    value: state.name,
  }));

  if (stateOptions.length === 0 && locationValue.state?.id) {
    stateOptions.push({
      id: locationValue.state.id,
      label: locationValue.state.name,
      value: locationValue.state.name,
    });
    if (!stateId) setStateId(locationValue.state.id);
  }

  const cityOptions: Array<FieldOption> = cities.map((city) => ({
    id: city.id,
    label: city.name,
    value: city.name,
  }));

  if (cityOptions.length === 0 && locationValue.city?.id) {
    cityOptions.push({
      id: locationValue.city.id,
      label: locationValue.city.name,
      value: locationValue.city.name,
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-light">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="flex flex-nowrap justify-between gap-2">
        <div className="w-[32%]">
          <CustomSelectField
            name={`${name}-country`}
            label="País"
            value={locationValue.country?.name}
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
            value={locationValue.state?.name}
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
            value={locationValue.city?.name}
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