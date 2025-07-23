import { mapConditionalFormBlockToStep } from "./mapConditionalFormBlockToStep";
import { mapFormBlockToStep } from "./mapFormBlockToStep";
import { EnhancedBlock, LayoutStep, PayloadFormStep, Step } from "@/types/FormField";
import { mapMultiFormSelectorFormBlockToStep } from "./mapMultiFormSelectorFormBlockToStep";
import { mapPayoutDistributionFormBlockToStep } from "./mapPayoutDistributionFormBlockToStep";

export function mapPayloadFormToSteps(payloadData: any, amount?: number): Step[] {
  const steps: Step[] = [];

  if (!payloadData.layouts || !Array.isArray(payloadData.layouts)) {
    console.warn("Layouts no válidos o vacíos");
    return steps;
  }

  payloadData.layouts.forEach((layouts: LayoutStep, index: number) => {
    let step: Step | null = null;

    let blocks: EnhancedBlock[] = [];
    layouts.layout.forEach((block: PayloadFormStep) => {
      console.log('block', block);
      let layoutBlock: EnhancedBlock | null;
      switch (block.blockType) {
        case "formBlock":
          layoutBlock = mapFormBlockToStep(block);
          layoutBlock && blocks.push(layoutBlock);
          break;

        case "conditionalFormBlock":
          layoutBlock = mapConditionalFormBlockToStep(block);
          layoutBlock && blocks.push(layoutBlock);
          break;

        case "payoutDistributionBlock":
          layoutBlock = mapPayoutDistributionFormBlockToStep(block, amount as number);
          layoutBlock && blocks.push(layoutBlock);
          break;

        case "multiFormSelectorBlock":
          layoutBlock = mapMultiFormSelectorFormBlockToStep(block);
          layoutBlock && blocks.push(layoutBlock);
          break;

        default:
          console.warn(`Tipo de bloque desconocido`);
          break;
      }
    });

    if (blocks.length > 0) {
      step = { stepNumber: index + 1, title: `Paso ${index + 1}`, blocks: blocks };
      steps.push(step);
    }
  });

  return steps;
}