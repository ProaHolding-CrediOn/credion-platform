import { FieldValidation } from "@/types/FormField";

export interface Country {
  id: string;
  code: string;
  name: string;
}

export interface State {
  id: string
  code: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
}

export interface LocationValue {
  country?: string;
  state?: string;
  city?: string;
}

export interface LocationFieldProps {
  name: string;
  label: string;
  value?: LocationValue;
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: LocationValue) => void;
  onValidationChange?: (name: string, isValid: boolean, value: LocationValue) => void;
}
