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
  if (field.minLength) validations.push({ name: 'minLength', value: field.minLength });
  if (field.maxLength) validations.push({ name: 'maxLength', value: field.maxLength });
  if (field.minDate) validations.push({ name: 'minDate', value: field.minDate });
  if (field.maxDate) validations.push({ name: 'maxDate', value: field.maxDate });
  if (field.minValue) validations.push({ name: 'minValue', value: field.minValue });
  if (field.maxValue) validations.push({ name: 'maxValue', value: field.maxValue });

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
      return { country: { id: "", name: "" }, state: { id: "", name: "" }, city: { id: "", name: "" } };
    
    case "phoneField":
      return { countryCode: "", phoneCode: "", phone: "" };

    default:
      return "";
  }
}