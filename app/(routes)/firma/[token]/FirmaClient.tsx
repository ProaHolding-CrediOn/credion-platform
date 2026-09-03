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
import {
  anotarOtpPedido,
  guardarSesion,
  leerSesion,
  olvidarSesion,
  otpYaPedido,
} from '@/utils/firma/sesionDeCeremonia'
import { avisoDeRespuesta, avisoPorEstado, SIN_CONEXION } from '@/utils/firma/avisoDeFallo'

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
  // Si el fallo es nuestro, el cliente merece un boton para reintentar en vez
  // de una pagina muerta.
  const [puedeReintentar, setPuedeReintentar] = useState(false)
  const [aceptaBiometria, setAceptaBiometria] = useState(false)
  const [otpPedido, setOtpPedido] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [sesion, setSesion] = useState('')
  const [docActual, setDocActual] = useState(0)
  const [pdfUrl, setPdfUrl] = useState('')
  // El visor tenia UN solo estado visible («Cargando documento...») para tres
  // situaciones distintas: cargando, cargado y ROTO. Un 500, un 502 o un corte
  // de red se descartaban en silencio con un `return`, y el cliente se quedaba
  // mirando ese texto con el boton de firmar en gris, sin una sola pista de
  // que habia pasado ni nada que tocar.
  const [falloDelPdf, setFalloDelPdf] = useState('')
  const [intentoPdf, setIntentoPdf] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [trazoHecho, setTrazoHecho] = useState(false)
  const [trazoGuardado, setTrazoGuardado] = useState('') // dataURL de la primera firma

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const r = await fetch(`/api/firma/${token}`, { cache: 'no-store' })
      if (!r.ok) {
        // Un 404 si es «tu enlace no vale». Un 500, un 502 o el core caido son
        // problema nuestro, y decirle que pida otro enlace es mentirle: el
        // siguiente fallaria igual.
        const aviso = await avisoDeRespuesta(r)
        setError(aviso.texto)
        setPuedeReintentar(aviso.sePuedeReintentar)
        setCargando(false)
        return
      }
      const data = (await r.json()) as EstadoSobre
      setSobre(data)
      setDocActual(data.documentos.findIndex((d) => !d.firmado))
      setError('')
      setPuedeReintentar(false)
    } catch {
      // El `fetch` ni llego a responder: cobertura perdida a mitad de peticion,
      // que en un movil pasa constantemente. Sin este catch la promesa quedaba
      // rechazada y la pantalla se quedaba en «Cargando tu sobre de firma...»
      // para siempre, sin una sola salida.
      setError(SIN_CONEXION.texto)
      setPuedeReintentar(true)
    }
    setCargando(false)
  }, [token])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Lo guardado se recupera DESPUES del primer pintado: `sessionStorage` no
  // existe en el render del servidor y leerlo durante el render descuadraria la
  // hidratacion.
  useEffect(() => {
    setSesion(leerSesion(token))
    setOtpPedido(otpYaPedido(token))
  }, [token])

  /** El servidor no reconoce el testigo: se tira y se vuelve a pedir codigo. */
  const caducarSesion = useCallback(() => {
    olvidarSesion(token)
    setSesion('')
    setOtpPedido(false)
    setPdfUrl('')
    setError('Por seguridad tenemos que verificarte de nuevo. Pide otro código.')
  }, [token])

  // El PDF del documento en curso se trae con el testigo y se muestra como blob.
  useEffect(() => {
    let url = ''
    const traer = async () => {
      if (!sesion || !sobre || docActual < 0) return
      setFalloDelPdf('')
      try {
        const r = await fetch(`/api/firma/${token}/documento/${docActual}`, {
          headers: { 'x-sesion-firma': sesion },
          cache: 'no-store',
        })
        // Sin esto, un testigo que el servidor ya no acepta deja la pantalla en
        // «Cargando documento...» para siempre.
        if (r.status === 401) {
          caducarSesion()
          return
        }
        if (!r.ok) {
          setFalloDelPdf(await avisoDeRespuesta(r).then((a) => a.texto))
          return
        }
        const blob = await r.blob()
        url = URL.createObjectURL(blob)
        setPdfUrl(url)
      } catch {
        setFalloDelPdf(SIN_CONEXION.texto)
      }
    }
    traer()
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [token, sesion, sobre, docActual, caducarSesion, intentoPdf])

  const aceptarAcuerdo = async () => {
    setEnviando(true)
    setError('')
    try {
      const r = await fetch(`/api/firma/${token}/acuerdo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aceptaBiometria }),
      })
      // El acuerdo aceptado queda en el sobre; al recargar, `cargar()` lo trae
      // y el cliente sigue por donde iba.
      if (r.ok) await cargar()
      else setError((await avisoDeRespuesta(r)).texto)
    } catch {
      setError(SIN_CONEXION.texto)
    } finally {
      // En `finally` y no despues del fetch: si la peticion lanza, sin esto el
      // boton se queda deshabilitado y el cliente no tiene forma de reintentar.
      setEnviando(false)
    }
  }

  const pedirOtp = async () => {
    setEnviando(true)
    setError('')
    try {
      const r = await fetch(`/api/firma/${token}/otp`, { method: 'POST' })
      if (r.ok) {
        setOtpPedido(true)
        anotarOtpPedido(token)
      } else {
        // Aqui el core sabe el motivo exacto (demasiados envios, sobre vencido)
        // y su mensaje es mejor que cualquiera nuestro; el aviso solo se hace
        // cargo de lo que el core NO explica, que es cuando el fallo es nuestro.
        setError((await avisoDeRespuesta(r)).texto)
      }
    } catch {
      // El core encola el WhatsApp y DESPUES responde: si la respuesta se
      // pierde, el codigo ya salio aunque el navegador no se entere. Decirle
      // «no se pudo enviar» le hace pedir otro, que invalida el que tiene.
      setOtpPedido(true)
      anotarOtpPedido(token)
      setError('Puede que el código ya te haya llegado: revisa tu WhatsApp antes de pedir otro.')
    } finally {
      setEnviando(false)
    }
  }

  const verificarOtp = async () => {
    setEnviando(true)
    setError('')
    try {
      const r = await fetch(`/api/firma/${token}/otp/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j?.sesion) {
        setSesion(j.sesion)
        guardarSesion(token, j.sesion)
        await cargar()
        return
      }
      // «Código incorrecto» se le decia tambien cuando el servidor fallaba, y
      // ahi el cliente se queda mirando un codigo correcto que no le aceptan.
      setError(r.ok ? 'Código incorrecto.' : (await avisoDeRespuesta(r)).texto)
    } catch {
      setError(SIN_CONEXION.texto)
    } finally {
      setEnviando(false)
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
    let r: Response
    let j: { completo?: boolean; error?: string } = {}
    try {
      r = await fetch(`/api/firma/${token}/firmar/${docActual}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesion, trazo }),
      })
      j = await r.json().catch(() => ({}))
    } catch {
      // Se corto la red justo al firmar. El documento puede haberse firmado o
      // no; `cargar()` lo dira, asi que se le invita a reintentar en vez de
      // dejarle el boton muerto.
      setEnviando(false)
      setError(SIN_CONEXION.texto)
      return
    }
    setEnviando(false)
    if (!r.ok) {
      if (r.status === 401) {
        caducarSesion()
        return
      }
      // 409 «ya está firmado» y 410 «el sobre ya no está en curso» NO son
      // fallos: son la respuesta a un segundo toque cuando el primero SI llego
      // al servidor pero su respuesta no volvio. Pasaba justo al firmar el
      // ultimo documento, porque el cierre del sobre (sello, espejo y subida a
      // Dropbox) corre dentro de esa misma peticion y puede agotar el tiempo de
      // nginx. Decirle «este enlace ya no está activo» a quien acaba de firmar
      // bien es lo peor que puede leer. Se le vuelve a preguntar al servidor y
      // la pantalla se recoloca sola: siguiente documento, o «¡Listo!».
      if (r.status === 409 || r.status === 410) {
        await cargar()
        return
      }
      setError(avisoPorEstado(r.status, j?.error).texto)
      return
    }
    if (trazo && !trazoGuardado) setTrazoGuardado(trazo)
    setPdfUrl('')
    if (j?.completo) {
      olvidarSesion(token)
      // Con el sobre cerrado el servidor deja de mandar nombre y documentos —
      // el token ya no abre la ficha. Recargar aquí le dejaría a quien acaba de
      // firmar su propia confirmación en blanco, así que se cierra en local con
      // lo que ya tenía en pantalla.
      setSobre({
        ...sobre,
        estado: 'firmado',
        documentos: sobre.documentos.map((d) => ({ ...d, firmado: true })),
      })
      return
    }
    // La firma YA quedo registrada. Si la recarga falla aqui, el cliente no
    // puede pensar que perdio nada: sin este catch se quedaba viendo el
    // documento que acababa de firmar, con el visor vacio y el boton muerto.
    try {
      await cargar()
    } catch {
      setError('Tu firma quedó registrada. No pudimos cargar el siguiente documento: vuelve a abrir el enlace para continuar.')
    }
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

  if (error && !sobre)
    return marco(
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4">
        <p className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
        {puedeReintentar ? (
          <Button onClick={cargar} disabled={cargando}>
            {cargando ? 'Reintentando…' : 'Volver a intentarlo'}
          </Button>
        ) : null}
      </div>,
    )
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

  // Paso 1 — acuerdo. La condicion es la del SERVIDOR: quien ya lo acepto no
  // vuelve a verlo aunque recargue.
  if (!sobre.acuerdoAceptado)
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
    return marco(
      <PasoIdentidad
        token={token}
        sesion={sesion}
        onAprobada={cargar}
        onSesionCaducada={caducarSesion}
        liveness={sobre.liveness}
      />,
    )

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
        ) : falloDelPdf ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="max-w-md text-red-700">{falloDelPdf}</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Tu avance está guardado; no perdiste nada de lo que ya firmaste.
            </p>
            <Button variant="outline" onClick={() => setIntentoPdf((n) => n + 1)}>
              Volver a cargar el documento
            </Button>
          </div>
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
