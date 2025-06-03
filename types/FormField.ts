export type BlockType = "formBlock" | "conditionalFormBlock" | "repeatableFormBlock";

export type EnhancedBlock = FormBlock | ConditionalFormBlock | RepeatableFormBlock;

export type EnhancedField = Field | MessageField;

export interface FieldOption {
  label: string;
  value: string | number;
  id: string;
}

export interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "message";
  required?: boolean;
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
  block: EnhancedBlock;
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
  form: {
    title: string;
    fields: EnhancedField[];
  };
}

export type PayloadFormStep = FormBlock | ConditionalFormBlock | RepeatableFormBlock;