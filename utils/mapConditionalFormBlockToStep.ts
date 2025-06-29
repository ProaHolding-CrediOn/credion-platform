import { getStepTitle, mapFormField } from "@/lib/utils";
import { EnhancedBlock, PayloadFormStep, Step } from "@/types/FormField";

export function mapConditionalFormBlockToStep(
  block: PayloadFormStep
): EnhancedBlock | null {
  try {
    if (block.blockType !== "conditionalFormBlock") {
      console.warn(`Bloque no válido para este mapeador: ${block.blockType}`);
      return null;
    }

    // const stepTitle = getStepTitle(block, index);

    const mappedFields: EnhancedBlock = {
      blockType: "conditionalFormBlock",
      blockName: block.blockName,
      value: block.value,
      label: block.label,
      options: block.options,
      expectedAnswers: block.expectedAnswers,
      form: {
        title: block.form.title,
        fields: block.form.fields.map(mapFormField)
      }
    };

    return mappedFields;
  } catch (error) {
    console.error("Error al mapear conditionalFormBlock", error);
    return null;
  }
}