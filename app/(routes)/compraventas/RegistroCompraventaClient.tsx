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
import { useFormCompraventa } from "./useFormCompraventa";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import TextViewer from "@/components/TextViewer/TextViewer";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export default function RegistroCompraventaClient() {
  const { isAuthenticated, loading } = useAuth();
  const { setFormData, setBlockStates, setFieldStates, setFormVersion, getFormVersion } = useFormCompraventa();
  const [steps, setSteps] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [context, setContext] = useState('');
  const rehydrated = useFormCompraventa((state) => state.rehydrated);
  const submitted = useFormCompraventa((state) => state.submitted);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/verificacion/telefono?next=%2Fcompraventas";
    }

    const fetchForm = async () => {
      try {
        // El GET no exige auth (requests.read es abierto), pero pasamos el
        // token si existe para mantener el mismo patrón de los otros forms.
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/forms/compraventa', {
          method: "GET",
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });

        if (!response.ok) {
          throw new Error("Error al cargar el formulario");
        }

        const data = await response.json();
        const mappedSteps = mapPayloadFormToSteps(data);
        if (getFormVersion() !== data?.version) {
            console.log('Version diferente, resetteando el formulario')
            useFormCompraventa.getState().resetForm()
            setFormVersion(data?.version || 1)
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
    const state = useFormCompraventa.getState();

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
          initialBlockStates[stepIndex][blockName] = block.form?.fields?.every((field: any) => {
              const required = field?.validation?.some((v: any) => v.name === 'required' && v.value === true)
              return !required
          }) ?? false
          initialFieldStates[stepIndex][blockName] = {}

          if (block.blockType === 'multiFormSelectorBlock') {
              initialBlockStates[stepIndex][blockName] = block.required ? false : true
          }

          if (block.blockType === 'payoutDistributionBlock' || block.blockType === 'multiFormSelectorBlock') {
              return
          }

          if (block.blockType === 'conditionalFormBlock') {
            initialFormData[layoutId][blockName]['Condicion'] = {
              label: block.label,
              value: "",
              type: 'Conditional',
              validation: []
            }
          }

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
      const response = await fetch('/api/forms/compraventa', {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ formCompraventa: formData, version: getFormVersion() }),
      })

      if (!response.ok) {
        // El proxy propaga el error del core; mostramos su mensaje si viene
        // (p.ej. datos inválidos o sesión OTP vencida) en vez del genérico.
        const data = await response.json().catch(() => null)
        const msg = data?.error ? String(data.error) : 'Error al enviar el formulario'
        const err = new Error(msg) as Error & { userMessage?: string }
        err.userMessage = msg
        throw err
      }

      await useFormCompraventa.getState().resetForm()
      await useFormCompraventa.getState().setSubmitted(true)
      return true
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      // Errores del core traen userMessage; los de red caen al genérico.
      const userMessage = (error as { userMessage?: string })?.userMessage
      setDialogMessage(userMessage || 'Ha ocurrido un error. Por favor, intenta nuevamente.')
      setShowDialog(true);
      await useFormCompraventa.getState().setSubmitted(false)
      throw error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
  }

  const handleNewRequest = () => {
    useFormCompraventa.getState().resetForm();
    useFormCompraventa.getState().setSubmitted(false);
    window.location.reload();
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4 p-8">
        <h2 className="text-xl font-semibold">¡Gracias! Tu registro quedó en revisión.</h2>
        <p className="text-muted-foreground">El equipo de Credion validará la información y te contactará.</p>

        <Button onClick={handleNewRequest}>
          Enviar nuevo registro
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
                    Registro de Compraventas
                </h1>
                <p className="text-sm text-center text-muted-foreground font-light">
                    Al enviar este formulario{' '}
                    <Link href="/politica-tratamiento-datos" className="text-primary hover:underline">
                        autorizas el tratamiento de tus datos personales
                    </Link>.
                </p>
                {context && <Label className="text-sm text-foreground font-light">
                    <TextViewer text={context} />
                </Label>}
                <div className="flex items-center justify-center">
                    <Button
                        variant='outline'
                        onClick={() => setShowForm(true)}
                        className="group w-full sm:w-auto justify-center"
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
                        <Label className="text-muted-foreground text-sm mt-2">Registro de Compraventas</Label>
                        <p className="text-xs text-muted-foreground font-light mt-1">
                            Al enviar este formulario{' '}
                            <Link href="/politica-tratamiento-datos" className="text-primary hover:underline">
                                autorizas el tratamiento de tus datos personales
                            </Link>.
                        </p>
                    </div>
                    <FormRenderer steps={steps} onSubmit={handleSubmit} submitting={submitting} store={useFormCompraventa} />
                </div>
            </main>
          )}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <Button onClick={handleDialogClose}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
