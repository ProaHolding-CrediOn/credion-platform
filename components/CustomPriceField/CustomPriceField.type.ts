import { FieldValidation } from "@/types/FormField";

export interface CustomPriceFieldProps {
  name: string;
  label: string;
  value?: number;
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: string | number) => void;
  onValidationChange?: (name: string, isValid: boolean, value: any) => void;
}