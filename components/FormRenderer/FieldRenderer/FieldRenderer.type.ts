import { Field } from "@/types/FormField";

export type FieldRendererProps = {
    field: Field;
    formData: Record<string, any>;
    blockKey: any;
    handleInputChange: (blockKey: string, field: string, label: string, value: any) => void;
    onFieldValidation?: (field: string, isValid: boolean) => void;
};