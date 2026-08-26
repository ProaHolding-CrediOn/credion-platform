'use client'

/**
 * Formulario del que NACE un crédito de nómina o de libre inversión.
 *
 * Se parece al formulario público de vehículo (`solicitud/formulario`) —misma
 * verificación por SMS, mismo renderizador— con una diferencia: para entrar hace
 * falta una INVITACIÓN. El asesor la genera para un celular concreto y la manda;
 * no es una página abierta.
 *
 * Y a diferencia de los formularios que se abren con un enlace firmado, aquí el
 * crédito todavía no existe: se crea al enviar. Por eso el `uuid` de la
 * invitación viaja en el envío.
 */

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { mapPayloadFormToSteps } from '@/utils/mapPayloadFormToSteps'
import { construirEstadoInicial } from '@/utils/estadoInicialDelFormulario'
import FormRenderer from '@/components/FormRenderer/FormRenderer'
import TextViewer from '@/components/TextViewer/TextViewer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Store = {
  (): {
    setFormData: (d: unknown) => void
    setBlockStates: (d: unknown) => void
    setFieldStates: (d: unknown) => void
    setFormVersion: (v: unknown) => void
    getFormVersion: () => unknown
  }
  getState: () => {
    rehydrated: boolean
    submitted: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData: Record<string, any>
    resetForm: () => Promise<void> | void
    setSubmitted: (v: boolean) => Promise<void> | void
    getFormVersion: () => unknown
  }
}

type Props = {
  /** El identificador de la invitación, que viene en la URL. */
  uuid: string
  /** Ruta de `/api/forms/*` con la definición del formulario. */
  apiBase: 'nomina-solicitud' | 'libre-inversion-solicitud'
  store: Store
  title: string
}

/**
 * El marco de la página. Vive FUERA del componente A PROPÓSITO.
 *
 * Definido dentro del cuerpo, cada render creaba una función nueva; React la veía
 * como un componente DISTINTO y desmontaba y volvía a montar todo el subárbol
 * —el formulario entero— en cada cambio de estado.
 *
 * El daño no era el parpadeo: al desmontarse, los campos cancelaban en su
 * limpieza la validación con retardo de 500 ms que acababan de programar. Esa
 * validación no llegaba a correr nunca, `fieldStates` se quedaba en false y
 * «Siguiente» no se encendía por mucho que el cliente rellenara todo. El valor
 * sí se guardaba —vive en el store, no en el componente—, así que el formulario
 * parecía funcionar y no dejaba avanzar.
 *
 * El campo de radio se salvaba porque reporta su validez de forma síncrona, antes
 * de que llegue el desmontaje.
 */
function Envoltorio({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex w-full flex-1 items-start justify-center px-4 py-8 sm:px-6 md:px-8">
        <div className="w-full max-w-2xl space-y-6">{children}</div>
      </main>
    </div>
  )
}

