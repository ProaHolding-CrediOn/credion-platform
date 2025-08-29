import { mapFormField } from "@/lib/utils";
import { EnhancedBlock, PayloadFormStep, Step } from "@/types/FormField";

export function mapPayoutDistributionFormBlockToStep(
  block: PayloadFormStep,
  info: Record<string, any>
): EnhancedBlock | null {
  try {
    if (block.blockType !== "payoutDistributionBlock") {
      console.warn(`Bloque no válido para este mapeador: ${block.blockType}`);
      return null;
    }

    // const stepTitle = getStepTitle(block, index);

    const mappedFields: EnhancedBlock = {
      blockType: "payoutDistributionBlock",
      blockName: block.blockName,
      introContent: block.introContent || "",
      value: block.value,
      label: block.label,
      info,
      maxEntries: block.maxEntries,
      form: {
        title: block.form.title,
        fields: block.form.fields.map(mapFormField)
      }
    };

    return mappedFields;
  } catch (error) {
    console.error("Error al mapear payoutDistributionBlock", error);
    return null;
  }
}