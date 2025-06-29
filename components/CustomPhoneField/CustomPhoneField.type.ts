import { FieldValidation } from "@/types/FormField";

export interface CustomPhoneFieldProps {
  name: string;
  label: string;
  value?: string;
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: string) => void;
  onValidationChange?: (name: string, isValid: boolean, value: any) => void;
}

export interface Country {
    id: string;
    name: string;
    code: string;
    phoneCode: string;
}