import { isRegularField } from "@/components/FormRenderer/FieldRenderer/FieldRenderer";
import { FormFieldValue } from "@/stores/formStore";
import { EnhancedField, FieldType } from "@/types/FormField";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasRequiredFields(fields: EnhancedField[]) {
  return fields.some((field) => {
    if (isRegularField(field)) {
      return field.validation?.find((validation) => validation.name === "required")?.value as boolean === true;
    }
    return false;
  });
};

export function getStepTitle(block: any, index: number) {
  return block.introContent?.root?.children[0]?.children[0]?.text || `Paso ${index + 1}`;
}

export function extractMessageLines(field: any): string[] {
  return field.message?.root?.children?.flatMap((paragraph: any) =>
    paragraph.children
      .filter((child: any) => child.type === "text")
      .map((child: any) => child.text)
  ) || [];
}

export function mapFormField(field: any): EnhancedField {
  if (field.blockType === "message") {
    const lines = extractMessageLines(field);
    return {
      name: field.name || "",
      label: field.label || "",
      type: "message",
      lines
    };
  }

  let fieldType: FieldType = field.blockType || "text";
  
  let options = undefined;
  if (field.options && Array.isArray(field.options)) {
    options = field.options.map((opt: any) => ({
      label: opt.label,
      value: opt.value
    }));
  }

  let validations = [];
  if (field.required) validations.push({ name: 'required', value: true });
  if (field.pattern) validations.push({ name: 'pattern', value: field.pattern });
  if (field.minLength) validations.push({ name: 'minLength', value: field.minLength });
  if (field.maxLength) validations.push({ name: 'maxLength', value: field.maxLength });
  if (field.minDate) validations.push({ name: 'minDate', value: field.minDate });
  if (field.maxDate) validations.push({ name: 'maxDate', value: field.maxDate });
  if (field.minValue) validations.push({ name: 'minValue', value: field.minValue });
  if (field.maxValue) validations.push({ name: 'maxValue', value: field.maxValue });
  if (field.daysLeft) validations.push({ name: 'daysLeft', value: field.daysLeft });
  if (field.maxFiles) validations.push({ name: 'maxFiles', value: field.maxFiles });

  return {
    name: field.name,
    label: field.label,
    type: fieldType,
    validation: validations,
    options
  };
}

export function getInitialValueForType(type: string): FormFieldValue {
  switch (type) {
    case "countryStateCityField":
      return { pais: { id: "", nombre: "" }, estado: { id: "", nombre: "" }, ciudad: { id: "", nombre: "" } };
    
    case "phoneField":
      return { codigoPais: "", codigoTelefono: "", telefono: "" };

    case "secretariaTransitoField":
      return { estado: { id: "", nombre: "" }, ciudad: { id: "", nombre: "" }, secretaria: { id: "", nombre: "" } };

    case "fileUploadField":
      return [];

    default:
      return "";
  }
}

export const normalizeText = (text: string): string => {
  return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/gi, "");
}

export const formatPrice = (price: number) => new Intl.NumberFormat("es-CO").format(price);