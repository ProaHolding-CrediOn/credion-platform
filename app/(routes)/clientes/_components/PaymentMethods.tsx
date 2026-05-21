'use client'

import { useState } from 'react'
import {
  Copy,
  Check,
  ChevronDown,
  Landmark,
  CreditCard,
  Smartphone,
  Globe,
  Banknote,
  Building2,
  Phone,
  ShieldCheck,
  MessageCircle,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react'

// ────────────────────────────────────────────────────────────────────
// Datos extraídos de los PDFs oficiales
// (GUÍA CLIENTES TRANSFERENCIA A CUENTA · GUÍA CLIENTES)
// ────────────────────────────────────────────────────────────────────

const WHATSAPP = '573334310479'
const WHATSAPP_DISPLAY = '+57 333 431 0479'

const HOLDER_FULL_NAME = 'Juan David Pascual Chamorro'

const SAVINGS_DESTINO = {
  bank: 'Bancolombia',
  type: 'Cuenta de Ahorros',
  number: '9350 5037 993',
  holder: HOLDER_FULL_NAME,
}

const CREDIT_CARD_DESTINO = {
  bank: 'Bancolombia',
  brand: 'MasterCard',
  number: '5491 5805 7507 2083',
  numberShort: '72083',
  holder: HOLDER_FULL_NAME,
  cedula: '71229626',
}

type StepText = string | { text: string; bold?: string[] }

type Method = {
  id: string
  icon: React.ComponentType<{ className?: string }>
  badgeColor: 'teal' | 'purple' | 'green' | 'orange'
  title: string
  subtitle: string
  steps: StepText[]
  extra?: React.ReactNode
}

const SAVINGS_METHODS: Method[] = [
  {
    id: 'app-bancolombia',
    icon: Smartphone,
    badgeColor: 'teal',
    title: 'App Mi Bancolombia',
    subtitle: 'Desde tu celular, en menos de 2 min',
    steps: [
      'Abre la app e inicia sesión con tu usuario/clave o usa biometría.',
      'Entra a Transacciones → Transferir Plata.',
      'Elige tu cuenta de origen, ingresa el monto y toca Continuar.',
      `En "Productos no inscritos de Bancolombia", ingresa el número ${SAVINGS_DESTINO.number}.`,
      'Verifica nombre, número y monto. Autoriza con tu Clave Dinámica.',
      'Descarga el comprobante y envíalo por WhatsApp.',
    ],
  },
  {
    id: 'sucursal-virtual',
    icon: Globe,
    badgeColor: 'purple',
    title: 'Sucursal Virtual Personas',
    subtitle: 'Por la web del banco',
    steps: [
      'Inicia sesión en el portal oficial Bancolombia con usuario y contraseña.',
      'Selecciona Transacciones → Transferir a productos Bancolombia.',
      `Ingresa el valor a transferir y la cuenta destino ${SAVINGS_DESTINO.number}.`,
      'Autoriza con tu Clave Dinámica.',
      'Verifica los datos y confirma la transferencia.',
      'Toma captura del comprobante y envíala por WhatsApp.',
    ],
    extra: (
      <a
        href="https://sucursalvirtual.grupobancolombia.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#0096B8] hover:text-[#006984]"
      >
        Ir al portal Bancolombia <ExternalLink className="w-3 h-3" />
      </a>
    ),
  },
  {
    id: 'cajero',
    icon: Banknote,
    badgeColor: 'purple',
    title: 'Cajero electrónico Bancolombia',
    subtitle: 'Con tu tarjeta débito',
    steps: [
      'Introduce tu tarjeta débito y digita tu Clave Principal.',
      'Selecciona la opción Transferencias.',
      'Indica desde cuál de tus cuentas saldrá el dinero (ahorros o corriente).',
      `Elige "a otras cuentas" e ingresa el número ${SAVINGS_DESTINO.number}.`,
      'Confirma el monto, retira el comprobante y envíalo por WhatsApp.',
    ],
  },
  {
    id: 'efectivo',
    icon: Building2,
    badgeColor: 'orange',
    title: 'Consignación en efectivo',
    subtitle: 'Sucursal, cajero multifuncional o corresponsal',
    steps: [
      `Sucursal física: acércate a la ventanilla y consigna a la cuenta ${SAVINGS_DESTINO.number}.`,
      `Cajero multifuncional: selecciona "Consignaciones en efectivo" → Cuenta Ahorros Bancolombia → ingresa ${SAVINGS_DESTINO.number}.`,
      'Corresponsal bancario (tiendas, droguerías, comercios afiliados): indica que deseas consignar a una cuenta Bancolombia y entrega los datos.',
      'Conserva el comprobante físico y envíalo por WhatsApp.',
    ],
  },
]

const CREDIT_METHODS: Method[] = [
  {
    id: 'app',
    icon: Smartphone,
    badgeColor: 'teal',
    title: 'Desde la App Bancolombia',
    subtitle: 'El método más rápido',
    steps: [
      'Inicia sesión en la App Bancolombia.',
      'Selecciona "Transacciones" en la parte inferior.',
      'Toca "Pagar tarjetas y créditos".',
      'Elige "Pagar otras tarjetas".',
      `Ingresa el número de tarjeta ${CREDIT_CARD_DESTINO.number}.`,
      'Selecciona "Otro valor", elige pesos e ingresa el valor.',
      'Toca Pagar, captura el comprobante y envíalo por WhatsApp.',
    ],
  },
  {
    id: 'pse',
    icon: Globe,
    badgeColor: 'purple',
    title: 'Por PSE (página web · Wompi)',
    subtitle: 'Desde el navegador',
    steps: [
      'Ingresa al portal oficial de pago de Tarjeta Bancolombia por Wompi.',
      `Diligencia: identificación ${CREDIT_CARD_DESTINO.cedula} · últimos 5 dígitos ${CREDIT_CARD_DESTINO.numberShort} · a nombre de ${CREDIT_CARD_DESTINO.holder}.`,
      'Selecciona "Otro valor en pesos" e ingresa el monto.',
      'Elige PSE como método de pago.',
      'Selecciona tu banco, inicia sesión y aprueba el pago.',
      'Guarda el comprobante y envíalo por WhatsApp.',
    ],
    extra: (
      <a
        href="https://checkout.wompi.co/l/VPOS_3KdYmW"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#0096B8] hover:text-[#006984]"
      >
        Ir a la página oficial <ExternalLink className="w-3 h-3" />
      </a>
    ),
  },
  {
    id: 'sucursal-virtual-tc',
    icon: Globe,
    badgeColor: 'green',
    title: 'Sucursal Virtual Personas',
    subtitle: 'Con cuenta de ahorros o corriente',
    steps: [
      'Entra al sitio web oficial de Bancolombia e inicia sesión.',
      'En el menú: Transacciones → Pagar tarjetas de crédito.',
      'Elige "Otras tarjetas Bancolombia".',
      `Ingresa el número de tarjeta ${CREDIT_CARD_DESTINO.number}.`,
      'Selecciona la cuenta desde la cual se debitará y el tipo de pago (mínimo, total u otro valor).',
      'Verifica los datos, autoriza con Clave Dinámica y envía el comprobante por WhatsApp.',
    ],
  },
  {
    id: 'otros',
    icon: Building2,
    badgeColor: 'orange',
    title: 'Corresponsales y Sucursal Telefónica',
    subtitle: 'Pagar en efectivo o por teléfono',
    steps: [
      'Corresponsales Bancolombia A la Mano: tiendas, droguerías o papelerías con el sello. También Éxito, Carulla, Surtimax, Super Inter, Éxito Express y Olímpica.',
      `Entrega el efectivo y el número de tarjeta ${CREDIT_CARD_DESTINO.number}. No piden cédula.`,
      'Sucursal Física Bancolombia: lleva efectivo o cheque (sin tope, pesos o dólares, aplica el mismo día).',
      'Sucursal Telefónica 24/7: llama al 018000 912345 (gratis nacional) o #345 desde celular. Necesitas tu Clave Principal y Clave Dinámica.',
    ],
  },
]

// ────────────────────────────────────────────────────────────────────
// Atoms
// ────────────────────────────────────────────────────────────────────

function Eyebrow({ children, color = '#525964' }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color }}>
      {children}
    </div>
  )
}

