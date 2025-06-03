import { mapConditionalFormBlockToStep } from "./mapConditionalFormBlockToStep";
import { mapRepeaterFormBlockToStep } from "./mapRepeaterFormBlockToStep";
import { mapFormBlockToStep } from "./mapFormBlockToStep";
import { PayloadFormStep, Step } from "@/types/FormField";

export function mapPayloadFormToSteps(payloadData: any): Step[] {
  const steps: Step[] = [];

  if (!payloadData.layout || !Array.isArray(payloadData.layout)) {
    console.warn("Layout no válido o vacío");
    return steps;
  }

  payloadData.layout.forEach((block: PayloadFormStep, index: number) => {
    let step: Step | null = null;

    switch (block.blockType) {
      case "formBlock":
        step = mapFormBlockToStep(block, index);
        break;

      case "conditionalFormBlock":
        step = mapConditionalFormBlockToStep(block, index);
        break;

      case "repeatableFormBlock":
        step = mapRepeaterFormBlockToStep(block, index);
        break;

      default:
        console.warn(`Tipo de bloque desconocido`);
        break;
    }

    if (step) {
      steps.push(step);
    }
  });

  return steps;
}