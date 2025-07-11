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

export type LocationValue = {
  pais?: {
    id: string;
    name: string;
  },
  estado?: {
    id: string;
    name: string;
  },
  ciudad?: {
    id: string;
    name: string;
  }
}

export interface LocationFieldProps {
  name: string;
  label: string;
  explain?: string;
  value?: LocationValue;
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: LocationValue) => void;
  onValidationChange?: (name: string, isValid: boolean, value: LocationValue) => void;
}
