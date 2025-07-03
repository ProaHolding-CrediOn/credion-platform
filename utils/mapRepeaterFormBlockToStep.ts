import { getStepTitle, mapFormField } from "@/lib/utils";
import { PayloadFormStep, RepeatableFormBlock, Step } from "@/types/FormField";

export function mapRepeaterFormBlockToStep(
  block: PayloadFormStep,
  index: number
): Step | null {
  try {
    if (block.blockType !== "repeatableFormBlock") {
      console.warn(`Bloque no válido para este mapeador: ${block.blockType}`);
      return null;
    }
    const stepTitle = getStepTitle(block, index);

    const mappedFields: RepeatableFormBlock = {
      blockType: "repeatableFormBlock",
      header: block.header,
      add: block.add,
      form: {
        title: block.form.title,
        fields: block.form.fields.map(mapFormField)
      }
    };

    return {
      stepNumber: index + 1,
      title: stepTitle,
      blocks: [],
    };
  } catch (error) {
    console.error("Error al mapear repeaterFormBlock", error);
    return null;
  }
}