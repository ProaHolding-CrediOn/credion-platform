'use client'

import { useEffect, useState } from "react";
import { useFormVehiculo } from "./useFormVehiculo";
import { mapPayloadFormToSteps } from "@/utils/mapPayloadFormToSteps";
import { BlockState, FieldState, FormData } from "@/stores/formStore";
import { getInitialValueForType } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FormRenderer from "@/components/FormRenderer/FormRenderer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Step } from "@/types/FormField";

export default function FormVehiculoIdClient({ signedUrlId }: { signedUrlId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(true);
    const [validating, setValidating] = useState(true);
    const { setFormData, setBlockStates, setFieldStates } = useFormVehiculo()
    const [steps, setSteps] = useState<any[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const rehydrated = useFormVehiculo.getState().rehydrated
    const submitted = useFormVehiculo.getState().submitted

    const fetchForm = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/forms/vehiculo')

            if (!response.ok) {
                throw new Error("Error al cargar el formulario");
            }

            const data = await response.json();
            const mappedSteps = mapPayloadFormToSteps(data);
            console.log('mappedSteps', mappedSteps)
            setSteps(mappedSteps)
            initialData(mappedSteps)
        } catch (error) {
            console.error("No se pudo cargar el formulario:", error)
        } finally {
            setLoading(false)
        }
    }

    const initialData = (steps: Step[]) => {
        const state = useFormVehiculo.getState()

        const isAlreadyLoaded = Object.keys(state.fieldStates).length > 0
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
    }

    useEffect(() => {
        const validateForm = async () => {
            setValidating(true);
            try {
                const response = await fetch(`/api/forms/vehiculo/validate`, {
                    method: "POST",
                    body: JSON.stringify({ signedUrlId }),
                });

                if (!response.ok) {
                    throw new Error("Error al validar el formulario");
                }

                const data = await response.json()
                localStorage.setItem('token', data.token)
                setIsValid(true)
                console.log('Formulario validado con exito')
                await fetchForm()
            } catch (error) {
                setIsValid(false)
                console.error("Error al validar el formulario:", error)
                const timeout = setTimeout(() => {
                    router.push('/')
                }, 3000)
                return () => clearTimeout(timeout)
            } finally {
                setValidating(false)
            }
        }

        validateForm()
    }, [signedUrlId])

    if (validating) {
        return (
            <div className="flex flex-col bg-background text-foreground">
                <main className="flex-1 w-full">
                <div className="w-full p-4 sm:p-6 md:p-8">
                    <p className="text-muted-foreground">Verificando URL...</p>
                </div>
                </main>
            </div>
        )
    }

    if (!isValid && !validating) {
        return (
            <div className="flex flex-col bg-background text-foreground">
                <main className="flex-1 w-full">
                <div className="w-full p-4 sm:p-6 md:p-8">
                    <p className="text-muted-foreground">URL no válida, en un momento será redirigido</p>
                </div>
                </main>
            </div>
        )
    }

    const handleSubmit = async (formData: any) => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/forms/vehiculo', {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error('Error al enviar el formulario');
            }

            setDialogMessage('Gracias por su información, prontamente nos estaremos comunicando.')
            setShowDialog(true);
            await useFormVehiculo.getState().setSubmitted(true)
            return true
        } catch (error) {
            console.error('Error al enviar el formulario:', error)
            setDialogMessage('Ha ocurrido un error. Por favor, intenta nuevamente.')
            setShowDialog(true);
            await useFormVehiculo.getState().setSubmitted(false)
            throw error
        } finally {
            setSubmitting(false);
        }
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        window.location.href = "/";
    }

    const handleGoHome = () => {
        useFormVehiculo.getState().resetForm()
        useFormVehiculo.getState().setSubmitted(false)
        window.location.href = "/"
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
        )
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
        )
    }

    if (submitted) {
        return (
            <div className="text-center space-y-4 p-8">
                <h2 className="text-xl font-semibold">¡Gracias por la información!</h2>
                <p className="text-muted-foreground">Tu información fue enviada con éxito. Nos pondremos en contacto contigo pronto.</p>

                <Button onClick={handleGoHome}>
                    Ir al inicio
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-background text-foreground min-h-screen">
            <main className="flex w-full flex-1 items-start justify-center px-4 py-8 sm:px-6 md:px-8">
                <div className="w-full max-w-2xl space-y-6">
                <FormRenderer steps={steps} onSubmit={handleSubmit} submitting={submitting} store={useFormVehiculo} />
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