import { FieldOption, FieldValidation } from "@/types/FormField";

export interface CustomRadioFieldProps {
  name: string;
  label: string;
  value?: string;
  options: Array<FieldOption>;
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: string) => void;
  onValidationChange?: (name: string, isValid: boolean, value: string) => void;
}