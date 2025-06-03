import { Field, EnhancedField } from "@/types/FormField";

export function isFieldRequiredAndEmpty(blockKey: string,field: EnhancedField, formData: Record<string, any>): boolean {
  if ("required" in field && field.required) {
    const value = formData[blockKey][field.name];
    return !value || (typeof value === "string" && value.trim() === "");
  }
  return false;
}

export function validateBlockFields(blockKey: string, fields: EnhancedField[], formData: Record<string, any>): Record<string, string> {
  const newErrors: Record<string, string> = {};

  fields.forEach((field) => {
    if ("required" in field && field.required && isFieldRequiredAndEmpty(blockKey, field, formData)) {
      newErrors[field.name] = "Este campo es obligatorio";
    }
  });

  return newErrors;
}