import { FieldValidation } from "@/types/FormField";

export interface CustomTextareaFieldProps {
  name: string;
  label: string;
  value?: string;
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: string) => void;
  onValidationChange?: (name: string, isValid: boolean, value: any) => void;
}