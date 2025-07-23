import { mapFormField } from "@/lib/utils";
import { EnhancedBlock, PayloadFormStep, Step } from "@/types/FormField";

export function mapPayoutDistributionFormBlockToStep(
  block: PayloadFormStep,
  amount: number
): EnhancedBlock | null {
  try {
    if (block.blockType !== "payoutDistributionFormBlock") {
      console.warn(`Bloque no válido para este mapeador: ${block.blockType}`);
      return null;
    }

    // const stepTitle = getStepTitle(block, index);

    const mappedFields: EnhancedBlock = {
      blockType: "payoutDistributionFormBlock",
      blockName: block.blockName,
      introContent: block.introContent || "",
      value: block.value,
      label: block.label,
      amount,
      maxEntries: block.maxEntries,
      form: {
        title: block.form.title,
        fields: block.form.fields.map(mapFormField)
      }
    };

    return mappedFields;
  } catch (error) {
    console.error("Error al mapear payoutDistributionFormBlock", error);
    return null;
  }
}