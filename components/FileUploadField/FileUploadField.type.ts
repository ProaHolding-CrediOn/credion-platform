import { FieldValidation } from "@/types/FormField";

export type UploadStatus = "uploading" | "retrying" | "error";

export type UploadingFile = {
  file: File;
  id: string;
  progress: number;
  status: UploadStatus;
  /** Mensaje de error a mostrar (cuando status === "error"). */
  errorMsg?: string;
  /** Si el error admite reintento (muestra el botón "Reintentar"). */
  retryable?: boolean;
  /** Intento actual (1..N), para el texto "Reintentando…". */
  attempt?: number;
}

export type UploadedFile = {
  id: string;
  name: string;
}

export interface FileUploadFieldProps {
  name: string;
  label: string;
  explain?: string;
  value?: UploadedFile[];
  validations?: Array<FieldValidation>;
  onChange: (name: string, value: UploadedFile[]) => void;
  onValidationChange?: (name: string, isValid: boolean, value: UploadedFile[]) => void;
}
