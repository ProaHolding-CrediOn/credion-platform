import { EnhancedField } from "@/types/FormField";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
      required: field.required || false,
      lines
    };
  }

  let fieldType: "text" | "email" | "number" | "textarea" | "select" = field.blockType || "text";
  
  let options = undefined;
  if (field.options && Array.isArray(field.options)) {
    options = field.options.map((opt: any) => ({
      label: opt.label,
      value: opt.value
    }));
  }

  return {
    name: field.name,
    label: field.label,
    type: fieldType,
    required: field.required || false,
    options
  };
}