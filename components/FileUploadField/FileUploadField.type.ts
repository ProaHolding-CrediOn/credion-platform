import { FieldValidation } from "@/types/FormField";

export type UploadingFile = {
  file: File;
  id: string;
  progress: number;
  error: boolean;
}

export type UploadedFile = {
  id: string;
  name: string;
}

export interface FileUploadFieldProps {
  name: string;
  label: string;
  value?: UploadedFile[];
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: UploadedFile[]) => void;
  onValidationChange?: (name: string, isValid: boolean, value: UploadedFile[]) => void;
}