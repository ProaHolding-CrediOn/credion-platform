import { FieldValidation } from "@/types/FormField";

export interface CustomPhoneFieldProps {
  name: string;
  label: string;
  value?: { countryCode: string; phoneCode: string; phone: string };
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: { countryCode: string; phoneCode: string; phone: string }) => void;
  onValidationChange?: (name: string, isValid: boolean, value: any) => void;
}

export interface Country {
    id: string;
    name: string;
    code: string;
    phoneCode: string;
}