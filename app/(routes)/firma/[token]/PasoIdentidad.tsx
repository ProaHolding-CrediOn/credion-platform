'use client'

/**
 * Etapa B: la verificación de identidad con la cámara.
 *
 * Dos capturas EN VIVO (nunca "subir archivo", que es trivialmente burlable):
 * la cédula por el frente (cámara trasera si hay) y una selfie (cámara
 * frontal). El core coteja las caras con AWS Rekognition; con 3 rechazos el
 * canal se cierra y la firma pasa a presencial.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  token: string
  sesion: string
  onAprobada: () => void
}

type Fase = 'cedula' | 'selfie' | 'revisar' | 'enviando'

export default function PasoIdentidad({ token, sesion, onAprobada }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [fase, setFase] = useState<Fase>('cedula')
  const [cedula, setCedula] = useState('')
  const [selfie, setSelfie] = useState('')
  const [error, setError] = useState('')
  const [sinCamara, setSinCamara] = useState(false)

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
      setSinCamara(false)
    } catch {
      setSinCamara(true)
    }
  }, [])

  useEffect(() => {
    if (fase === 'cedula') abrirCamara(false)
    if (fase === 'selfie') abrirCamara(true)
    return () => streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [fase, abrirCamara])

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
      setFase('selfie')
    } else {
      setSelfie(dataUrl)
      setFase('revisar')
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }

  const enviar = async () => {
    setFase('enviando')
    setError('')
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
    setError(j?.error || 'No se pudo verificar tu identidad. Intenta de nuevo.')
    setCedula('')
    setSelfie('')
    setFase(r.status === 429 ? 'revisar' : 'cedula')
    if (r.status === 429) streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  if (sinCamara)
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <h1 className="text-xl font-semibold">Necesitamos tu cámara</h1>
        <p>
          Para verificar tu identidad debes permitir el acceso a la cámara (revisa el candado de la barra del
          navegador) o abrir este enlace desde tu celular.
        </p>
        <Button onClick={() => abrirCamara(fase === 'selfie')} className="w-full sm:w-auto">
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
        <p>Revisa que las dos fotos se vean bien y envíalas para la verificación.</p>
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
          <div className="grid grid-cols-2 gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cedula} alt="Cédula" className="w-full rounded-lg border" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selfie} alt="Selfie" className="w-full rounded-lg border" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={enviar} disabled={fase === 'enviando' || !cedula || !selfie}>
              {fase === 'enviando' ? 'Verificando…' : 'Verificar mi identidad'}
            </Button>
            <Button variant="outline" onClick={() => { setCedula(''); setSelfie(''); setFase('cedula') }} disabled={fase === 'enviando'}>
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
