'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { ShieldCheck, ArrowLeft, Check, MessageCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useClientPortal } from '@/stores/clientPortalStore'

const WHATSAPP = '573334310479'
const RESEND_SECONDS = 60

const FEATURES = [
  'Consultar el estado de tu crédito en cualquier momento',
  'Pagar tu cuota con los métodos oficiales de Credion',
  'Enviar comprobantes y hablar con tu asesor por WhatsApp',
]

export default function ClientesVerificacionPage() {
  const router = useRouter()
  const setToken = useClientPortal((s) => s.setToken)
  const identificacion = useClientPortal((s) => s.identificacion)
  const hydrated = useClientPortal((s) => s.hydrated)

  const [code, setCode] = useState('')
  const [phoneHint, setPhoneHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (!hydrated) return
    if (!identificacion) {
      router.replace('/clientes')
      return
    }
    setPhoneHint(sessionStorage.getItem('client-portal-phone-hint') || '')
  }, [hydrated, identificacion, router])

  // Cuenta regresiva para reenviar
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (code.length !== 6) {
      setError('Ingresa los 6 dígitos del código.')
      return
    }
    if (!identificacion) {
      setError('Sesión expirada. Vuelve a empezar.')
      router.replace('/clientes')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/client-portal/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificacion, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Código inválido.')
        return
      }
      if (!data.token) {
        setError('No recibimos el token. Intenta de nuevo.')
        return
      }
      setToken(data.token, identificacion)
      router.push('/clientes/dashboard')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!identificacion || countdown > 0) return
    setError(null)
    setInfo(null)
    setResending(true)
    try {
      const res = await fetch('/api/client-portal/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificacion }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No pudimos reenviar el código.')
        return
      }
      if (data.phoneObfuscated) {
        setPhoneHint(data.phoneObfuscated)
        sessionStorage.setItem('client-portal-phone-hint', data.phoneObfuscated)
      }
      setInfo('Te enviamos un nuevo código.')
      setCountdown(RESEND_SECONDS)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setResending(false)
    }
  }

  const mmss = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`

  // El phoneHint viene como "+57 *******79" (codigoTelefono + masked + last3)
  // Mostramos sólo los últimos 3 dígitos para mantener el estilo del mockup
  const last3 = phoneHint.replace(/\D/g, '').slice(-3) || '••79'

  return (
    <div className="min-h-[calc(100vh-200px)] grid lg:grid-cols-[minmax(0,560px)_1fr] bg-white">
      {/* Brand side (mismo que login) */}
      <aside
        className="relative overflow-hidden text-white p-8 md:p-12 lg:p-14 flex flex-col justify-between min-h-[420px] lg:min-h-full"
        style={{ background: 'linear-gradient(135deg,#0096B8 0%,#2E5E9C 45%,#7A2A85 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-44 -right-44 w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 60%)' }} />
          <div className="absolute -bottom-40 -left-24 w-[380px] h-[380px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,150,184,0.5), transparent 60%)' }} />
          <Image src="/credion-mark.svg" alt="" aria-hidden width={520} height={520} className="absolute -right-24 -bottom-32 opacity-[0.07] invert" />
        </div>

        <div className="relative flex items-center gap-3">
          <Image src="/credion-mark.svg" alt="Credion" width={36} height={36} className="invert opacity-95" />
          <div>
            <div className="font-bold text-lg tracking-tight">Credion</div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-white/65">Portal de clientes</div>
          </div>
        </div>

        <div className="relative flex flex-col gap-9">
          <div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-white/55">Tu crédito Credion</div>
            <h2 className="text-4xl md:text-5xl lg:text-[52px] font-semibold mt-3.5 leading-[1.02]" style={{ letterSpacing: '-0.028em' }}>
              Bajo control,
              <br />
              <span className="text-white/55">siempre a mano.</span>
            </h2>
          </div>

          <ul className="flex flex-col gap-3.5">
            {FEATURES.map((feat) => (
              <li key={feat} className="flex items-start gap-3.5">
                <span className="w-[22px] h-[22px] rounded-full bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </span>
                <span className="text-[15px] text-white/90 leading-snug max-w-xs">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-4 md:gap-6 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Vigilada Superfinanciera
          </span>
          <span className="w-px h-3.5 bg-white/20" />
          <span>NIT 901.831.706-1</span>
        </div>
      </aside>

      {/* Form side */}
      <section
        className="relative p-6 md:p-10 lg:p-16 flex flex-col"
        style={{ background: 'linear-gradient(180deg,#F2FAFC 0%,#FFFFFF 240px)' }}
      >
        <div className="flex justify-between items-center mb-12 lg:mb-20">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[#525964]">Sesión nueva · cifrada</div>
          <a
            href="https://forms.credion.com.co/solicitud/formulario"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E9ECF1] rounded-full text-xs font-medium text-[#0D1117] hover:border-[#D5D9DF] transition"
          >
            ¿Eres nuevo? Solicita un crédito <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[#006984]">Paso 2 de 2</div>
            <h1 className="text-3xl md:text-4xl font-semibold mt-2 mb-3 text-[#0D1117]" style={{ letterSpacing: '-0.025em' }}>
              Ingresa tu código de verificación
            </h1>
            <p className="text-sm text-[#525964] mb-7 leading-relaxed">
              Te enviamos un código de 6 dígitos por SMS al teléfono que termina en{' '}
              <strong className="text-[#0D1117] font-mono">•••• ••{last3}</strong>. Llega en menos de 30 segundos.
            </p>

            <div className="flex justify-center sm:justify-start">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(v) => setCode(v.replace(/\D/g, ''))}
                disabled={loading}
              >
                <InputOTPGroup className="gap-2.5">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-14 w-14 sm:h-[68px] sm:w-14 rounded-xl border-[1.5px] border-[#E9ECF1] bg-white font-mono text-2xl sm:text-[28px] font-medium text-[#0D1117] data-[active=true]:border-[#0096B8] data-[active=true]:ring-[3px] data-[active=true]:ring-[#0096B8]/15 first:rounded-l-xl last:rounded-r-xl"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {info && (
              <div className="mt-4 flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full mt-6 py-4 px-4 bg-[#0D1117] text-white rounded-xl font-semibold text-[15px] inline-flex items-center justify-center gap-2.5 hover:bg-[#1F2530] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Verificar e ingresar'}
            </button>

            <div className="flex justify-between items-center mt-5 text-[13px]">
              <button
                type="button"
                onClick={() => router.push('/clientes')}
                className="text-[#525964] hover:text-[#0D1117] font-medium inline-flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cambiar cédula
              </button>
              <div className="font-mono text-[12px] text-[#525964]">
                {countdown > 0 ? (
                  <>Reenviar en <strong className="text-[#0D1117]">{mmss}</strong></>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[#0096B8] hover:text-[#006984] font-semibold transition disabled:opacity-50"
                  >
                    {resending ? 'Reenviando...' : 'Reenviar código'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3.5 my-7 text-[#8A919C] font-mono text-xs">
              <span className="flex-1 h-px bg-[#E9ECF1]" />
              <span>¿No te llegó?</span>
              <span className="flex-1 h-px bg-[#E9ECF1]" />
            </div>

            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, no recibí el código SMS para acceder al portal de clientes.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-white border border-[#E9ECF1] text-[#15803D] rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2.5 hover:bg-[#F6F7F9] transition"
            >
              <MessageCircle className="w-4 h-4" /> Escríbenos por WhatsApp
            </a>
          </form>
        </div>

        <footer className="mt-12 flex justify-between text-[11px] text-[#525964] font-mono" style={{ letterSpacing: '0.04em' }}>
          <span>© 2026 Credion S.A.S.</span>
          <span className="hidden md:flex gap-4">
            <a href="https://forms.credion.com.co/politica-de-privacidad" className="text-[#525964] hover:text-[#0D1117]">Política de privacidad</a>
            <a href="https://forms.credion.com.co/terminos-de-uso" className="text-[#525964] hover:text-[#0D1117]">Términos</a>
          </span>
        </footer>
      </section>
    </div>
  )
}
