import { Field } from "@/types/FormField";

export type FieldRendererProps = {
    field: Field;
    formData: Record<string, any>;
    blockKey: string;
    handleInputChange: (blockKey: string, field: string, value: any) => void;
    errors: Record<string, string>;
};