function CopyButton({ value, size = 'md' }: { value: string; size?: 'sm' | 'md' | 'lg' }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // noop
    }
  }
  if (size === 'lg') {
    return (
      <button
        type="button"
        onClick={onCopy}
        className="bg-white text-[#0D1117] hover:bg-white/95 font-bold rounded-xl inline-flex items-center justify-center gap-2 transition flex-shrink-0 text-sm px-5 py-3 shadow-sm"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copiado' : 'Copiar número'}
      </button>
    )
  }
  const sm = size === 'sm'
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`bg-[#0096B8] hover:bg-[#006984] text-white font-semibold rounded-lg inline-flex items-center gap-1.5 transition flex-shrink-0 ${
        sm ? 'text-[11px] px-2.5 py-1.5' : 'text-xs px-3 py-2'
      }`}
    >
      {copied ? <Check className={sm ? 'w-3 h-3' : 'w-3.5 h-3.5'} /> : <Copy className={sm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

const BADGE_BG: Record<Method['badgeColor'], { bg: string; fg: string }> = {
  teal: { bg: '#E6F4F8', fg: '#006984' },
  purple: { bg: '#F5EBF6', fg: '#531F57' },
  green: { bg: '#DCFCE7', fg: '#15803D' },
  orange: { bg: '#FFF7ED', fg: '#9A3412' },
}

function MethodAccordion({ method, isFirst }: { method: Method; isFirst?: boolean }) {
  const [open, setOpen] = useState(!!isFirst)
  const Icon = method.icon
  const badge = BADGE_BG[method.badgeColor]
  return (
    <div className="border border-[#E9ECF1] rounded-2xl bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-5 hover:bg-[#F9FAFB] transition text-left"
        aria-expanded={open}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: badge.bg, color: badge.fg }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base text-[#0D1117]" style={{ letterSpacing: '-0.005em' }}>
            {method.title}
          </div>
          <div className="text-[13px] text-[#525964] mt-0.5">{method.subtitle}</div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#8A919C] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-6 pt-2 border-t border-[#F1F3F6]">
          <ol className="space-y-4 mt-4">
            {method.steps.map((step, i) => {
              const text = typeof step === 'string' ? step : step.text
              return (
                <li key={i} className="flex gap-3.5">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F6F7F9] text-[#525964] text-[13px] font-mono font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-[14px] text-[#0D1117] leading-relaxed pt-0.5">{text}</span>
                </li>
              )
            })}
          </ol>
          {method.extra}
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Account hero (la cuenta/tarjeta destino prominente)
// ────────────────────────────────────────────────────────────────────

function AccountHero({ mode }: { mode: 'savings' | 'credit' }) {
  const isSavings = mode === 'savings'
  const data = isSavings ? SAVINGS_DESTINO : CREDIT_CARD_DESTINO
  const cardGrad = isSavings
    ? 'linear-gradient(135deg,#0096B8 0%,#006984 100%)'
    : 'linear-gradient(135deg,#7A2A85 0%,#531F57 100%)'

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white"
      style={{ background: cardGrad, boxShadow: '0 20px 40px -16px rgba(13,17,23,0.25)' }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute -top-32 -right-24 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 60%)' }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 60%)' }}
        />
      </div>

      <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
        {/* Left: account info */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span
              className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0"
              aria-hidden
            >
              {isSavings ? <Landmark className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            </span>
            <div>
              <Eyebrow color="rgba(255,255,255,0.7)">
                {isSavings ? 'Cuenta destino · Ahorros' : 'Tarjeta destino · Crédito'}
              </Eyebrow>
              <div className="font-semibold text-lg md:text-xl mt-0.5">
                {data.bank} {!isSavings && `· ${CREDIT_CARD_DESTINO.brand}`}
              </div>
            </div>
          </div>

          <Eyebrow color="rgba(255,255,255,0.7)">
            {isSavings ? 'Número de cuenta' : 'Número de tarjeta'}
          </Eyebrow>
          <div className="font-mono text-3xl md:text-4xl lg:text-[42px] font-medium tracking-[0.04em] mt-2 leading-none break-all">
            {data.number}
          </div>

          <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <Eyebrow color="rgba(255,255,255,0.65)">Titular</Eyebrow>
              <div className="font-semibold text-white mt-1 text-base md:text-lg">{data.holder}</div>
            </div>
            {!isSavings && (
              <>
                <div>
                  <Eyebrow color="rgba(255,255,255,0.65)">Identificación</Eyebrow>
                  <div className="font-mono font-medium text-white mt-1 text-base">
                    {CREDIT_CARD_DESTINO.cedula}
                  </div>
                </div>
                <div>
                  <Eyebrow color="rgba(255,255,255,0.65)">Últimos 5</Eyebrow>
                  <div className="font-mono font-medium text-white mt-1 text-base">
                    {CREDIT_CARD_DESTINO.numberShort}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: copy button + verified pill */}
        <div className="flex flex-col items-stretch gap-3 md:items-end md:min-w-[180px]">
          <CopyButton value={data.number} size="lg" />
          <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider bg-white/15 border border-white/25 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Cuenta verificada
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────────────

export type PaymentPreference = 'savings' | 'credit'

export function PaymentMethods({
  customId,
  preference = 'savings',
}: {
  customId: string
  preference?: PaymentPreference
}) {
  const [tab, setTab] = useState<PaymentPreference>(preference)
  const isSavings = tab === 'savings'

  return (
    <section id="pagos">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-3 mb-6">
        <div>
          <Eyebrow color="#531F57">Pagos</Eyebrow>
          <h2 className="text-2xl md:text-[32px] font-semibold mt-1.5 mb-1" style={{ letterSpacing: '-0.02em' }}>
            Cómo pagar tu cuota
          </h2>
          <p className="text-sm text-[#525964] m-0 max-w-xl">
            Paga directamente a Bancolombia. Sólo aceptamos depósitos a nombre de{' '}
            <strong className="text-[#0D1117]">Juan David Pascual Chamorro</strong>.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F4F8] text-[#006984] rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> Cuentas verificadas
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-[#F1F5F9] rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setTab('savings')}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition ${
            isSavings ? 'bg-white text-[#0D1117] shadow-sm' : 'text-[#525964] hover:text-[#0D1117]'
          }`}
        >
          <Landmark className="w-4 h-4" /> Cuenta de Ahorros
          {preference === 'savings' && (
            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#E6F4F8] text-[#006984] px-1.5 py-0.5 rounded-full">
              Para ti
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('credit')}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition ${
            !isSavings ? 'bg-white text-[#0D1117] shadow-sm' : 'text-[#525964] hover:text-[#0D1117]'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Tarjeta de Crédito
          {preference === 'credit' && (
            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#F5EBF6] text-[#531F57] px-1.5 py-0.5 rounded-full">
              Para ti
            </span>
          )}
        </button>
      </div>

      {/* Account hero full-width */}
      <AccountHero mode={tab} />

      {/* Methods header */}
      <div className="mt-10 mb-5 flex items-end justify-between flex-wrap gap-3">
        <div>
          <Eyebrow color="#525964">Métodos disponibles</Eyebrow>
          <h3 className="text-xl md:text-2xl font-semibold mt-1 text-[#0D1117]" style={{ letterSpacing: '-0.015em' }}>
            {isSavings ? 'Cuatro formas de transferir' : 'Cuatro formas de pagar tu tarjeta'}
          </h3>
        </div>
        <p className="text-[13px] text-[#525964] max-w-sm">
          Elegí el que más te convenga. Cada uno tiene los pasos detallados.
        </p>
      </div>

      {/* Methods grid 2-cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(isSavings ? SAVINGS_METHODS : CREDIT_METHODS).map((m, i) => (
          <MethodAccordion key={m.id} method={m} isFirst={i === 0} />
        ))}
      </div>

      {/* Warning for credit tab — medios que NO funcionan */}
      {!isSavings && (
        <div className="mt-5 flex items-start gap-3 p-5 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-[#9A3412] flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-[#9A3412]">No funcionan para esta tarjeta</div>
            <div className="text-[13px] text-[#9A3412]/80 mt-1">
              Efecty, Baloto, Gana, SuperGiros, D1, Moviired, SuRed.
            </div>
          </div>
        </div>
      )}

      {/* Tips row */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#F9FAFB] border border-[#E9ECF1] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#006984]" />
            <span className="font-semibold text-sm">Antes de pagar</span>
          </div>
          <ul className="text-[13px] text-[#525964] space-y-2 list-disc list-inside marker:text-[#0096B8]">
            <li>Verificá el número {isSavings ? 'de cuenta' : 'de tarjeta'} dígito por dígito.</li>
            <li>Confirmá que el monto coincida con tu cuota.</li>
            <li>Realizá la operación en lugares seguros.</li>
          </ul>
        </div>
        <div className="bg-[#F9FAFB] border border-[#E9ECF1] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-[#15803D]" />
            <span className="font-semibold text-sm">Después de pagar</span>
          </div>
          <ul className="text-[13px] text-[#525964] space-y-2 list-disc list-inside marker:text-[#15803D]">
            <li>Guardá siempre el comprobante (foto, PDF o impreso).</li>
            <li>Envíalo por WhatsApp para registrar tu pago.</li>
            <li>Conservá el soporte hasta confirmar la acreditación.</li>
          </ul>
        </div>
      </div>

      {/* Comprobante CTA */}
      <div
        className="mt-8 p-6 md:p-7 rounded-3xl text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0096B8 0%,#2E5E9C 45%,#7A2A85 100%)' }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div
            className="absolute -top-32 right-44 w-72 h-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 60%)' }}
          />
        </div>
        <div className="relative max-w-xl">
          <Eyebrow color="rgba(255,255,255,0.7)">Último paso</Eyebrow>
          <h3 className="text-xl md:text-2xl font-semibold mt-1.5 mb-1" style={{ letterSpacing: '-0.02em' }}>
            ¿Ya pagaste? Mándanos el comprobante
          </h3>
          <p className="text-sm text-white/85 m-0">
            Envíalo por WhatsApp al <strong className="text-white font-semibold">{WHATSAPP_DISPLAY}</strong>. Confirmamos
            tu pago en menos de 24h hábiles e impactamos tu saldo automáticamente.
          </p>
        </div>
        <div className="relative flex flex-col gap-2.5 flex-shrink-0">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
              `Hola, te envío el comprobante de pago de mi crédito ${customId}.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 bg-white text-[#531F57] rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2.5 whitespace-nowrap hover:bg-white/95 transition"
          >
            <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
          </a>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, necesito hablar con un asesor sobre mi crédito.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-transparent text-white border border-white/40 rounded-xl font-medium text-[13px] inline-flex items-center justify-center hover:bg-white/10 transition"
          >
            Hablar con un asesor <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </div>
      </div>

      {/* Sucursal Telefónica info (general) */}
      <div className="mt-4 flex items-start gap-2.5 text-[12px] text-[#525964]">
        <Phone className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>
          ¿Sin internet? <strong className="text-[#0D1117]">Sucursal Telefónica Bancolombia 24/7</strong>: 018000 912345
          (gratis nacional) o #345 desde celular.
        </span>
      </div>
    </section>
  )
}
