import { Field, Step } from "@/components/FormRenderer";

export type PayloadField = {
  blockType: string;
  name?: string;
  label?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string | number }>;
  message?: {
    root: {
      children: Array<{
        children: Array<{ text: string; type: string }>;
      }>;
    };
  };
};

export type PayloadFormStep = {
  blockType: "formBlock" | "conditionalFormBlock";
  label?: string;
  options?: Array<{ label: string, value: string, id: string }>;
  expectedAnswers?: Array<{ value: string, id: string }>;
  form: {
    title: string;
    fields: PayloadField[];
  };
  introContent?: {
    root: {
      children: Array<{
        children: Array<{ text: string }>;
      }>;
    };
  };
};

export function mapPayloadFormToSteps(payloadData: any): Step[] {
  const steps: Step[] = [];

  payloadData.layout.forEach((block: PayloadFormStep, index: number) => {
    if (block.blockType === "formBlock") {
      const stepTitle = block.introContent?.root?.children[0]?.children[0]?.text || `Paso ${index + 1}`;

      const mappedFields = block.form.fields.map((field: any) => {
        // Si es un mensaje, lo devolvemos como objeto especial
        if (field.blockType === "message") {
          const lines = field.message?.root?.children?.flatMap((paragraph: any) =>
            paragraph.children
              .filter((child: any) => child.type === "text")
              .map((child: any) => child.text)
          ) || [];

          return {
            type: "message",
            lines,
          };
        }

        // Para campos normales
        let fieldType: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio" = "text";

        switch (field.blockType) {
          case "select":
            fieldType = "select";
            break;
          default:
            fieldType = "text";
        }

        let options = undefined;
        if (field.options && Array.isArray(field.options)) {
          options = field.options.map((opt: any) => ({
            label: opt.label,
            value: opt.value,
          }));
        }

        return {
          name: field.name,
          label: field.label,
          type: fieldType,
          required: field.required || false,
          options,
        };
      });

      steps.push({
        stepNumber: index + 1,
        title: stepTitle,
        fields: mappedFields,
      });
    }

    if (block.blockType === "conditionalFormBlock") {
      const stepTitle = block.introContent?.root?.children[0]?.children[0]?.text || `Paso ${index + 1}`;

      const label = block.label;
      const options = block.options;
      const expectedAnswers = block.expectedAnswers;

      const mappedFields = block.form.fields.map((field: any) => {
        // Si es un mensaje, lo devolvemos como objeto especial
        if (field.blockType === "message") {
          const lines = field.message?.root?.children?.flatMap((paragraph: any) =>
            paragraph.children
              .filter((child: any) => child.type === "text")
              .map((child: any) => child.text)
          ) || [];

          return {
            type: "message",
            lines,
          };
        }

        // Para campos normales
        let fieldType: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio" = "text";

        switch (field.blockType) {
          case "select":
            fieldType = "select";
            break;
          default:
            fieldType = "text";
        }

        let options = undefined;
        if (field.options && Array.isArray(field.options)) {
          options = field.options.map((opt: any) => ({
            label: opt.label,
            value: opt.value,
          }));
        }

        return {
          name: field.name,
          label: field.label,
          type: fieldType,
          required: field.required || false,
          options,
        };
      });

      steps.push({
        stepNumber: index + 1,
        title: stepTitle,
        fields: mappedFields,
        label,
        options,
        expectedAnswers
      });
    }
  });

  return steps;
}