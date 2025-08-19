import { FieldOption, FieldValidation } from "@/types/FormField";

export type OptionFieldValue = {
    label: string;
    value: string;
}

export type OptionsValue = {
    label: string;
    value: OptionFieldValue[];
}

export interface OptionsFieldProps {
  name: string;
  label: string;
  explain?: string;
  value?: OptionsValue[];
  options: Array<FieldOption>;
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: OptionsValue[]) => void;
  onValidationChange?: (name: string, isValid: boolean, value: any) => void;
  disabled?: boolean;
}