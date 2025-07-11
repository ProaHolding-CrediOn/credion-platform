export type BlockType = "formBlock" | "conditionalFormBlock" | "repeatableFormBlock" | "payoutDistributionBlock";

export type EnhancedBlock = FormBlock | ConditionalFormBlock | RepeatableFormBlock | PayoutDistributionBlock;

export type EnhancedField = Field | MessageField;

export type FieldType = "text" | "email" | "number" | "textarea" | "select" | "message" |
  "customTextField" | "customDateField" | "phoneField" | "radioButtonField" | "priceField" |
  "countryStateCityField" | "secretariaTransitoField" | "customTextareaField" | "fileUploadField" |
  "customNumberField";

export const fieldTypesArray = [
  "text",
  "email",
  "number",
  "textarea",
  "select",
  "message",
  "customTextField",
  "customDateField",
  "phoneField",
  "radioButtonField",
  "priceField",
  "countryStateCityField",
  "secretariaTransitoField",
  "customTextareaField",
  "fileUploadField",
  "customNumberField"
] as const;

export interface FieldValidation {
  name: string;
  value: string | number | boolean;
}

export interface FieldOption {
  label: string;
  value: string | number;
  id: string;
}

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  explain?: string;
  validation?: Array<FieldValidation>;
  options?: Array<FieldOption>;
}

export interface MessageField extends Field {
  type: "message";
  name: string;
  lines: string[];
}

export interface Step {
  stepNumber: number;
  title: string;
  blocks: EnhancedBlock[];
}

export interface RepeatableFormBlock {
  blockType: "repeatableFormBlock";
  blockName: string;
  introContent?: string;
  header: string;
  add: string;
  form: {
    title: string;
    fields: EnhancedField[];
  };
}

export interface PayoutDistributionBlock {
  blockType: "payoutDistributionBlock";
  blockName: string;
  introContent?: string;
  value: string;
  label: string;
  amount: number;
  maxEntries: number;
  form: {
    title: string;
    fields: EnhancedField[];
  };
}

export interface ConditionalFormBlock {
  blockType: "conditionalFormBlock";
  blockName: string;
  introContent?: string;
  value: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  expectedAnswers: Array<{ value: string }>;
  form: {
    title: string;
    fields: EnhancedField[];
  };
}

export interface FormBlock {
  blockType: "formBlock";
  blockName: string;
  introContent?: string;
  form: {
    title: string;
    fields: EnhancedField[];
  };
}

export interface LayoutStep {
  layout: Array<PayloadFormStep>;
}

export type PayloadFormStep = FormBlock | ConditionalFormBlock | RepeatableFormBlock | PayoutDistributionBlock;