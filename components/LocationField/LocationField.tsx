"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@radix-ui/react-label";
import { City, Country, LocationFieldProps, LocationValue, State } from "./LocationField.type";
import CustomSelectField from "../CustomSelectField/CustomSelectField";
import { FieldOption } from "@/types/FormField";
import api from "@/lib/axiosInstance";


export function LocationField({
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
  const [cityId, setCityId] = useState<string | undefined>(undefined);
  const [cities, setCities] = useState<City[]>([]);

  const [countryCode, setCountryCode] = useState<string | undefined>(value.country);
  const [stateCode, setStateCode] = useState<string | undefined>(value.state);
  const [cityCode, setCityCode] = useState<string | undefined>(value.city);

  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const required = validations?.find(value => value.name === "required")?.value as boolean;

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
      if (!data.docs.some((s: State) => s.code === stateCode)) {
        setStateCode(undefined);
        setCityCode(undefined);
      }
    }

    fetchStates();
  }, [countryId]);

  useEffect(() => {
    if (!stateId) return;

    async function fetchCities() {
      const response = await api.get(`cities?where[state][equals]=${stateId}&limit=0&sort=name`);
      const data = response.data;
      setCities(data.docs);
      if (!data.docs.some((c: City) => c.name === cityCode)) {
        setCityCode(undefined);
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

    const isValid = !!(location.country && location.state && location.city);
    if (!isValid) {
      setError("Debe seleccionar país, estado y ciudad");
    } else {
      setError(null);
    }
    return isValid;
  };

  const handleCountryChange = (fieldName: string,code: string) => {
    const selectedCountry = countries.find((c) => c.code === code);
    if (!selectedCountry) return;

    setCountryCode(code);
    setCountryId(selectedCountry.id)
    setStateCode(undefined);
    setStateId(undefined);
    setCityCode(undefined);
    setCityId(undefined);

    const newLocation = { country: code };
    onChange(name, newLocation);
    onValidationChange?.(name, validate(newLocation), newLocation);
  };

  const handleStateChange = (fieldName: string, code: string) => {
    const selectedState = states.find((s) => s.code === code);
    if (!selectedState) return;

    setStateCode(code);
    setStateId(selectedState.id);
    setCityCode(undefined);
    setCityId(undefined);

    const newLocation = { country: countryCode, state: code };
    onChange(name, newLocation);
    onValidationChange?.(name, validate(newLocation), newLocation);
  };

  const handleCityChange = (fieldName: string, code: string) => {
    const selectedCity = cities.find((c) => c.name === code);
    if (!selectedCity) return;

    setCityCode(code);
    setCityId(selectedCity.id);

    const newLocation = { country: countryCode, state: stateCode, city: code };
    onChange(name, newLocation);
    onValidationChange?.(name, validate(newLocation), newLocation);
  };

  // Opciones para los comboboxes
  const countryOptions: Array<FieldOption> = countries.map((country) => ({
    id: country.id,
    label: country.name,
    value: country.code,
  }));

  const stateOptions: Array<FieldOption> = states.map((state) => ({
    id: state.id,
    label: state.name,
    value: state.code,
  }));

  const cityOptions: Array<FieldOption> = cities.map((city) => ({
    id: city.id,
    label: city.name,
    value: city.name,
  }));

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="flex flex-nowrap justify-between gap-2">
        <div className="w-[32%]">
          <CustomSelectField
            name={`${name}-country`}
            label="País"
            value={countryCode}
            options={countryOptions}
            validations={
              required ? [{ name: "required", value: true }] : []
            }
            onChange={handleCountryChange}
            onValidationChange={() => {}}
          />
        </div>

        <div className="w-[32%]">
          <CustomSelectField
            name={`${name}-state`}
            label="Estado"
            value={stateCode}
            options={stateOptions}
            validations={
              required ? [{ name: "required", value: true }] : []
            }
            onChange={handleStateChange}
            onValidationChange={() => {}}
          />
        </div>

        <div className="w-[32%]">
          <CustomSelectField
            name={`${name}-city`}
            label="Ciudad"
            value={cityCode}
            options={cityOptions}
            validations={
              required ? [{ name: "required", value: true }] : []
            }
            onChange={handleCityChange}
            onValidationChange={() => {}}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}