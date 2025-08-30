import { mapFormField } from "@/lib/utils";
import { EnhancedBlock, PayloadFormStep } from "@/types/FormField";

export function mapMultiFormSelectorFormBlockToStep(
  block: PayloadFormStep
): EnhancedBlock | null {
  try {
    if (block.blockType !== "multiFormSelectorBlock") {
      console.warn(`Bloque no válido para este mapeador: ${block.blockType}`);
      return null;
    }

    // const stepTitle = getStepTitle(block, index);

    const mappedFields: EnhancedBlock = {
      blockType: "multiFormSelectorBlock",
      blockName: block.blockName,
      introContent: block.introContent || "",
      value: block.value,
      label: block.label,
      required: block.required,
      options: block.options.map(option => ({
        label: option.label,
        maxEntries: option.maxEntries,
        forms: option.forms.map(form => ({
            type: form.type,
            question: form.question,
            questionAnswers: form.questionAnswers,
            expectedAnswer: form.expectedAnswer,
            form: {
              title: form.form.title,
              fields: form.form.fields.map(mapFormField)
            }
        }))
      }))
    };

    return mappedFields;
  } catch (error) {
    console.error("Error al mapear multiFormSelectorFormBlock", error);
    return null;
  }
}