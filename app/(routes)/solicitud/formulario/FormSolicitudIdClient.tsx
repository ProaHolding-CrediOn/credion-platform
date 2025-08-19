"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { mapPayloadFormToSteps } from "@/utils/mapPayloadFormToSteps";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import FormRenderer from "@/components/FormRenderer/FormRenderer";
import { Button } from "@/components/ui/button";
import { BlockState, FieldState, FormData } from "@/stores/formStore";
import { getInitialValueForType } from "@/lib/utils";
import { useFormSolicitud } from "./useFormSolicitud";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import TextViewer from "@/components/TextViewer/TextViewer";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export default function FormSolicitudIdClient() {
  const { isAuthenticated, loading } = useAuth();
  const { setFormData, setBlockStates, setFieldStates, setFormVersion, getFormVersion } = useFormSolicitud();
  const [steps, setSteps] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [context, setContext] = useState('');
  const rehydrated = useFormSolicitud.getState().rehydrated
  const submitted = useFormSolicitud.getState().submitted

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/verificacion/telefono";
    }

    const fetchForm = async () => {
      try {
        const response = await fetch('/api/forms/solicitud', {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (!response.ok) {
          throw new Error("Error al cargar el formulario");
        }

        const data = await response.json();
        const mappedSteps = mapPayloadFormToSteps(data);
        if (getFormVersion() !== data?.version) {
            console.log('Version diferente, resetteando el formulario')
            setFormVersion(data?.version || 1)
            useFormSolicitud.getState().resetForm()
        }
        setContext(data?.context || '')
        setSteps(mappedSteps);
      } catch (error) {
        console.error("No se pudo cargar el formulario:", error);
      }
    };

    fetchForm();
  }, [isAuthenticated, loading]);

  useEffect(() => {
    const state = useFormSolicitud.getState();

    const isAlreadyLoaded = Object.keys(state.formData || {}).length > 0
    if (isAlreadyLoaded) {
      return
    }

    if (!!steps) {
      const initialFormData: FormData = {}
      const initialBlockStates: BlockState = {}
      const initialFieldStates: FieldState = {}

      steps.forEach((step, stepIndex) => {
        const layoutId = `Paso ${stepIndex + 1}`
        initialFormData[layoutId] = {}
        initialBlockStates[stepIndex] = {}
        initialFieldStates[stepIndex] = {};

        step.blocks.forEach((block: any) => {
          const blockName = block.blockName

          initialFormData[layoutId][blockName] = {}
          initialBlockStates[stepIndex][blockName] = false
          initialFieldStates[stepIndex][blockName] = {}

          block.form.fields.forEach((field: any) => {
            initialFormData[layoutId][blockName][field.name] = {
              label: field.label,
              value: getInitialValueForType(field.type),
              type: field.type,
              validation: field.validation
            }

            const hasValidation = field?.validation
            const isRequired = field?.validation?.some((v: any) => v.name === 'required' && v.value === true)

            if (hasValidation) {
              initialFieldStates[stepIndex][blockName][field.name] = !isRequired
            }
          })

          if (block.blockType === 'conditionalFormBlock') {
            initialFormData[layoutId][blockName]['Condicion'] = {
              label: block.label,
              value: "",
              type: 'Conditional',
              validation: []
            }
          }
        })
      })

      setFormData(initialFormData);
      setBlockStates(initialBlockStates);
      setFieldStates(initialFieldStates);
    }
  }, [steps, setFormData, setBlockStates]);

  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/forms/solicitud', {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ formSolicitud: formData, version: getFormVersion() }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar el formulario');
      }

      setDialogMessage('Gracias por su información, prontamente nos estaremos comunicando.')
      setShowDialog(true);
      await useFormSolicitud.getState().resetForm()
      await useFormSolicitud.getState().setSubmitted(true)
      return true
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      setDialogMessage('Ha ocurrido un error. Por favor, intenta nuevamente.')
      setShowDialog(true);
      await useFormSolicitud.getState().setSubmitted(false)
      throw error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    window.location.href = "/";
  }

  const handleNewRequest = () => {
    useFormSolicitud.getState().resetForm();
    useFormSolicitud.getState().setSubmitted(false);
    window.location.reload();
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4 p-8">
        <h2 className="text-xl font-semibold">¡Gracias por tu solicitud!</h2>
        <p className="text-muted-foreground">Tu información fue enviada con éxito. Nos pondremos en contacto contigo pronto.</p>

        <Button onClick={handleNewRequest}>
          Enviar nueva solicitud
        </Button>
      </div>
    );
  }

  if (loading || !steps.length) {
    return (
      <div className="flex flex-col bg-background text-foreground">
        <main className="flex-1 w-full">
          <div className="w-full p-4 sm:p-6 md:p-8">
            <p className="text-muted-foreground">Cargando formulario...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!rehydrated) {
    return (
      <div className="flex flex-col bg-background text-foreground">
        <main className="flex-1 w-full">
          <div className="w-full p-4 sm:p-6 md:p-8">
            <p className="text-muted-foreground">Cargando formulario guardado...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen">
      <main className="flex w-full flex-1 items-start justify-center px-4 py-8 sm:px-6 md:px-8">
        <div className="w-full max-w-2xl space-y-6">
          {!showForm && !loading ? (
            <div className="bg-card sm:bg-card sm:rounded-lg sm:shadow-md p-4 md:p-6 w-full space-y-4">
                <div className="flex flex-col items-center mb-6">
                    <Image
                        src="/logo_text.svg"
                        alt="Logo Credion"
                        width={200}
                        height={100}
                    />
                </div>
                <h1 className="text-lg md:text-xl text-center font-light text-foreground">
                    Hola, comencemos con tu solicitud
                </h1>
                {context && <Label className="text-sm text-foreground font-light">
                    <TextViewer text={context} />
                </Label>}
                <div className="flex items-center justify-center space-x-2">
                    <Input
                        id="aceptar-politicas"
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <Label htmlFor="aceptar-politicas" className="text-sm font-light">
                        Acepto los{' '}
                        <Link href="/terminos-de-uso" className="text-primary hover:underline">
                            Términos de Uso
                        </Link>{' '}
                        y las{' '}
                        <Link href="/politica-de-privacidad" className="text-primary hover:underline">
                            Políticas de Privacidad
                        </Link>
                    </Label>
                </div>
                <div className="flex items-center justify-center">
                    <Button
                        variant='outline'
                        onClick={() => setShowForm(true)}
                        className="group w-full sm:w-auto justify-center"
                        disabled={!isChecked}
                    >
                        Haz click para comenzar
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
          ) : (
            <main className="flex w-full flex-1 items-start justify-center sm:px-6 md:px-8">
                <div className="w-full max-w-2xl space-y-6">
                    <div className="flex flex-col items-center">
                        <Image src="/logo_text.svg" alt="Logo" width={200} height={100} className="mx-auto" />
                        <Label className="text-muted-foreground text-sm mt-2">F-AC-02</Label>
                    </div>
                    <FormRenderer steps={steps} onSubmit={handleSubmit} submitting={submitting} store={useFormSolicitud} />
                </div>
            </main>
          )}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMessage.includes("error") ? "Error" : "Éxito"}</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <Button onClick={handleDialogClose}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}