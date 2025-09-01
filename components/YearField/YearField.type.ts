import { FieldValidation } from "@/types/FormField";

export interface YearFieldProps {
  name: string;
  label: string;
  explain?: string;
  value?: number;
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: number) => void;
  onValidationChange?: (name: string, isValid: boolean, value: any) => void;
}
