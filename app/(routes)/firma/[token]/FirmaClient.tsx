'use client'

/**
 * La ceremonia de firma electrónica del cliente (Etapa A).
 *
 * Pasos: (1) Acuerdo de uso de firma electrónica + autorización biométrica
 * FACULTATIVA → (2) código OTP por WhatsApp → (3) ver y firmar cada documento
 * con el trazo dibujado. El testigo de sesión que devuelve el OTP viaja en
 * cada paso posterior; sin él no se puede ver ni firmar nada.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PasoIdentidad from './PasoIdentidad'

type EstadoSobre = {
  estado: 'enviado' | 'en_curso' | 'firmado' | 'vencido' | 'anulado'
  expiraEn: string
  credito?: string
  firmante: { nombre: string; identificacion: string }
  acuerdoAceptado: boolean
  identidadVerificada: boolean
  liveness?: { disponible: boolean; region?: string; identityPoolId?: string }
  otpVerificado: boolean
  documentos: { nombre: string; firmado: boolean }[]
  textos: {
    acuerdo: { version: string; texto: string }
    biometria: { version: string; texto: string }
  }
}

export default function FirmaClient({ token }: { token: string }) {
  const [sobre, setSobre] = useState<EstadoSobre | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aceptaBiometria, setAceptaBiometria] = useState(false)
  // DE MOMENTO (fase de pruebas, pedido del owner): cada carga de la pagina
  // arranca desde el acuerdo, aunque el servidor ya lo tenga aceptado. El
  // avance real (documentos firmados) si se conserva en el servidor.
  const [acuerdoLocal, setAcuerdoLocal] = useState(false)
  const [otpPedido, setOtpPedido] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [sesion, setSesion] = useState('')
  const [docActual, setDocActual] = useState(0)
  const [pdfUrl, setPdfUrl] = useState('')
  const [enviando, setEnviando] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [trazoHecho, setTrazoHecho] = useState(false)
  const [trazoGuardado, setTrazoGuardado] = useState('') // dataURL de la primera firma

  const cargar = useCallback(async () => {
    const r = await fetch(`/api/firma/${token}`, { cache: 'no-store' })
    if (!r.ok) {
      setError('Este enlace no es válido. Pídele a tu asesor que te lo reenvíe.')
      setCargando(false)
      return
    }
    const data = (await r.json()) as EstadoSobre
    setSobre(data)
    setDocActual(data.documentos.findIndex((d) => !d.firmado))
    setCargando(false)
  }, [token])

  useEffect(() => {
    cargar()
  }, [cargar])

  // El PDF del documento en curso se trae con el testigo y se muestra como blob.
  useEffect(() => {
    let url = ''
    const traer = async () => {
      if (!sesion || !sobre || docActual < 0) return
      const r = await fetch(`/api/firma/${token}/documento/${docActual}`, {
        headers: { 'x-sesion-firma': sesion },
        cache: 'no-store',
      })
      if (!r.ok) return
      const blob = await r.blob()
      url = URL.createObjectURL(blob)
      setPdfUrl(url)
    }
    traer()
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [token, sesion, sobre, docActual])

  const aceptarAcuerdo = async () => {
    setEnviando(true)
    const r = await fetch(`/api/firma/${token}/acuerdo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aceptaBiometria }),
    })
    setEnviando(false)
    if (r.ok) {
      setAcuerdoLocal(true)
      cargar()
    } else setError('No se pudo registrar el acuerdo. Intenta de nuevo.')
  }

  const pedirOtp = async () => {
    setEnviando(true)
    const r = await fetch(`/api/firma/${token}/otp`, { method: 'POST' })
    setEnviando(false)
    if (r.ok) setOtpPedido(true)
    else {
      const j = await r.json().catch(() => ({}))
      setError(j?.error || 'No se pudo enviar el código.')
    }
  }

  const verificarOtp = async () => {
    setEnviando(true)
    setError('')
    const r = await fetch(`/api/firma/${token}/otp/verificar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo }),
    })
    setEnviando(false)
    const j = await r.json().catch(() => ({}))
    if (r.ok && j?.sesion) {
      setSesion(j.sesion)
      cargar()
    } else {
      setError(j?.error || 'Código incorrecto.')
    }
  }

  // ── El trazo ────────────────────────────────────────────────────────────────
  const dibujando = useRef(false)
  const posiciona = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!
    const rect = c.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) * c.width) / rect.width, y: ((e.clientY - rect.top) * c.height) / rect.height }
  }
  const empezarTrazo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dibujando.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = posiciona(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  const moverTrazo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dibujando.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#17272B'
    const { x, y } = posiciona(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setTrazoHecho(true)
  }
  const terminarTrazo = () => {
    dibujando.current = false
  }
  const limpiarTrazo = () => {
    const c = canvasRef.current
    if (!c) return
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setTrazoHecho(false)
  }

  const firmar = async () => {
    if (!sobre) return
    setEnviando(true)
    setError('')
    let trazo = trazoGuardado
    if (!trazo && trazoHecho && canvasRef.current) {
      trazo = canvasRef.current.toDataURL('image/png')
    }
    const r = await fetch(`/api/firma/${token}/firmar/${docActual}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sesion, trazo }),
    })
    setEnviando(false)
    const j = await r.json().catch(() => ({}))
    if (!r.ok) {
      setError(j?.error || 'No se pudo firmar. Intenta de nuevo.')
      return
    }
    if (trazo && !trazoGuardado) setTrazoGuardado(trazo)
    setPdfUrl('')
    await cargar()
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (cargando) return <div className="p-8 text-center">Cargando tu sobre de firma…</div>

  const marco = (contenido: React.ReactNode) => (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center justify-between">
        <Image src="/logo.png" alt="Credion" width={130} height={40} />
        <span className="text-sm text-muted-foreground">Firma electrónica{sobre?.credito ? ` · ${sobre.credito}` : ''}</span>
      </div>
      {contenido}
      <p className="mt-auto pt-6 text-center text-xs text-muted-foreground">
        Firma electrónica conforme a la Ley 527 de 1999 y el Decreto 2364 de 2012 · Credion S.A.S.
      </p>
    </div>
  )

  if (error && !sobre) return marco(<p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>)
  if (!sobre) return null

  if (sobre.estado === 'vencido')
    return marco(<p className="rounded-lg border p-4">Este enlace venció. Pídele a tu asesor que te envíe uno nuevo.</p>)
  if (sobre.estado === 'anulado')
    return marco(<p className="rounded-lg border p-4">Este enlace fue reemplazado por uno más reciente. Usa el último mensaje que te llegó.</p>)

  const total = sobre.documentos.length
  const firmados = sobre.documentos.filter((d) => d.firmado).length

  // Al volver a abrir un enlace ya firmado el servidor no manda nombre ni
  // documentos: el token deja de abrir la ficha en cuanto termina la ceremonia.
  // Quien acaba de firmar sí los tiene en pantalla, y se le saluda por su nombre.
  if (sobre.estado === 'firmado' || (total > 0 && firmados === total)) {
    const nombre = sobre.firmante.nombre.split(' ')[0]
    return marco(
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">{nombre ? `¡Listo, ${nombre}!` : '¡Listo! Ya firmaste'}</p>
        <p className="mt-2 text-green-800">
          {total > 0
            ? `Firmaste los ${total} documentos de tu crédito. Credion conserva el expediente electrónico de tu firma.`
            : 'Credion conserva el expediente electrónico de tu firma. Si necesitas una copia, pídesela a tu asesor.'}
        </p>
      </div>,
    )
  }

  // Paso 1 — acuerdo
  if (!acuerdoLocal)
    return marco(
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="text-xl font-semibold">Hola, {sobre.firmante.nombre.split(' ')[0]}</h1>
        <p>
          Vas a firmar electrónicamente <strong>{total} documento{total === 1 ? '' : 's'}</strong> de tu crédito. Antes,
          lee y acepta el acuerdo que hace válida tu firma:
        </p>
        <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
          {sobre.textos.acuerdo.texto}
        </div>
        <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={aceptaBiometria}
            onChange={(e) => setAceptaBiometria(e.target.checked)}
          />
          <span>
            <strong>Requisito para firmar electrónicamente:</strong> autorizo la verificación de mi identidad con
            reconocimiento facial (dato biométrico). Si prefieres no autorizarla, puedes firmar los documentos en
            físico con tu asesor.{' '}
            <details className="mt-1">
              <summary className="cursor-pointer text-muted-foreground">Ver autorización completa</summary>
              <span className="mt-2 block max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {sobre.textos.biometria.texto}
              </span>
            </details>
          </span>
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button onClick={aceptarAcuerdo} disabled={enviando || !aceptaBiometria} className="w-full sm:w-auto">
          Acepto el acuerdo y quiero continuar
        </Button>
      </div>,
    )

  // Paso 2 — OTP
  if (!sesion)
    return marco(
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="text-xl font-semibold">Verifica que eres tú</h1>
        {!otpPedido ? (
          <>
            <p>Te enviaremos un código de 6 dígitos por WhatsApp al celular registrado en tu crédito.</p>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button onClick={pedirOtp} disabled={enviando} className="w-full sm:w-auto">
              Enviarme el código
            </Button>
          </>
        ) : (
          <>
            <Label htmlFor="codigo">Escribe el código que te llegó por WhatsApp</Label>
            <Input
              id="codigo"
              inputMode="numeric"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              className="max-w-40 text-center text-lg tracking-[0.4em]"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex gap-3">
              <Button onClick={verificarOtp} disabled={enviando || codigo.length !== 6}>
                Verificar
              </Button>
              <Button variant="outline" onClick={pedirOtp} disabled={enviando}>
                Reenviar código
              </Button>
            </div>
          </>
        )}
      </div>,
    )

  // Paso 3 — verificación de identidad con la cámara (Etapa B). El servidor
  // recuerda una identidad ya aprobada; el refresco no la repite.
  if (!sobre.identidadVerificada)
    return marco(<PasoIdentidad token={token} sesion={sesion} onAprobada={cargar} liveness={sobre.liveness} />)

  // Paso 4 — firmar documento a documento
  const doc = sobre.documentos[docActual]
  return marco(
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{doc?.nombre}</h1>
        <span className="text-sm text-muted-foreground">
          {firmados + 1} de {total}
        </span>
      </div>
      <div className="h-[78vh] overflow-hidden rounded-lg border">
        {pdfUrl ? (
          <iframe title="Documento" src={`${pdfUrl}#navpanes=0&view=FitH&zoom=page-width`} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Cargando documento…</div>
        )}
      </div>
      {pdfUrl ? (
        <a href={pdfUrl} target="_blank" rel="noreferrer" className="self-start text-sm text-muted-foreground underline">
          Abrir el documento en una pestaña completa
        </a>
      ) : null}
      {!trazoGuardado ? (
        <div className="flex flex-col gap-2">
          <Label>Dibuja tu firma aquí (se usará en todos los documentos)</Label>
          <canvas
            ref={canvasRef}
            width={560}
            height={160}
            className="h-40 w-full touch-none rounded-lg border bg-white"
            onPointerDown={empezarTrazo}
            onPointerMove={moverTrazo}
            onPointerUp={terminarTrazo}
            onPointerLeave={terminarTrazo}
          />
          <button type="button" onClick={limpiarTrazo} className="self-start text-sm text-muted-foreground underline">
            Borrar y volver a dibujar
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Se usará la firma que dibujaste en el primer documento.</p>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button onClick={firmar} disabled={enviando || (!trazoGuardado && !trazoHecho) || !pdfUrl} className="w-full sm:w-auto">
        {enviando ? 'Firmando…' : `Firmar «${doc?.nombre}»`}
      </Button>
    </div>,
  )
}
