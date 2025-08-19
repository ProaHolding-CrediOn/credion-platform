import { FieldValidation } from "@/types/FormField";

export type ConceptDetailsValue = {
    label: string;
    value: Number;
    type: string;
}

export interface ConceptDetailsFieldProps {
  name: string;
  label: string;
  explain?: string;
  value?: ConceptDetailsValue[];
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: ConceptDetailsValue[]) => void;
  onValidationChange?: (name: string, isValid: boolean, value: any) => void;
  disabled?: boolean;
}