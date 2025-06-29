import { getStepTitle, mapFormField } from "@/lib/utils";
import { EnhancedBlock, PayloadFormStep } from "@/types/FormField";

export function mapFormBlockToStep(block: PayloadFormStep): EnhancedBlock | null {
  try {
    if (block.blockType !== "formBlock") {
      console.warn(`Bloque no válido para este mapeador: ${block.blockType}`);
      return null;
    }

    //const stepTitle = getStepTitle(block, index);

    const mappedFields: EnhancedBlock = {
      blockType: "formBlock",
      blockName: block.blockName,
      form: {
        title: block.form.title,
        fields: block.form.fields.map(mapFormField),
      },
    };

    return mappedFields;
  } catch (error) {
    console.error("Error al mapear formBlock", error);
    return null;
  }
}