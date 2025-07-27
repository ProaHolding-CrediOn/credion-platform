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
    value: string;
  },
  estado?: {
    id: string;
    value: string;
  },
  ciudad?: {
    id: string;
    value: string;
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
