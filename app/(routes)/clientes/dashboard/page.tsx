'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
  LogOut,
  Car,
  Loader2,
  AlertCircle,
  MessageCircle,
  Receipt,
} from 'lucide-react'
import { useClientPortal, ClientCredit } from '@/stores/clientPortalStore'

const WHATSAPP = '573334310479'

// ──────────────────────────────────────────────────────────────
// Datos de bancos (de la GUÍA CLIENTES Credion)
// ──────────────────────────────────────────────────────────────

type Bank = {
  name: string
  short: string
  bg: string
  fg: string
  type: string
  number: string
  holder: string
  nit: string
}

const SAVINGS_BANKS: Bank[] = [
  {
    name: 'Bancolombia',
    short: 'BC',
    bg: '#FFE000',
    fg: '#0D1117',
    type: 'Cuenta de Ahorros',
    number: '693-152169-93',
    holder: 'CREDION SAS',
    nit: '901.831.706-1',
  },
  {
    name: 'Davivienda',
    short: 'DV',
    bg: '#E1111B',
    fg: '#FFFFFF',
    type: 'Cuenta de Ahorros',
    number: '0660-7000-1432',
    holder: 'CREDION SAS',
    nit: '901.831.706-1',
  },
  {
    name: 'BBVA',
    short: 'BB',
    bg: '#004481',
    fg: '#FFFFFF',
    type: 'Cuenta de Ahorros',
    number: '477-001147-7',
    holder: 'CREDION SAS',
    nit: '901.831.706-1',
  },
]

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function formatCop(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

function initials(first?: string, last?: string): string {
  return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || 'CL'
}

const STATUS_LABEL: Record<string, { label: string; dotBg: string; ringBg: string; chipBg: string; chipFg: string; chipBorder: string }> = {
  creado:      { label: 'Crédito en revisión', dotBg: '#F59E0B', ringBg: '#F59E0B22', chipBg: '#FEF3C7', chipFg: '#92400E', chipBorder: '#FCD34D' },
  revision:    { label: 'En revisión',         dotBg: '#F59E0B', ringBg: '#F59E0B22', chipBg: '#FEF3C7', chipFg: '#92400E', chipBorder: '#FCD34D' },
  preaprobado: { label: 'Preaprobado',         dotBg: '#2563EB', ringBg: '#2563EB22', chipBg: '#DBEAFE', chipFg: '#1E40AF', chipBorder: '#93C5FD' },
  aprobado:    { label: 'Aprobado',            dotBg: '#16A34A', ringBg: '#16A34A22', chipBg: '#DCFCE7', chipFg: '#15803D', chipBorder: '#BBF7D0' },
  tomado:      { label: 'Crédito activo',      dotBg: '#16A34A', ringBg: '#16A34A22', chipBg: '#DCFCE7', chipFg: '#15803D', chipBorder: '#BBF7D0' },
  desistido:   { label: 'Desistido',           dotBg: '#64748B', ringBg: '#64748B22', chipBg: '#F1F5F9', chipFg: '#475569', chipBorder: '#CBD5E1' },
  rechazado:   { label: 'No aprobado',         dotBg: '#DC2626', ringBg: '#DC262622', chipBg: '#FEE2E2', chipFg: '#991B1B', chipBorder: '#FCA5A5' },
  duplicado:   { label: 'Duplicado',           dotBg: '#64748B', ringBg: '#64748B22', chipBg: '#F1F5F9', chipFg: '#475569', chipBorder: '#CBD5E1' },
  cancelado:   { label: 'Cancelado',           dotBg: '#64748B', ringBg: '#64748B22', chipBg: '#F1F5F9', chipFg: '#475569', chipBorder: '#CBD5E1' },
  test:        { label: 'Prueba',              dotBg: '#64748B', ringBg: '#64748B22', chipBg: '#F1F5F9', chipFg: '#475569', chipBorder: '#CBD5E1' },
}

function statusInfo(status: string) {
  return STATUS_LABEL[status] || STATUS_LABEL.creado
}

// ──────────────────────────────────────────────────────────────
// Atoms
// ──────────────────────────────────────────────────────────────

function Eyebrow({ children, color = '#525964', className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <div
      className={`font-mono text-[11px] font-medium uppercase tracking-[0.1em] ${className}`}
      style={{ color }}
    >
      {children}
    </div>
  )
}

function StatusChip({ status, onLight = true }: { status: string; onLight?: boolean }) {
  const s = statusInfo(status)
  if (onLight) {
    return (
      <span
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
        style={{ background: s.chipBg, color: s.chipFg, borderColor: s.chipBorder }}
      >
        <span className="w-[7px] h-[7px] rounded-full" style={{ background: s.dotBg, boxShadow: `0 0 0 3px ${s.ringBg}` }} />
        {s.label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold border" style={{ background: 'rgba(255,255,255,0.15)', color: '#BBF7D0', borderColor: 'rgba(255,255,255,0.2)' }}>
      <span className="w-[7px] h-[7px] rounded-full" style={{ background: '#86EFAC', boxShadow: '0 0 0 3px rgba(255,255,255,0.15)' }} />
      {s.label}
    </span>
  )
}

function BankBadge({ bank }: { bank: Bank }) {
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
      style={{ background: bank.bg, color: bank.fg }}
    >
      {bank.short}
    </div>
  )
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // noop
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      className="bg-[#0096B8] hover:bg-[#006984] text-white text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1.5 transition flex-shrink-0"
      aria-label={label || `Copiar ${value}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

// ──────────────────────────────────────────────────────────────
// Bank tile
// ──────────────────────────────────────────────────────────────

function BankTile({ bank, primary }: { bank: Bank; primary?: boolean }) {
  return (
    <div
      className="relative bg-white border rounded-2xl p-5 flex flex-col gap-4"
      style={{
        borderColor: primary ? '#0096B8' : '#E9ECF1',
        boxShadow: primary ? '0 12px 24px -12px rgba(0,150,184,0.18)' : 'none',
      }}
    >
      {primary && (
        <div className="absolute -top-2.5 left-5 bg-[#0096B8] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Más usada
        </div>
      )}

      <div className="flex items-center gap-3">
        <BankBadge bank={bank} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[17px] text-[#0D1117] truncate" style={{ letterSpacing: '-0.01em' }}>{bank.name}</div>
          <div className="text-xs text-[#525964]">{bank.type}</div>
        </div>
      </div>

      <div className="bg-[#F6F7F9] rounded-xl p-3.5">
        <Eyebrow>Número</Eyebrow>
        <div className="flex items-center justify-between gap-3 mt-1.5">
          <div className="font-mono text-[18px] sm:text-[20px] font-medium text-[#0D1117] truncate" style={{ letterSpacing: '-0.01em' }}>
            {bank.number}
          </div>
          <CopyButton value={bank.number} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <Eyebrow>Titular</Eyebrow>
          <div className="font-semibold text-[#0D1117] mt-1">{bank.holder}</div>
        </div>
        <div>
          <Eyebrow>NIT</Eyebrow>
          <div className="font-mono font-medium text-[#0D1117] mt-1">{bank.nit}</div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────────────────────

export default function ClientesDashboardPage() {
  const router = useRouter()
  const token = useClientPortal((s) => s.token)
  const hydrated = useClientPortal((s) => s.hydrated)
  const storeCredit = useClientPortal((s) => s.credit)
  const setStoreCredit = useClientPortal((s) => s.setCredit)
  const logout = useClientPortal((s) => s.logout)

  const [credit, setCredit] = useState<ClientCredit | null>(storeCredit)
  const [loading, setLoading] = useState(!storeCredit)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hydrated) return
    if (!token) {
      router.replace('/clientes')
      return
    }

    let cancelled = false

    const fetchCredit = async () => {
      try {
        const res = await fetch('/api/client-portal/credit', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return
        if (res.status === 401) {
          logout()
          router.replace('/clientes')
          return
        }
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'No pudimos cargar tu crédito.')
          return
        }
        const c = data.credit as ClientCredit
        setCredit(c)
        setStoreCredit(c)
      } catch {
        if (!cancelled) setError('Error de conexión. Intenta recargar la página.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCredit()
    return () => {
      cancelled = true
    }
  }, [hydrated, token, router, setStoreCredit, logout])

  const handleLogout = () => {
    logout()
    sessionStorage.removeItem('client-portal-phone-hint')
    router.push('/clientes')
  }

  if (!hydrated || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#525964]">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p>Cargando tu crédito...</p>
      </div>
    )
  }

  if (error || !credit) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="bg-white border border-[#E9ECF1] rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error || 'No encontramos tu crédito.'}
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-[#0D1117] text-white rounded-xl font-semibold text-sm hover:bg-[#1F2530] transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const cardGradient = 'linear-gradient(135deg,#0096B8 0%,#2E5E9C 45%,#7A2A85 100%)'
  const customIdDisplay = credit.customId ? credit.customId.replace(/-/g, ' · ') : '—'
  const fullName = `${credit.solicitante.primerNombre} ${credit.solicitante.primerApellido}`.trim()

  return (
    <div className="min-h-[calc(100vh-200px)] text-[#0D1117]" style={{ background: 'linear-gradient(180deg,#F2FAFC 0%,#FFFFFF 280px)' }}>
      {/* Header */}
      <header className="px-4 md:px-8 lg:px-14 py-5 flex justify-between items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3.5">
          <Image src="/credion-mark.svg" alt="Credion" width={32} height={32} />
          <div>
            <div className="font-bold text-[17px] tracking-tight">Credion</div>
            <div className="text-[11px] text-[#525964] -mt-0.5">Portal de clientes</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, necesito soporte con mi crédito.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white border border-[#E9ECF1] rounded-xl text-[13px] font-medium text-[#0D1117] inline-flex items-center gap-2 hover:border-[#D5D9DF] transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#525964]" /> Soporte
          </a>
          <div className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 bg-white border border-[#E9ECF1] rounded-full">
            <div
              className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs"
              style={{ background: cardGradient }}
            >
              {initials(credit.solicitante.primerNombre, credit.solicitante.primerApellido)}
            </div>
            <div className="text-xs leading-tight hidden sm:block">
              <div className="font-semibold">{credit.solicitante.primerNombre}</div>
              <div className="text-[#525964] text-[11px]">CC {credit.solicitante.identificacion}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-7 h-7 flex items-center justify-center text-[#525964] hover:text-[#0D1117] transition"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero region */}
      <section className="px-4 md:px-8 lg:px-14 pt-2 pb-8 grid lg:grid-cols-[1fr_380px] gap-7">
        <div>
          <Eyebrow color="#006984">Bienvenido de vuelta</Eyebrow>
          <h1 className="text-3xl md:text-4xl lg:text-[44px] font-semibold mt-2 mb-6 text-[#0D1117]" style={{ letterSpacing: '-0.025em' }}>
            Hola, {credit.solicitante.primerNombre || 'cliente'}.{' '}
            <span className="text-[#8A919C] font-medium">Tu crédito está al día.</span>
          </h1>

          {/* Hero credit card */}
          <div
            className="relative overflow-hidden text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[300px] md:min-h-[340px]"
            style={{
              background: cardGradient,
              boxShadow: '0 24px 48px -16px rgba(83,31,87,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset',
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-32 -right-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 60%)' }} />
              <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,150,184,0.45), transparent 60%)' }} />
            </div>

            <div className="relative flex justify-between items-start gap-3">
              <div>
                <Eyebrow color="rgba(255,255,255,0.65)">Crédito Credion · Vehículo</Eyebrow>
                <div className="font-mono text-base md:text-lg mt-2 tracking-[0.08em] text-white/90">
                  {customIdDisplay}
                </div>
              </div>
              <StatusChip status={credit.status} onLight={false} />
            </div>

            <div className="relative">
              <Eyebrow color="rgba(255,255,255,0.65)">Monto aprobado</Eyebrow>
              <div className="font-semibold text-4xl md:text-5xl lg:text-[64px] mt-2 leading-none" style={{ letterSpacing: '-0.04em' }}>
                {formatCop(credit.fundingSummary?.approvedAmount)}
              </div>
              {credit.fundingSummary && (
                <div className="flex gap-6 mt-4 text-sm text-white/80">
                  <span>
                    <strong className="text-white font-semibold">{credit.fundingSummary.loanTermMonths}</strong> meses
                  </span>
                  <span className="w-px bg-white/25" />
                  <span>
                    Desembolso <strong className="text-white font-semibold">{formatCop(credit.fundingSummary.disbursementAmount)}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="relative flex justify-between items-end gap-3">
              <div>
                <Eyebrow color="rgba(255,255,255,0.55)">Titular</Eyebrow>
                <div className="font-semibold text-[15px] mt-1.5">{fullName || '—'}</div>
              </div>
              <Image src="/credion-mark.svg" alt="" width={48} height={48} className="invert opacity-90" />
            </div>
          </div>
        </div>

        {/* Side panels (desktop) */}
        <aside className="flex flex-col gap-4 lg:pt-14">
          <div className="bg-white border border-[#E9ECF1] rounded-2xl p-5">
            <Eyebrow color="#006984">Acción recomendada</Eyebrow>
            <h3 className="text-lg font-semibold mt-1.5 mb-2" style={{ letterSpacing: '-0.01em' }}>Próximo paso</h3>
            <p className="text-[13px] text-[#525964] mb-4 leading-relaxed">
              Tu cuota se paga por transferencia a una de las cuentas oficiales de Credion. Después envías el comprobante por WhatsApp.
            </p>
            <a
              href="#pagos"
              className="w-full py-3.5 px-4 bg-[#0D1117] text-white rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#1F2530] transition"
            >
              Ver cómo pagar <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white border border-[#E9ECF1] rounded-2xl p-5">
            <Eyebrow>Resumen</Eyebrow>
            <div className="mt-3 flex flex-col">
              <SummaryRow label="Monto aprobado" value={formatCop(credit.fundingSummary?.approvedAmount)} mono />
              <SummaryRow label="Plazo" value={credit.fundingSummary ? `${credit.fundingSummary.loanTermMonths} meses` : '—'} />
              <SummaryRow label="Desembolso" value={formatCop(credit.fundingSummary?.disbursementAmount)} mono />
              <SummaryRow label="Fecha de inicio" value={formatDate(credit.createdAt)} last />
            </div>
          </div>
        </aside>
      </section>

      {/* Pagos */}
      <section id="pagos" className="px-4 md:px-8 lg:px-14 pt-8 pb-6">
        <div className="flex justify-between items-end flex-wrap gap-3 mb-6">
          <div>
            <Eyebrow color="#531F57">Pagos</Eyebrow>
            <h2 className="text-2xl md:text-[32px] font-semibold mt-1.5 mb-1" style={{ letterSpacing: '-0.02em' }}>
              Cómo pagar tu cuota
            </h2>
            <p className="text-sm text-[#525964] m-0 max-w-xl">
              Transfiere desde tu banco a una de las cuentas oficiales de Credion. Sólo aceptamos depósitos a nombre de{' '}
              <strong className="text-[#0D1117]">CREDION SAS</strong>.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F4F8] text-[#006984] rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Cuentas verificadas
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAVINGS_BANKS.map((b, i) => (
            <BankTile key={b.name} bank={b} primary={i === 0} />
          ))}
        </div>

        {/* Comprobante CTA */}
        <div
          className="mt-7 p-6 md:p-7 rounded-3xl text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden"
          style={{ background: cardGradient }}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-32 right-44 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 60%)' }} />
          </div>
          <div className="relative max-w-xl">
            <Eyebrow color="rgba(255,255,255,0.7)">Último paso</Eyebrow>
            <h3 className="text-xl md:text-2xl font-semibold mt-1.5 mb-1" style={{ letterSpacing: '-0.02em' }}>
              ¿Ya transferiste? Mándanos el comprobante
            </h3>
            <p className="text-sm text-white/85 m-0">
              Sube la foto o PDF por WhatsApp. Confirmamos tu pago en menos de 24h hábiles e impactamos tu saldo automáticamente.
            </p>
          </div>
          <div className="relative flex flex-col gap-2.5 flex-shrink-0">
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, te envío el comprobante de pago de mi crédito ${credit.customId}.`)}`}
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
              Hablar con un asesor
            </a>
          </div>
        </div>
      </section>

      {/* Vehicle + Comprobantes */}
      <section className="px-4 md:px-8 lg:px-14 pt-6 pb-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E9ECF1] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F5EBF6] text-[#531F57] flex items-center justify-center flex-shrink-0">
            <Car className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <Eyebrow>Garantía del crédito</Eyebrow>
            <div className="text-lg font-semibold mt-1 truncate" style={{ letterSpacing: '-0.01em' }}>
              {credit.vehiculo.marca || '—'} {credit.vehiculo.modelo || ''}
            </div>
            <div className="text-[13px] text-[#525964]">
              {credit.vehiculo.valorComercial != null ? `Valor comercial · ${formatCop(credit.vehiculo.valorComercial)}` : 'Datos del vehículo'}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E9ECF1] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F8] text-[#006984] flex items-center justify-center flex-shrink-0">
            <Receipt className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <Eyebrow>Comprobantes</Eyebrow>
            <div className="text-lg font-semibold mt-1" style={{ letterSpacing: '-0.01em' }}>Habla con tu asesor</div>
            <div className="text-[13px] text-[#525964]">Pide extracto o paz y salvo por WhatsApp.</div>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, necesito información de mi crédito ${credit.customId}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#1FAA59] hover:bg-[#16A34A] text-white rounded-xl font-semibold text-[13px] inline-flex items-center gap-1.5 flex-shrink-0 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Escribir
          </a>
        </div>
      </section>

      <footer className="px-4 md:px-8 lg:px-14 pt-2 pb-8 flex flex-col md:flex-row justify-between gap-2 text-[11px] text-[#525964]">
        <span>Credion S.A.S. · NIT 901.831.706-1 · Vigilada Superintendencia Financiera de Colombia</span>
        <span className="font-mono">Sesión segura · token cifrado</span>
      </footer>
    </div>
  )
}

function SummaryRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <div
      className="flex justify-between items-center py-2.5 text-[13px]"
      style={{ borderBottom: last ? 'none' : '1px solid #E9ECF1' }}
    >
      <span className="text-[#525964]">{label}</span>
      <span className={`font-semibold text-[#0D1117] ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
