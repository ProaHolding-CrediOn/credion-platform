'use client'

/**
 * Etapa B: la verificación de identidad con la cámara.
 *
 * Dos capturas EN VIVO (nunca "subir archivo", que es trivialmente burlable):
 * la cédula por el frente (cámara trasera si hay) y una selfie (cámara
 * frontal). El core coteja las caras con AWS Rekognition; con 3 rechazos el
 * canal se cierra y la firma pasa a presencial.
 *
 * Una regla que atraviesa todo el componente: NINGÚN fallo puede dejar al
 * cliente sin un botón que tocar. Los tres envíos ponen la fase en 'enviando',
 * que deshabilita a la vez «Verificar» y «Repetir las fotos»; si la petición
 * moría sin respuesta —cosa que en datos móviles pasa a menudo, y estas son las
 * peticiones más pesadas de la ceremonia— la pantalla se quedaba con los dos
 * botones en gris para siempre. De ahí que cada envío tenga su `try/catch` y
 * que el catch devuelva SIEMPRE a una fase accionable, conservando las fotos
 * para no obligar a repetirlas.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { avisoDeCamara, avisoDePruebaDeVida } from '@/utils/firma/avisoDeCamara'
import { SIN_CONEXION } from '@/utils/firma/avisoDeFallo'

// El SDK de Amplify solo vive en el navegador.
const DetectorDeVida = dynamic(() => import('./DetectorDeVida'), {
  ssr: false,
  loading: () => <p className="p-4 text-center">Cargando la prueba de vida…</p>,
})

type Props = {
  token: string
  sesion: string
  onAprobada: () => void
  /**
   * El servidor rechazo el testigo de la sesion (401). Aqui no se puede hacer
   * nada util con eso: lo resuelve la pantalla de arriba pidiendo otro codigo.
   */
  onSesionCaducada: () => void
  /** Config del core: si viene, la selfie se reemplaza por la prueba de vida. */
  liveness?: { disponible: boolean; region?: string; identityPoolId?: string }
}

/**
 * `canalCerrado` es terminal: se agotaron los tres intentos y la firma pasa a
 * presencial. Antes no existía, y agotar los intentos devolvía al cliente a la
 * pantalla de capturar con la cámara abierta —invitándole a un cuarto intento
 * imposible— bajo un mensaje que decía que su asesor le iba a llamar.
 */
type Fase = 'cedula' | 'selfie' | 'revisar' | 'enviando' | 'vida' | 'canalCerrado'

