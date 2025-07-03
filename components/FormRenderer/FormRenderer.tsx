"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormRendererProps } from "./FormRenderer.type";
import BlockRenderer from "./BlockRenderer/BlockRenderer";
import ProgressBar from "../ProgressBar/ProgressBar";

export default function FormRenderer({ steps, onSubmit, submitting, store }: FormRendererProps) {
  const {
    formData,
    blockStates,
    currentStep,
    setCurrentStep,
    resetForm
  } = store();

  const currentStepData = steps[currentStep];
  const currentBlocks = currentStepData.blocks;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep]);

  const canGoToNextStep = () => {
    const layoutBlockStates = blockStates[currentStep]

    if (!layoutBlockStates) return false

    return Object.values(layoutBlockStates).every(Boolean)
  };

  const goToNextStep = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await onSubmit(formData)
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  };

  const handleResetForm = () => {
    resetForm()
    window.location.reload()
  };

  return (
    <>
      <div className="space-y-6 w-full">
        <h2 className="text-xl font-semibold text-foreground">{currentStepData.title}</h2>

        <div className="space-y-4 w-full">
          {currentBlocks.map((block, index) => (
            <BlockRenderer
              key={`block_${currentStep}_${index}`}
              block={block}
              blockKey={{ layout: currentStep, blockName: block.blockName }}
              store={store}
            />
          ))}

          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <Button variant="outline" onClick={goToPrevStep}>
                Atrás
              </Button>
            )}
            {currentStep === 0 && (
              <Button variant="outline" onClick={() => handleResetForm()}>
                Limpiar
              </Button>
            )}
            <Button className="ml-auto"
              onClick={() => {
                if (canGoToNextStep()) {
                  goToNextStep();
                }
              }} disabled={submitting ||!canGoToNextStep()}>
              {currentStep === steps.length - 1 ? "Enviar" : "Siguiente"}
            </Button>
          </div>
        </div>
      </div>

      <div className="m-6">
        <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      </div>     
    </>
  );
}