export default function FormSolicitudInvitacionClient({ uuid, apiBase, store, title }: Props) {
  const { isAuthenticated, loading } = useAuth()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { setFormData, setBlockStates, setFieldStates, setFormVersion, getFormVersion } = store() as any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [steps, setSteps] = useState<any[]>([])
  const [context, setContext] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  /** null = todavía validando. false = el enlace no sirve. */
  const [invitacionOk, setInvitacionOk] = useState<boolean | null>(null)
  const [motivoInvalida, setMotivoInvalida] = useState('')

  const rehydrated = store.getState().rehydrated
  const submitted = store.getState().submitted

  // 1. ¿Vale el enlace? Se comprueba ANTES de mandar a nadie a verificarse por
  //    SMS: hacer que alguien pida un código para luego decirle que el enlace
  //    caducó es gastarle el tiempo y un mensaje.
  useEffect(() => {
    let vivo = true
    const validar = async () => {
      try {
        const res = await fetch(`/api/solicitud-invitacion/${uuid}`, { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!vivo) return
        if (!res.ok) {
          setInvitacionOk(false)
          setMotivoInvalida(data?.error || 'Este enlace no es válido.')
          return
        }
        setInvitacionOk(true)
      } catch {
        if (vivo) {
          setInvitacionOk(false)
          setMotivoInvalida('No pudimos validar el enlace. Revisa tu conexión e inténtalo de nuevo.')
        }
      }
    }
    validar()
    return () => {
      vivo = false
    }
  }, [uuid])

  // 2. Verificación por SMS. Al volver, el usuario aterriza en esta misma página.
  useEffect(() => {
    if (invitacionOk !== true) return
    if (!loading && !isAuthenticated) {
      const next = encodeURIComponent(window.location.pathname)
      window.location.href = `/verificacion/telefono?next=${next}`
    }
  }, [invitacionOk, loading, isAuthenticated])

  // 3. La definición del formulario.
  useEffect(() => {
    if (invitacionOk !== true || !isAuthenticated) return
    const cargar = async () => {
      try {
        const res = await fetch(`/api/forms/${apiBase}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        })
        if (!res.ok) throw new Error('No se pudo cargar el formulario')
        const data = await res.json()

        // Si el formulario cambió desde la última visita, lo guardado ya no
        // encaja con las preguntas: conservarlo mezclaría respuestas viejas con
        // campos nuevos.
        if (getFormVersion() !== data?.version) {
          await store.getState().resetForm()
          setFormVersion(data?.version)
        }
        const pasos = mapPayloadFormToSteps(data)
        setSteps(pasos)
        setContext(data?.context || '')

        /**
         * Sembrar el esqueleto ANTES de que el cliente pueda escribir.
         *
         * `updateField` no crea el camino al vuelo: escribe en
         * `formData['Paso N'][bloque][campo]` dando por hecho que ya existe. Sin
         * esto, la primera tecla lanzaba dentro del `set` de Zustand, el valor
         * no llegaba al estado y el campo se quedaba en blanco —el formulario se
         * veía bien y no respondía—. Además `blockStates` es lo que mira
         * `canGoToNextStep`, así que sin sembrarlo «Siguiente» no se enciende.
         *
         * Solo si no hay nada guardado: si el cliente vuelve a un borrador, lo
         * suyo manda y esto lo pisaría.
         */
        const guardado = store.getState().formData
        if (!guardado || Object.keys(guardado).length === 0) {
          const inicial = construirEstadoInicial(pasos)
          setFormData(inicial.formData)
          setBlockStates(inicial.blockStates)
          setFieldStates(inicial.fieldStates)
        }
      } catch {
        setDialogMessage('No pudimos cargar el formulario. Inténtalo de nuevo en unos minutos.')
        setShowDialog(true)
      }
    }
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitacionOk, isAuthenticated, apiBase])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (formData: any) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/solicitud-directa', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitacion: uuid,
          formulario: formData,
          version: getFormVersion(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        // El mensaje del servidor explica qué pasó (enlace usado, vencido, o de
        // otro celular). Sustituirlo por uno genérico dejaría a la persona sin
        // saber qué hacer.
        throw new Error(data?.error || 'No se pudo enviar la solicitud')
      }

      setDialogMessage('Recibimos tu solicitud. Te contactaremos muy pronto.')
      setShowDialog(true)
      await store.getState().resetForm()
      await store.getState().setSubmitted(true)
      return true
    } catch (error) {
      setDialogMessage(
        error instanceof Error ? error.message : 'Ha ocurrido un error. Inténtalo nuevamente.',
      )
      setShowDialog(true)
      await store.getState().setSubmitted(false)
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const cerrarDialogo = () => {
    setShowDialog(false)
  }

  if (invitacionOk === false) {
    return (
      <Envoltorio>
        <div className="space-y-4 rounded-lg bg-card p-6 text-center shadow-md">
          <Image src="/logo_text.svg" alt="Credion" width={200} height={100} className="mx-auto" />
          <h1 className="text-lg font-medium">No podemos abrir este formulario</h1>
          <p className="text-sm text-muted-foreground">{motivoInvalida}</p>
          <p className="text-sm text-muted-foreground">
            Escríbele a tu asesor para que te envíe un enlace nuevo.
          </p>
        </div>
      </Envoltorio>
    )
  }

  if (submitted) {
    return (
      <Envoltorio>
        <div className="space-y-4 rounded-lg bg-card p-8 text-center shadow-md">
          <h2 className="text-xl font-semibold">¡Gracias por tu solicitud!</h2>
          <p className="text-muted-foreground">
            Recibimos tu información. Un asesor la revisará y te contactará pronto con las
            condiciones de tu crédito.
          </p>
        </div>
      </Envoltorio>
    )
  }

  if (invitacionOk === null || loading || !rehydrated || (isAuthenticated && !steps.length)) {
    return (
      <Envoltorio>
        <p className="text-muted-foreground">Cargando formulario…</p>
      </Envoltorio>
    )
  }

  return (
    <>
      <Envoltorio>
        {!showForm ? (
          <div className="w-full space-y-4 p-4 sm:rounded-lg sm:bg-card sm:shadow-md md:p-6">
            <div className="mb-6 flex flex-col items-center">
              <Image src="/logo_text.svg" alt="Logo Credion" width={200} height={100} />
            </div>
            <h1 className="text-center text-lg font-light md:text-xl">
              Hola, comencemos con tu solicitud
            </h1>
            {context && (
              <Label className="text-sm font-light text-foreground">
                <TextViewer text={context} />
              </Label>
            )}
            <div className="flex items-center justify-center space-x-2">
              <Input
                id="aceptar-politicas"
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
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
                variant="outline"
                onClick={() => setShowForm(true)}
                className="group w-full justify-center sm:w-auto"
                disabled={!isChecked}
              >
                Haz click para comenzar
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="flex flex-col items-center">
              <Image src="/logo_text.svg" alt="Logo" width={200} height={100} className="mx-auto" />
              <Label className="mt-2 text-sm text-muted-foreground">{title}</Label>
            </div>
            <FormRenderer
              steps={steps}
              onSubmit={handleSubmit}
              submitting={submitting}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              store={store as any}
            />
          </div>
        )}
      </Envoltorio>

      <Dialog open={showDialog} onOpenChange={cerrarDialogo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMessage.includes('Recibimos') ? 'Listo' : 'Aviso'}</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <Button onClick={cerrarDialogo}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