export default function PasoIdentidad({
  token,
  sesion,
  onAprobada,
  onSesionCaducada,
  liveness,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [fase, setFase] = useState<Fase>('cedula')
  const [cedula, setCedula] = useState('')
  const [selfie, setSelfie] = useState('')
  const [error, setError] = useState('')
  const [avisoCamara, setAvisoCamara] = useState<{ titulo: string; texto: string } | null>(null)
  const conVida = Boolean(liveness?.disponible && liveness.identityPoolId)
  const [sessionId, setSessionId] = useState('')
  // Cambiar este contador vuelve a disparar el efecto de la cámara. Hace falta
  // porque mientras se muestra el aviso NO se pinta el <video>: al pulsar
  // «Intentar de nuevo», `videoRef.current` todavía era null y el stream se
  // abría sin poder engancharse a nada — cámara encendida, recuadro en negro y
  // el botón de capturar sin efecto.
  const [intentoCamara, setIntentoCamara] = useState(0)

  const abrirCamara = useCallback(async (frontal: boolean) => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: frontal ? 'user' : 'environment', width: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setAvisoCamara(null)
    } catch (e) {
      // El motivo importa: «permite la cámara» no le sirve a quien la tiene
      // ocupada por otra app ni a quien abrió el enlace dentro de WhatsApp.
      setAvisoCamara(avisoDeCamara((e as { name?: string })?.name))
    }
  }, [])

  useEffect(() => {
    if (fase === 'cedula') abrirCamara(false)
    if (fase === 'selfie') abrirCamara(true)
    return () => streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [fase, abrirCamara, intentoCamara])

  const pararCamara = () => streamRef.current?.getTracks().forEach((t) => t.stop())

  const capturar = () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    if (fase === 'cedula') {
      setCedula(dataUrl)
      if (conVida) {
        pararCamara()
        iniciarVida()
      } else {
        setFase('selfie')
      }
    } else {
      setSelfie(dataUrl)
      setFase('revisar')
      pararCamara()
    }
  }

  /**
   * El core manda `intentosRestantes` cuando rechaza. Si llega a cero, la
   * ceremonia terminó: no hay cuarta oportunidad y volver a la cámara solo
   * sirve para que el cliente gaste el tiempo en algo que ya no puede salir.
   */
  const esCierre = (estado: number, cuerpo: { intentosRestantes?: number }) =>
    estado === 429 || cuerpo?.intentosRestantes === 0

  const enviar = async () => {
    setFase('enviando')
    setError('')
    try {
      const r = await fetch(`/api/firma/${token}/identidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesion, cedula, selfie }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j?.decision === 'aprobada') {
        onAprobada()
        return
      }
      if (r.status === 401) {
        onSesionCaducada()
        return
      }
      setError(j?.error || 'No se pudo verificar tu identidad. Intenta de nuevo.')
      if (esCierre(r.status, j)) {
        pararCamara()
        setFase('canalCerrado')
        return
      }
      // Un 5xx no es culpa del cliente y no debe costarle repetir las fotos:
      // se conservan y se le deja el botón de «Verificar» a un toque.
      if (r.status >= 500) {
        setFase('revisar')
        return
      }
      setCedula('')
      setSelfie('')
      setFase('cedula')
    } catch {
      // Se cayó la red enviando las fotos. Sin esto, la fase se quedaba en
      // 'enviando' y los dos botones en gris, para siempre.
      setError(SIN_CONEXION.texto)
      setFase('revisar')
    }
  }

  const iniciarVida = async () => {
    setError('')
    try {
      const r = await fetch(`/api/firma/${token}/liveness/sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesion }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j?.sessionId) {
        if (r.status === 401) {
          onSesionCaducada()
          return
        }
        setError(j?.error || 'No pudimos iniciar la prueba de vida. Vuelve a intentarlo en un momento.')
        setFase('cedula')
        return
      }
      setSessionId(j.sessionId)
      setFase('vida')
    } catch {
      setError(SIN_CONEXION.texto)
      setFase('cedula')
    }
  }

  const terminarVida = async () => {
    setFase('enviando')
    setError('')
    try {
      const r = await fetch(`/api/firma/${token}/liveness/resultado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesion, sessionId, cedula }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j?.decision === 'aprobada') {
        onAprobada()
        return
      }
      if (r.status === 401) {
        onSesionCaducada()
        return
      }
      setError(j?.error || 'No se pudo verificar tu identidad. Intenta de nuevo.')
      setSessionId('')
      if (esCierre(r.status, j)) {
        pararCamara()
        setFase('canalCerrado')
        return
      }
      setCedula('')
      setFase('cedula')
    } catch {
      setError(SIN_CONEXION.texto)
      setSessionId('')
      setFase('cedula')
    }
  }

  const repetirFotos = () => {
    setCedula('')
    setSelfie('')
    setError('')
    setFase('cedula')
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (fase === 'vida' && sessionId)
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="text-xl font-semibold">Prueba de vida</h1>
        <DetectorDeVida
          sessionId={sessionId}
          region={liveness?.region || 'us-east-1'}
          identityPoolId={liveness?.identityPoolId || ''}
          onCompleta={terminarVida}
          onError={(m) => {
            setError(m)
            setSessionId('')
            setFase('cedula')
          }}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    )

  // Terminal: no hay cámara, ni botones de captura, ni nada que reintentar.
  if (fase === 'canalCerrado')
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <h1 className="text-xl font-semibold">Seguimos por otro camino</h1>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          {error || 'Se agotaron los intentos de verificación de identidad.'}
        </p>
        <p className="text-sm text-muted-foreground">
          Tu solicitud sigue en pie: tu asesor te contactará para firmar los documentos en físico. Ya puedes cerrar
          esta página.
        </p>
      </div>
    )

  if (avisoCamara)
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <h1 className="text-xl font-semibold">{avisoCamara.titulo}</h1>
        <p>{avisoCamara.texto}</p>
        <Button
          onClick={() => {
            setAvisoCamara(null)
            setIntentoCamara((n) => n + 1)
          }}
          className="w-full sm:w-auto"
        >
          Intentar de nuevo
        </Button>
      </div>
    )

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold">Verifica tu identidad</h1>
      {fase === 'cedula' ? (
        <p>
          <strong>Paso 1 de 2:</strong> toma una foto del <strong>frente de tu cédula</strong> — que se vea nítida y
          completa, con buena luz.
        </p>
      ) : fase === 'selfie' ? (
        <p>
          <strong>Paso 2 de 2:</strong> ahora una <strong>selfie</strong>. Mira de frente, sin gafas oscuras ni
          gorra, con la cara bien iluminada.
        </p>
      ) : (
        <p>Revisa que la foto se vea bien y envíala para la verificación.</p>
      )}

      {fase === 'cedula' || fase === 'selfie' ? (
        <>
          <video ref={videoRef} playsInline muted className="w-full rounded-lg border bg-black" />
          <Button onClick={capturar} className="w-full sm:w-auto">
            {fase === 'cedula' ? 'Capturar la cédula' : 'Capturar la selfie'}
          </Button>
        </>
      ) : null}

      {fase === 'revisar' || fase === 'enviando' ? (
        <>
          {/* Solo se pinta la foto que EXISTE. En el camino de prueba de vida
              no hay selfie, y el <img src=""> dejaba un icono de imagen rota
              junto a un texto alternativo, como si algo se hubiera perdido. */}
          <div className={cedula && selfie ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
            {cedula ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cedula} alt="Cédula" className="w-full rounded-lg border" />
            ) : null}
            {selfie ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selfie} alt="Selfie" className="w-full rounded-lg border" />
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={enviar} disabled={fase === 'enviando' || !cedula || !selfie}>
              {fase === 'enviando' ? 'Verificando…' : 'Verificar mi identidad'}
            </Button>
            <Button variant="outline" onClick={repetirFotos} disabled={fase === 'enviando'}>
              Repetir las fotos
            </Button>
          </div>
        </>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-muted-foreground">
        Tus fotos se usan únicamente para verificar tu identidad en esta firma y hacen parte del expediente
        electrónico, según la autorización que aceptaste.
      </p>
    </div>
  )
}
