'use client'

import { useEffect, useState } from "react";
import { mapPayloadFormToSteps } from "@/utils/mapPayloadFormToSteps";
import { BlockState, FieldState, FormData } from "@/stores/formStore";
import { formatPrice, getInitialValueForType } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FormRenderer from "@/components/FormRenderer/FormRenderer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Step } from "@/types/FormField";
import { ArrowRightIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import TextViewer from "@/components/TextViewer/TextViewer";
import { useEstudioDeCredito } from "./useEstudioDeCredito";
import { EntryData } from "@/components/FormRenderer/BlockRenderer/MultiFormSelectorFormBlockRenderer";

export default function EstudioDeCreditoIdClient({ signedUrlId, token }: { signedUrlId: string, token: string }) {
    const router = useRouter()
    const { setFormData, setBlockStates, setFieldStates, setFormVersion, getFormVersion } = useEstudioDeCredito()
    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(true);
    const [validating, setValidating] = useState(true);
    const [steps, setSteps] = useState<any[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [creditId, setCreditId] = useState<string>('')
    const [customId, setCustomId] = useState<string>('')
    const [error, setError] = useState<boolean>(false)
    const [context, setContext] = useState('');
    const rehydrated = useEstudioDeCredito.getState().rehydrated
    const submitted = useEstudioDeCredito.getState().submitted

    const fetchForm = async (formSolicitud: FormData, formComplementario: FormData) => {
        setLoading(true)
        try {
            const response = await fetch('/api/forms/estudio')

            if (!response.ok) {
                throw new Error("Error al cargar el formulario");
            }

            const data = await response.json();
            const mappedSteps = mapPayloadFormToSteps(data);
            console.log('mappedSteps', mappedSteps)
            if (getFormVersion() !== data?.version) {
                console.log('Version diferente, resetteando el formulario')
                setFormVersion(data?.version || 1)
                useEstudioDeCredito.getState().resetForm()
            }
            setContext(data?.context || '')
            setSteps(mappedSteps)
            initialData(mappedSteps, formSolicitud, formComplementario)
        } catch (error) {
            console.error("No se pudo cargar el formulario:", error)
        } finally {
            setLoading(false)
        }
    }

    const flattenFormData = (formData: FormData) => {
        const flat: Record<string, any> = {}
        for (const layoutId in formData) {
            for (const blockName in formData[layoutId]) {
                for (const fieldName in formData[layoutId][blockName]) {
                    const key = `${blockName}.${fieldName}`
                    flat[key] = formData[layoutId][blockName][fieldName]?.value
                }
            }
        }
        return flat
    }

    const initialData = (steps: Step[], formSolicitud: FormData, formComplementario: FormData) => {
        const state = useEstudioDeCredito.getState()

        const isAlreadyLoaded = Object.keys(state.fieldStates).length > 0
        if (isAlreadyLoaded) {
            return
        }

        if (!!steps) {
            const initialFormData: FormData = {}
            const initialBlockStates: BlockState = {}
            const initialFieldStates: FieldState = {}


            const solicitudFlat = flattenFormData(formSolicitud)
            const complementarioFlat = flattenFormData(formComplementario)

            steps.forEach((step, stepIndex) => {
                const layoutId = `Paso ${stepIndex + 1}`
                initialFormData[layoutId] = {}
                initialBlockStates[stepIndex] = {}
                initialFieldStates[stepIndex] = {};

                step.blocks.forEach((block: any) => {
                    const blockName = block.blockName
                    initialFormData[layoutId][blockName] = {}
                    initialBlockStates[stepIndex][blockName] = true
                    initialFieldStates[stepIndex][blockName] = {}

                    if (block.blockType === 'multiFormSelectorBlock') {
                        console.log('block multiFormSelectorBlock', block)
                        const layoutId = `Paso ${stepIndex + 1}`;
                        const blockName = block.blockName;

                        const existingRaw =
                            (formSolicitud as any)?.[layoutId]?.[blockName] ??
                            (formComplementario as any)?.[layoutId]?.[blockName] ??
                            (solicitudFlat as any)[blockName] ??
                            (complementarioFlat as any)[blockName];

                        let parsed: Record<string, EntryData[]> = {};
                        if (existingRaw && typeof existingRaw === 'object' && !Array.isArray(existingRaw)) {
                            const hasArrays = Object.values(existingRaw).some((v: any) => Array.isArray(v));
                            if (hasArrays) parsed = existingRaw as Record<string, EntryData[]>;
                        }

                        if (!Object.keys(parsed).length) {
                            for (const opt of block.options ?? []) parsed[opt.label] = [];
                        }

                        (initialFormData as any)[layoutId][blockName] = parsed;

                        initialBlockStates[stepIndex][blockName] = true;
                        initialFieldStates[stepIndex][blockName] = {};
                        return;
                    } else {
                        block.form.fields.forEach((field: any) => {
                            const key = `${blockName}.${field.name}`
                            const existingValue = solicitudFlat[key] ?? complementarioFlat[key] ?? getInitialValueForType(field.type)

                            initialFormData[layoutId][blockName][field.name] = {
                                label: field.label,
                                value: existingValue,
                                type: field.type,
                                validation: field.validation
                            }

                            initialFieldStates[stepIndex][blockName][field.name] = true
                        })
                    }

                    

                    if (block.blockType === 'conditionalFormBlock') {
                        const key = `${blockName}.Condicion`
                        const existingValue = solicitudFlat[key] ?? complementarioFlat[key] ?? ""

                        initialFormData[layoutId][blockName]['Condicion'] = {
                            label: block.label,
                            value: existingValue,
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
                const response = await fetch(`/api/forms/estudio/validate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ signedUrlId, token }),
                });

                if (!response.ok) {
                    throw new Error("Error al validar el formulario");
                }

                const data = await response.json()
                setIsValid(true)
                setCreditId(data.creditId)
                setCustomId(data.customId)
                await fetchForm(data.formSolicitud, data.formComplementario)
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
            const response = await fetch('/api/forms/complementario', {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ creditId: creditId, formComplementario: formData, version: getFormVersion() }),
            })

            if (!response.ok) {
                throw new Error('Error al enviar el formulario');
            }

            setDialogMessage('Gracias por su información, prontamente nos estaremos comunicando.')
            setShowDialog(true);
            setError(false)
            await useEstudioDeCredito.getState().resetForm()
            return true
        } catch (error) {
            console.error('Error al enviar el formulario:', error)
            setDialogMessage('Ha ocurrido un error. Por favor, intenta nuevamente.')
            setShowDialog(true);
            setError(true)
            await useEstudioDeCredito.getState().setSubmitted(false)
            throw error
        } finally {
            setSubmitting(false);
        }
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        if (!error) window.location.href = "/";
    }

    const handleGoHome = () => {
        useEstudioDeCredito.getState().resetForm()
        useEstudioDeCredito.getState().setSubmitted(false)
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
                <h2 className="text-xl font-semibold">¡Hemos guardado la información!</h2>
                <p className="text-muted-foreground">La información ha sido almacenada.</p>

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
                            Estudio del credito #{customId}
                        </h1>
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
                                <Label className="text-muted-foreground text-sm mt-2">Información general</Label>

                            </div>
                            <FormRenderer
                                steps={steps}
                                onSubmit={handleSubmit}
                                submitting={submitting}
                                store={useEstudioDeCredito}
                            />
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