export type BlockType = "formBlock" | "conditionalFormBlock" | "repeatableFormBlock";

export type EnhancedBlock = FormBlock | ConditionalFormBlock | RepeatableFormBlock;

export type EnhancedField = Field | MessageField;

export type FieldType = "text" | "email" | "number" | "textarea" | "select" | "message" |
  "customTextField" | "customDateField" | "phoneField" | "radioButtonField" | "priceField" | "countryStateCityField";

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
  "countryStateCityField"
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
  header: string;
  add: string;
  form: {
    title: string;
    fields: EnhancedField[];
  };
}

export interface ConditionalFormBlock {
  blockType: "conditionalFormBlock";
  blockName: string;
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
  form: {
    title: string;
    fields: EnhancedField[];
  };
}

export interface LayoutStep {
  layout: Array<PayloadFormStep>;
}

export type PayloadFormStep = FormBlock | ConditionalFormBlock | RepeatableFormBlock;