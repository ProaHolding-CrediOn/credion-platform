import { getStepTitle, mapFormField } from "@/lib/utils";
import { EnhancedBlock, PayloadFormStep, Step } from "@/types/FormField";

export function mapFormBlockToStep(block: PayloadFormStep, index: number): Step | null {
  try {
    if (block.blockType !== "formBlock") {
      console.warn(`Bloque no válido para este mapeador: ${block.blockType}`);
      return null;
    }

    const stepTitle = getStepTitle(block, index);

    const mappedFields: EnhancedBlock = {
      blockType: "formBlock",
      form: {
        title: block.form.title,
        fields: block.form.fields.map(mapFormField),
      },
    };

    return {
      stepNumber: index + 1,
      title: stepTitle,
      block: mappedFields,
    };
  } catch (error) {
    console.error("Error al mapear formBlock", error);
    return null;
  }
}