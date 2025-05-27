"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 👇 Tipos compartidos

export interface MessageField {
  type: "message";
  lines: string[];
}

export interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select";
  required?: boolean;
  options?: Array<{ label: string; value: string | number }>;
}

export interface ConditionalFormBlock {
  blockType: "conditionalFormBlock";
  label: string;
  options: Array<{ label: string; value: string }>;
  expectedAnswers: Array<{ value: string }>;
  form: {
    title: string;
    fields: Field[];
  };
}

export interface FormBlock {
  blockType: "formBlock";
  form: {
    title: string;
    fields: Field[];
  };
}

type EnhancedField = Field | MessageField | ConditionalFormBlock | FormBlock;

interface FieldRendererProps {
  field: EnhancedField;
  formData: Record<string, any>;
  handleInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

// 👇 Type Guards

export const isMessageField = (field: EnhancedField): field is MessageField => {
  return "lines" in field && field.type === "message";
};

export const isRegularField = (field: EnhancedField): field is Field => {
  return "name" in field && ["text", "email", "number", "textarea", "select"].includes(field.type);
};

export const isConditionalFormBlock = (field: EnhancedField): field is ConditionalFormBlock => {
  return "blockType" in field && field.blockType === "conditionalFormBlock";
};

export const isFormBlock = (field: EnhancedField): field is FormBlock => {
  return "blockType" in field && field.blockType === "formBlock";
};

// 👇 Componente FieldRenderer

export default function FieldRenderer({
  field,
  formData,
  handleInputChange,
  errors,
}: FieldRendererProps) {
  if (isMessageField(field)) {
    console.log('Es mensaje', field)
    return (
      <div key={`message`} className="space-y-2">
        {field.lines.map((line, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
    );
  }

  if (isConditionalFormBlock(field)) {
    console.log('Es condicional', field)
    const selectedOption = formData[field.label] || "";

    return (
      <div key={`conditional`} className="space-y-4">
        {/* Pregunta */}
        <div className="space-y-2">
          <p className="font-medium text-foreground">{field.label}</p>
          <div className="flex gap-4">
            {field.options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`conditional`}
                  value={opt.value}
                  checked={selectedOption === opt.value}
                  onChange={() =>
                    handleInputChange(field.label, opt.value)
                  }
                  className="accent-black"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Mostrar formulario si se cumple la condición */}
        {field.expectedAnswers.some(
          (ans) => ans.value === selectedOption
        ) &&
          field.form &&
          Array.isArray(field.form.fields) && (
            <div className="border border-border rounded-md p-4 bg-muted/30 space-y-4 mt-2">
              <h3 className="font-semibold text-sm text-foreground">
                {field.form.title}
              </h3>
              {field.form.fields.map((subField) => (
                <div key={subField.name} className="space-y-2">
                  <Label htmlFor={subField.name}>
                    {subField.label}
                  </Label>
                  {subField.type === "text" && (
                    <Input
                      id={subField.name}
                      value={formData[subField.name] || ""}
                      onChange={(e) =>
                        handleInputChange(subField.name, e.target.value)
                      }
                    />
                  )}
                  {subField.type === "select" && subField.options && (
                    <Select
                      onValueChange={(value) => handleInputChange(subField.name, value)}
                      value={formData[subField.name]}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        {subField.options.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors[subField.name] && (
                    <p className="text-sm text-destructive">{errors[subField.name]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
    );
  }

  if (isFormBlock(field)) {
    console.log('Es normal', field)
    return (
      <div key={`formblock`} className="space-y-4">
        <h3 className="font-medium text-foreground">{field.form.title}</h3>
        {field.form.fields.map((subField) => (
          <div key={subField.name} className="space-y-2">
            <Label htmlFor={subField.name}>
              {subField.label}
            </Label>
            {subField.type === "text" && (
              <Input
                id={subField.name}
                value={formData[subField.name] || ""}
                onChange={(e) =>
                  handleInputChange(subField.name, e.target.value)
                }
              />
            )}
            {subField.type === "select" && subField.options && (
              <Select
                onValueChange={(value) => handleInputChange(subField.name, value)}
                value={formData[subField.name]}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {subField.options.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors[subField.name] && (
              <p className="text-sm text-destructive">{errors[subField.name]}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (isRegularField(field)) {
    console.log('Es un campo', field)
    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name}>{field.label}</Label>

        {field.type === "text" && (
          <Input
            id={field.name}
            type="text"
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
          />
        )}

        {field.type === "select" && field.options && (
          <Select
            onValueChange={(value) => handleInputChange(field.name, value)}
            value={formData[field.name]}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {errors[field.name] && (
          <p className="text-sm text-destructive">{errors[field.name]}</p>
        )}
      </div>
    );
  }

  return null;
}