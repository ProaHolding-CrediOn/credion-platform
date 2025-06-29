"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FormRendererProps } from "./FormRenderer.type";
import BlockRenderer from "./BlockRenderer/BlockRenderer";
import ProgressBar from "../ProgressBar/ProgressBar";

export default function FormRenderer({ steps, onSubmit, submitting }: FormRendererProps) {
  const [currentStep, setCurrentStep] = useState(0);  

  const currentStepData = steps[currentStep];
  const currentBlocks = currentStepData.blocks;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const initialFormData = steps.reduce((acc, step, index) => {
    const layoutId = `layout_${index}`;
    const blocks = step.blocks.reduce((blockAcc, block, blockIndex) => {
      const blockId = `block_${blockIndex}`; 
      let fields = block.form.fields.reduce((fieldAcc, field) => {
        fieldAcc[field.name] = {
          label: field.label,
          value: ''
        };
        return fieldAcc;
      }, {} as Record<any, any>);

      if (block.blockType === "conditionalFormBlock") {
        fields = {
          ...fields,
          [block.blockName]: {
            label: block.label,
            value: ''
          }
        }
      }

      blockAcc[blockId] = fields;
      return blockAcc;
    }, {} as Record<any, any>);
    acc[layoutId] = blocks;

    return acc;
  }, {} as Record<string, any>);
  
  const [formData, setFormData] = useState<Record<string, any>>(initialFormData);

  const initialBlockStates = steps.reduce((acc, step, index) => {
    step.blocks.forEach((block, blockIndex) => {
      acc[`block_${index}_${blockIndex}`] = { isValid: null };
    });
    return acc;
  }, {} as Record<string, { isValid: boolean | null}>);

  const [blockStates, setBlockStates] = useState<Record<string, { isValid: boolean | null }>>(initialBlockStates);
  
  const handleInputChange = (blockKey: any, field: string, label: string, value: any) => {
    const layoutId = `layout_${blockKey['layout']}`
    const blockId = `block_${blockKey['block']}`
    setFormData((prev) => ({
      ...prev,
      [layoutId]: {
        ...prev[layoutId],
        [blockId]: {
          ...prev[layoutId][blockId],
          [field]: {
            label,
            value
          },
        },
      }
    }));
  };

  const handleBlockValidation = useCallback((currentStep: number, blockIndex: number, isValid: boolean) => {
    setBlockStates(prev => ({
      ...prev,
      [`block_${currentStep}_${blockIndex}`]: {
        ...prev[`block_${currentStep}_${blockIndex}`],
        isValid
      }
    }));
  }, []);

  const canGoToNextStep = () => {
    const currentKeys = currentBlocks.map((_, index) => `block_${currentStep}_${index}`);
    return currentKeys.every(key => blockStates[key]?.isValid === true);
  };

  const handleSubmit = async () => {
    try {
      const result = await onSubmit(formData);
      if (result === true) {
        setFormData(initialFormData);
        setBlockStates(initialBlockStates); 
      }
    } catch (error) {
      console.error('Error en onSubmit:', error)
    }
  }

  const goToNextStep = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const goToPrevStep = () => {
    console.log('formData', formData)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
              formData={formData}
              blockKey={{ layout: currentStep, block: index }}
              handleInputChange={handleInputChange}
              onBlockValidation={(isValid) => handleBlockValidation(currentStep, index, isValid)}
            />
          ))}

          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <Button variant="outline" onClick={goToPrevStep}>
                Atrás
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