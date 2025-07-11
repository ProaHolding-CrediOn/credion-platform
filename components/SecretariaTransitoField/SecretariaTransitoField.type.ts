import { FieldValidation } from "@/types/FormField";

export interface TrafficSecretary {
  id: string;
  name: string;
  city?: {
    id: string;
    name: string;
    state?: {
      id: string;
      name: string
    }
  }
}

export type SecretariaLocationValue = {
  estado?: {
    id: string,
    nombre: string
  },
  ciudad?: {
    id: string,
    nombre: string
  },
  secretaria?: {
    id: string,
    nombre: string
  }
}

export interface SecretariaTransitoFieldProps {
  name: string;
  label: string;
  explain?: string;
  value?: SecretariaLocationValue;
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: SecretariaLocationValue) => void;
  onValidationChange?: (name: string, isValid: boolean, value: SecretariaLocationValue) => void;
}
