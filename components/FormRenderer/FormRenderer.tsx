"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormRendererProps } from "./FormRenderer.type";
import BlockRenderer, { validateBlock } from "./BlockRenderer/BlockRenderer";
import ProgressBar from "../ProgressBar/ProgressBar";

export default function FormRenderer({ steps, onSubmit }: FormRendererProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("form_progress");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const initialFormData = steps.reduce((acc, step, index) => {
    const blockId = `block_${index}`;
    acc[blockId] = {};
    return acc;
  }, {} as Record<string, any>);
  
  const [formData, setFormData] = useState<Record<string, any>>(initialFormData);
  
  useEffect(() => {
    localStorage.setItem("form_progress", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (blockKey: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [blockKey]: {
        ...prev[blockKey],
        [field]: value
      }
    }));
  };

  const canGoToNextStep = (blockKey: string) => {
    const currentBlock = steps[currentStep].block;
    const errors = validateBlock(blockKey, currentBlock, formData);

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return false;
    }

    setErrors({});
    return true;
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
      setShowDialog(true);
      setFormData({});
      setErrors({});
      localStorage.removeItem("form_progress");
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const currentBlock = currentStepData.block;

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">{currentStepData.title}</h2>

        <div className="space-y-4">
          <BlockRenderer
            key={`${currentStep}`}
            block={currentBlock}
            formData={formData}
            blockKey={`block_${currentStep}`}
            handleInputChange={handleInputChange}
            errors={errors}
          />

          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <Button variant="outline" onClick={goToPrevStep}>
                Atrás
              </Button>
            )}
            <Button className="ml-auto" onClick={() => {
              if (canGoToNextStep(`block_${currentStep}`)) {
                goToNextStep();
              }
            }}>
              {currentStep === steps.length - 1 ? "Enviar" : "Siguiente"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gracias por tu envío</DialogTitle>
            <DialogDescription>
              Hemos recibido tu información y nos pondremos en contacto contigo pronto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex justify-end">
            <Button onClick={() => window.location.reload()}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}