"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FieldRenderer, { ConditionalFormBlock, Field, FormBlock, isRegularField, MessageField } from "./FieldRenderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type EnhancedField = Field | MessageField | ConditionalFormBlock | FormBlock;

interface Step {
  stepNumber: number;
  title: string;
  fields: EnhancedField[];
}

interface FormRendererProps {
  steps: Step[];
  onSubmit: (data: Record<string, any>) => void;
}

export default function FormRenderer({ steps, onSubmit }: FormRendererProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDialog, setShowDialog] = useState(false);

  // Cargar datos desde localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("form_progress");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem("form_progress", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCurrentStep = () => {
    const currentFields = steps[currentStep].fields.filter(
      (f): f is Field => isRegularField(f)
    );
    const newErrors: Record<string, string> = {};

    currentFields.forEach((field) => {
      const value = formData[field.name];
      if (field.required && (!value || (typeof value === "string" && value.trim() === ""))) {
        newErrors[field.name] = "Este campo es obligatorio";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
      setShowDialog(true);
      localStorage.removeItem("form_progress");
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const currentFields = currentStepData.fields;

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">{currentStepData.title}</h2>

        <div className="space-y-4">
          {currentFields.map((field, index) => (
            <FieldRenderer
              key={`${field}-${index}`}
              field={field}
              formData={formData}
              handleInputChange={handleInputChange}
              errors={errors}
            />
          ))}

          {/* Botones de navegación */}
          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <Button variant="outline" onClick={goToPrevStep}>
                Atrás
              </Button>
            )}
            <Button className="ml-auto" onClick={goToNextStep}>
              {currentStep === steps.length - 1 ? "Enviar" : "Siguiente"}
            </Button>
          </div>
        </div>
      </div>

      {/* Diálogo final */}
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