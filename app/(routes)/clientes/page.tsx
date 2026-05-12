'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShieldCheck, ArrowRight, Check, MessageCircle, AlertCircle } from 'lucide-react'
import { useClientPortal } from '@/stores/clientPortalStore'

const WHATSAPP = '573334310479'

const FEATURES = [
  'Consultar el estado de tu crédito en cualquier momento',
  'Pagar tu cuota con los métodos oficiales de Credion',
  'Enviar comprobantes y hablar con tu asesor por WhatsApp',
]

export default function ClientesLoginPage() {
  const router = useRouter()
  const setToken = useClientPortal((s) => s.setToken)
  const [identificacion, setIdentificacion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const id = identificacion.trim().replace(/\D/g, '')
    if (!id || id.length < 5) {
      setError('Ingresa una cédula válida.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/client-portal/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificacion: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No pudimos enviar el código.')
        return
      }
      setToken('', id)
      sessionStorage.setItem('client-portal-phone-hint', data.phoneObfuscated || '')
      router.push('/clientes/verificacion')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] grid lg:grid-cols-[minmax(0,560px)_1fr] bg-white">
      {/* Brand side */}
      <aside
        className="relative overflow-hidden text-white p-8 md:p-12 lg:p-14 flex flex-col justify-between min-h-[420px] lg:min-h-full"
        style={{ background: 'linear-gradient(135deg,#0096B8 0%,#2E5E9C 45%,#7A2A85 100%)' }}
      >
        {/* Decorative orbs + grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-44 -right-44 w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 60%)' }} />
          <div className="absolute -bottom-40 -left-24 w-[380px] h-[380px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,150,184,0.5), transparent 60%)' }} />
          <Image
            src="/credion-mark.svg"
            alt=""
            aria-hidden
            width={520}
            height={520}
            className="absolute -right-24 -bottom-32 opacity-[0.07] invert"
          />
        </div>

        {/* Top logo */}
        <div className="relative flex items-center gap-3">
          <Image src="/credion-mark.svg" alt="Credion" width={36} height={36} className="invert opacity-95" />
          <div>
            <div className="font-bold text-lg tracking-tight">Credion</div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-white/65">Portal de clientes</div>
          </div>
        </div>

        {/* Claim */}
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

        {/* Trust strip */}
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
        {/* Top utility row */}
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

        {/* Form */}
        <div className="flex-1 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[#006984]">Paso 1 de 2</div>
            <h1 className="text-3xl md:text-4xl font-semibold mt-2 mb-3 text-[#0D1117]" style={{ letterSpacing: '-0.025em' }}>
              Accede a tu área personal
            </h1>
            <p className="text-sm text-[#525964] mb-8 leading-relaxed">
              Si ya tienes un crédito con nosotros, ingresa con tu cédula. Te enviaremos un código por SMS al teléfono registrado.
            </p>

            <div>
              <label htmlFor="identificacion" className="block text-[13px] font-medium text-[#0D1117] mb-2">
                Cédula de ciudadanía
              </label>
              <div className="flex items-center gap-2.5 px-4 py-3.5 bg-white border-[1.5px] border-[#E9ECF1] rounded-xl transition focus-within:border-[#0096B8] focus-within:shadow-[0_0_0_4px_rgba(0,150,184,0.12)]">
                <input
                  id="identificacion"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1234567890"
                  value={identificacion}
                  onChange={(e) => setIdentificacion(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="flex-1 border-none outline-none bg-transparent font-mono text-[17px] text-[#0D1117]"
                  style={{ letterSpacing: '0.02em' }}
                />
              </div>
              <p className="text-xs text-[#525964] mt-1.5">Solo números, sin puntos ni espacios.</p>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-5 py-4 px-4 bg-[#0D1117] text-white rounded-xl font-semibold text-[15px] inline-flex items-center justify-center gap-2.5 hover:bg-[#1F2530] transition disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Enviando código...' : 'Enviar código por SMS'}
            </button>

            <div className="flex items-center gap-3.5 my-7 text-[#8A919C] font-mono text-xs">
              <span className="flex-1 h-px bg-[#E9ECF1]" />
              <span>o</span>
              <span className="flex-1 h-px bg-[#E9ECF1]" />
            </div>

            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, no logro acceder al portal de clientes.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-white border border-[#E9ECF1] text-[#15803D] rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2.5 hover:bg-[#F6F7F9] transition"
            >
              <MessageCircle className="w-4 h-4" />
              ¿Tienes problemas? Escríbenos por WhatsApp
            </a>

            <div className="mt-7 p-3.5 bg-[#F6F7F9] rounded-lg text-[11px] text-[#525964] leading-relaxed flex gap-2.5 items-start">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <div>
                Tu cédula viaja cifrada y la usamos sólo para validar tu identidad.{' '}
                <strong className="text-[#0D1117] font-semibold">Nunca te pediremos tu clave bancaria.</strong>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
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
