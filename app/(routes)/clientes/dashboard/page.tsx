'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowRight,
  LogOut,
  Car,
  Loader2,
  AlertCircle,
  MessageCircle,
  Receipt,
  ChevronsUpDown,
  Check,
} from 'lucide-react'
import { useClientPortal, ClientCredit } from '@/stores/clientPortalStore'
import { PaymentMethods } from '../_components/PaymentMethods'

const WHATSAPP = '573334310479'

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

// ──────────────────────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────────────────────

export default function ClientesDashboardPage() {
  const router = useRouter()
  const token = useClientPortal((s) => s.token)
  const hydrated = useClientPortal((s) => s.hydrated)
  const storeCredits = useClientPortal((s) => s.credits)
  const storeActiveId = useClientPortal((s) => s.activeCreditId)
  const setStoreCredits = useClientPortal((s) => s.setCredits)
  const setActiveCreditId = useClientPortal((s) => s.setActiveCreditId)
  const logout = useClientPortal((s) => s.logout)

  // Crédito activo derivado del store (con fallback al primero de la lista).
  const credit: ClientCredit | null =
    storeCredits?.find((c) => c.id === storeActiveId) ?? storeCredits?.[0] ?? null
  const credits: ClientCredit[] = storeCredits ?? []

  const [loading, setLoading] = useState(!storeCredits)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hydrated) return
    if (!token) {
      router.replace('/clientes')
      return
    }

    let cancelled = false

    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/client-portal/credits', {
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
        const list = (data.credits as ClientCredit[]) || []
        if (list.length === 0) {
          setError('No encontramos créditos asociados a tu cédula.')
          return
        }
        setStoreCredits(list)
      } catch {
        if (!cancelled) setError('Error de conexión. Intenta recargar la página.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCredits()
    return () => {
      cancelled = true
    }
  }, [hydrated, token, router, setStoreCredits, logout])

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
      <header className="px-5 md:px-10 lg:px-16 xl:px-20 py-5 flex justify-between items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3.5">
          <Image src="/credion-mark.svg" alt="Credion" width={32} height={32} />
          <div>
            <div className="font-bold text-[17px] tracking-tight">Credion</div>
            <div className="text-[11px] text-[#525964] -mt-0.5">Portal de clientes</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {credits.length > 1 && (
            <CreditSwitcher
              credits={credits}
              activeId={credit.id}
              onPick={(id) => setActiveCreditId(id)}
            />
          )}
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
      <section className="px-5 md:px-10 lg:px-16 xl:px-20 pt-4 pb-14 grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-10">
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
      <div className="px-5 md:px-10 lg:px-16 xl:px-20 pt-10 pb-10">
        <PaymentMethods
          customId={credit.customId}
          preference={credit.paymentPreference || 'savings'}
        />
      </div>

      {/* Vehicle + Comprobantes */}
      <section className="px-5 md:px-10 lg:px-16 xl:px-20 pt-6 pb-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E9ECF1] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F5EBF6] text-[#531F57] flex items-center justify-center flex-shrink-0">
            <Car className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <Eyebrow>Garantía del crédito</Eyebrow>
            <div className="text-lg font-semibold mt-1 truncate" style={{ letterSpacing: '-0.01em' }}>
              {[credit.vehiculo.marca, credit.vehiculo.linea].filter(Boolean).join(' ') || 'Vehículo'}
            </div>
            <div className="text-[13px] text-[#525964]">
              {[
                credit.vehiculo.modelo ? `Modelo ${credit.vehiculo.modelo}` : null,
                credit.vehiculo.valorComercial != null
                  ? `Valor ${formatCop(credit.vehiculo.valorComercial)}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Datos del vehículo'}
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

      <footer className="px-5 md:px-10 lg:px-16 xl:px-20 pt-2 pb-8 flex flex-col md:flex-row justify-between gap-2 text-[11px] text-[#525964]">
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

// ──────────────────────────────────────────────────────────────
// Credit switcher (header, solo si credits.length > 1)
// ──────────────────────────────────────────────────────────────

function CreditSwitcher({
  credits,
  activeId,
  onPick,
}: {
  credits: ClientCredit[]
  activeId: string
  onPick: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const activeIndex = credits.findIndex((c) => c.id === activeId)
  const active = credits[activeIndex] || credits[0]
  const activeCustomIdDisplay = active.customId ? active.customId.replace(/-/g, ' · ') : '—'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3.5 py-2 bg-white border border-[#E9ECF1] rounded-xl text-[13px] font-medium text-[#0D1117] inline-flex items-center gap-2.5 hover:border-[#0096B8] transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#525964]">
          Crédito {activeIndex + 1}/{credits.length}
        </span>
        <span className="font-mono text-[12px] text-[#0D1117]">{activeCustomIdDisplay}</span>
        <ChevronsUpDown className="w-3.5 h-3.5 text-[#8A919C]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E9ECF1] rounded-2xl shadow-lg z-30 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F1F3F6]">
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[#525964]">
              Tus créditos
            </div>
            <div className="text-[12px] text-[#525964] mt-0.5">Elegí cuál querés ver</div>
          </div>
          <ul role="listbox" className="max-h-80 overflow-y-auto">
            {credits.map((c, i) => {
              const isActive = c.id === activeId
              const status = statusInfo(c.status)
              const customIdDisplay = c.customId ? c.customId.replace(/-/g, ' · ') : '—'
              const vehicle = [c.vehiculo.marca, c.vehiculo.modelo].filter(Boolean).join(' ').trim()
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      onPick(c.id)
                      setOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-[#F9FAFB] transition flex items-start gap-3 ${
                      isActive ? 'bg-[#F2FAFC]' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A919C]">
                          Crédito {i + 1}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: status.chipBg, color: status.chipFg }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dotBg }} />
                          {status.label}
                        </span>
                      </div>
                      <div className="font-mono text-[13px] text-[#0D1117] font-medium">
                        {customIdDisplay}
                      </div>
                      {vehicle && (
                        <div className="text-[12px] text-[#525964] mt-0.5 truncate">{vehicle}</div>
                      )}
                    </div>
                    {isActive && <Check className="w-4 h-4 text-[#0096B8] flex-shrink-0 mt-1" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
