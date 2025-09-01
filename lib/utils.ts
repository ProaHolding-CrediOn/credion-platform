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

export function mapFormField(field: any): EnhancedField {
  let fieldType: FieldType = field.blockType || "text";

  let validations = [];
  if (field.required) validations.push({ name: 'required', value: true });
  if (field.pattern) validations.push({ name: 'pattern', value: field.pattern });
  if (field.minLength) validations.push({ name: 'minLength', value: field.minLength });
  if (field.maxLength) validations.push({ name: 'maxLength', value: field.maxLength });
  if (field.minDate) validations.push({ name: 'minDate', value: field.minDate });
  if (field.maxDate) validations.push({ name: 'maxDate', value: field.maxDate });
  if (field.minValue) validations.push({ name: 'minValue', value: field.minValue });
  if (field.maxValue) validations.push({ name: 'maxValue', value: field.maxValue });
  if (field.minYear) validations.push({ name: 'minYear', value: field.minYear });
  if (field.maxYear) validations.push({ name: 'maxYear', value: field.maxYear });
  if (field.daysLeft) validations.push({ name: 'daysLeft', value: field.daysLeft });
  if (field.yearsLeft) validations.push({ name: 'yearsLeft', value: field.yearsLeft });
  if (field.maxFiles) validations.push({ name: 'maxFiles', value: field.maxFiles });
  if (field.inputType) validations.push({ name: 'inputType', value: field.inputType });

  let options = undefined;
  if (field.options && Array.isArray(field.options)) {
    options = field.options.map((opt: any) => ({
      id: opt.id,
      label: opt.label,
      value: opt.value
    }));

    if (field.options.some((opt: any) => opt.allowExtraFields)) {
      const extraFields = field.options.reduce((acc: any, opt: any) => {
        if (!opt.allowExtraFields) return acc;
        return { ...acc, [opt.value]: opt.extraFields.map((extra: any) => ({
          id: extra.id,
          label: extra.fieldLabel,
          value: extra.fieldLabel,
          type: extra.fieldType,
          required: extra.required
        }))}
      }, {})

      validations.push({ name: 'extraFields', value: extraFields });
    }
  }

  if (field.concepts && Array.isArray(field.concepts)) {
    const concepts = field.concepts.map((opt: any) => ({
      id: opt.id,
      label: opt.label,
      required: opt.required,
      minValue: opt.minValue,
      explaination: opt.explaination
    }));

    validations.push({ name: 'concepts', value: concepts });
    validations.push({ name: 'minimumTotal', value: field.minimumTotal || 0 });
  }

  return {
    name: field.name,
    label: field.label,
    type: fieldType,
    explain: field.explain || '',
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

    case "optionsField":
      return {};

    case "conceptDetailsField":
      return [];

    default:
      return "";
  }
}

export const normalizeText = (text: string): string => {
  return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/gi, "");
}

export const formatPrice = (price: number) => new Intl.NumberFormat("es-CO").format(price);

export const numeroEnPalabras = (index: number): string => {
  const numero = index + 1;

  const unidades = [
    "primer", "segundo", "tercer", "cuarto", "quinto", "sexto", "séptimo", "octavo", "noveno", "decimo"
  ];

  if (numero >= 1 && numero <= 10) {
    return unidades[numero - 1];
  }

  return `${numero}º`;
}