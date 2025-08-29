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
import { ArrowRightIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import TextViewer from "@/components/TextViewer/TextViewer";
import { TimeLeft, TimerForm } from "@/components/TimeForm";
import { getJwtExpiryDate } from "@/lib/tokenExpiryTime";

export default function FormVehiculoIdClient({ signedUrlId }: { signedUrlId: string }) {
    const router = useRouter()
    const { setFormData, setBlockStates, setFieldStates, setFormVersion, getFormVersion } = useFormVehiculo()
    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(true);
    const [validating, setValidating] = useState(true);
    const [steps, setSteps] = useState<any[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [creditId, setCreditId] = useState<string>('')
    const [user, setUser] = useState<{ name: string } | null>(null)
    const [error, setError] = useState<boolean>(false)
    const [context, setContext] = useState('');
    const rehydrated = useFormVehiculo.getState().rehydrated
    const submitted = useFormVehiculo.getState().submitted
    const [token, setToken] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [expired, setExpired] = useState(false);
    const limitTo15Minutes = true;

    useEffect(() => {
        const storedToken = localStorage.getItem('token') || '';
        setToken(storedToken);
    }, []);

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
            if (getFormVersion() !== data?.version) {
                console.log('Version diferente, resetteando el formulario')
                useFormVehiculo.getState().resetForm()
                setFormVersion(data?.version || 1)
            }
            setContext(data?.context || '')
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
                setCreditId(data.creditId)
                setUser(data.user)
                await fetchForm()
            } catch (error) {
                setIsValid(false)
                console.error("Error al validar el formulario:", error)
            } finally {
                setValidating(false)
            }
        }

        validateForm()
    }, [signedUrlId])

    useEffect(() => {
        if (!token) {
            setExpired(true);
            return;
        }

        const handleTimeUp = () => {
            setTimeout(() => {
                window.location.reload();
            }, 30000);
        }

        const calculateMaxExpiry = () => {
            const expiryDate = getJwtExpiryDate(token);
            const now = Date.now();

            if (!expiryDate || expiryDate.getTime() <= now) {
                return now;
            }

            const tokenDurationMs = expiryDate.getTime() - now;

            if (limitTo15Minutes) {
                return now + Math.min(tokenDurationMs, 15 * 60 * 1000);
            } else {
                return now + tokenDurationMs;
            }
        };

        const finalExpiryTime = calculateMaxExpiry();

        const timer = setInterval(() => {
        const now = Date.now();
        const remainingMs = finalExpiryTime - now;

        if (remainingMs <= 0) {
            setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            setExpired(true);
            clearInterval(timer);
            handleTimeUp()
        } else {
            const hours = Math.floor(remainingMs / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
            const seconds = Math.floor((remainingMs / 1000) % 60);
            setTimeLeft({ hours, minutes, seconds });
            setExpired(false);
        }
        }, 1000);

        return () => clearInterval(timer);
    }, [token, limitTo15Minutes]);

    const handleDialogClose = () => {
        setShowDialog(false);
        if (!error) window.location.href = "/";
    }

    const handleGoHome = () => {
        useFormVehiculo.getState().resetForm()
        useFormVehiculo.getState().setSubmitted(false)
        window.location.href = "/"
    }

    if (validating) {
        return (
            <div className="flex flex-col bg-background text-foreground text-center">
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
            <div className="flex flex-col text-muted-foreground">
                <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 text-center p-6 sm:p-8">
                        <Image src="/logo.svg" alt="Logo" width={100} height={100} className="mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            Enlace no válido
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                            El enlace que intentas acceder no es válido o ha expirado. 
                            Por favor, contacta a tu asesor para obtener más información.
                        </p>
                        <Button
                            onClick={handleGoHome}
                            className="w-full"
                        >
                            Volver al inicio
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    const handleSubmit = async (formData: any) => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/forms/vehiculo', {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ creditId: creditId, formVehiculo: formData, version: getFormVersion() }),
            })

            if (!response.ok) {
                throw new Error('Error al enviar el formulario');
            }

            setDialogMessage('Gracias por su información, prontamente nos estaremos comunicando.')
            setShowDialog(true);
            setError(false)
            await useFormVehiculo.getState().resetForm()
            await useFormVehiculo.getState().setSubmitted(true)
            return true
        } catch (error) {
            console.error('Error al enviar el formulario:', error)
            setDialogMessage('Ha ocurrido un error. Por favor, intenta nuevamente.')
            setShowDialog(true);
            setError(true)
            await useFormVehiculo.getState().setSubmitted(false)
            throw error
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !steps.length) {
        return (
            <div className="flex flex-col bg-background text-foreground text-center">
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
            <div className="flex flex-col bg-background text-foreground text-center">
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
                            Hola <span className="font-semibold">{user?.name || 'Usuario'}</span>, has avanzado como no te imaginas!
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
                                <Label className="text-muted-foreground text-sm mt-2">F-AC-03</Label>
                            </div>
                            <FormRenderer
                                steps={steps}
                                onSubmit={handleSubmit}
                                submitting={submitting}
                                store={useFormVehiculo}
                            />
                        </div>
                        {token && <div className="fixed bottom-4 right-4">
                            <TimerForm key="timer-form-unique" timeLeft={timeLeft} expired={expired} />
                        </div>}
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