'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  Car,
  ArrowRight,
  LogOut,
} from 'lucide-react'
import { useClientPortal, ClientCredit } from '@/stores/clientPortalStore'

const STATUS_LABEL: Record<string, { label: string; dotBg: string; chipBg: string; chipFg: string; chipBorder: string }> = {
  creado:      { label: 'Crédito en revisión', dotBg: '#F59E0B', chipBg: '#FEF3C7', chipFg: '#92400E', chipBorder: '#FCD34D' },
  revision:    { label: 'En revisión',         dotBg: '#F59E0B', chipBg: '#FEF3C7', chipFg: '#92400E', chipBorder: '#FCD34D' },
  preaprobado: { label: 'Preaprobado',         dotBg: '#2563EB', chipBg: '#DBEAFE', chipFg: '#1E40AF', chipBorder: '#93C5FD' },
  aprobado:    { label: 'Aprobado',            dotBg: '#16A34A', chipBg: '#DCFCE7', chipFg: '#15803D', chipBorder: '#BBF7D0' },
  tomado:      { label: 'Crédito activo',      dotBg: '#16A34A', chipBg: '#DCFCE7', chipFg: '#15803D', chipBorder: '#BBF7D0' },
  desistido:   { label: 'Desistido',           dotBg: '#64748B', chipBg: '#F1F5F9', chipFg: '#475569', chipBorder: '#CBD5E1' },
  rechazado:   { label: 'No aprobado',         dotBg: '#DC2626', chipBg: '#FEE2E2', chipFg: '#991B1B', chipBorder: '#FCA5A5' },
  duplicado:   { label: 'Duplicado',           dotBg: '#64748B', chipBg: '#F1F5F9', chipFg: '#475569', chipBorder: '#CBD5E1' },
  cancelado:   { label: 'Cancelado',           dotBg: '#64748B', chipBg: '#F1F5F9', chipFg: '#475569', chipBorder: '#CBD5E1' },
  test:        { label: 'Prueba',              dotBg: '#64748B', chipBg: '#F1F5F9', chipFg: '#475569', chipBorder: '#CBD5E1' },
}

function statusInfo(status: string) {
  return STATUS_LABEL[status] || STATUS_LABEL.creado
}

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

export default function ClientesSeleccionarPage() {
  const router = useRouter()
  const token = useClientPortal((s) => s.token)
  const hydrated = useClientPortal((s) => s.hydrated)
  const storeCredits = useClientPortal((s) => s.credits)
  const setCredits = useClientPortal((s) => s.setCredits)
  const setActiveCreditId = useClientPortal((s) => s.setActiveCreditId)
  const logout = useClientPortal((s) => s.logout)

  const [credits, setLocalCredits] = useState<ClientCredit[] | null>(storeCredits)
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
          setError(data.error || 'No pudimos cargar tus créditos.')
          return
        }
        const list = (data.credits as ClientCredit[]) || []
        setLocalCredits(list)
        setCredits(list)

        // Si solo hay 1, no tiene sentido mostrar el selector — redirigimos.
        if (list.length === 1) {
          setActiveCreditId(list[0].id)
          router.replace('/clientes/dashboard')
        }
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
  }, [hydrated, token, router, setCredits, setActiveCreditId, logout])

  const handlePick = (creditId: string) => {
    setActiveCreditId(creditId)
    router.push('/clientes/dashboard')
  }

  const handleLogout = () => {
    logout()
    sessionStorage.removeItem('client-portal-phone-hint')
    router.push('/clientes')
  }

  if (!hydrated || loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-[#525964]">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p>Cargando tus créditos...</p>
      </div>
    )
  }

  if (error || !credits) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#E9ECF1] rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error || 'No encontramos tus créditos.'}
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

  // Si llegamos acá con 1 crédito, el useEffect ya redirigió. Defensivo.
  if (credits.length <= 1) return null

  const first = credits[0]
  const fullName = `${first.solicitante.primerNombre} ${first.solicitante.primerApellido}`.trim()

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

        <div className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 bg-white border border-[#E9ECF1] rounded-full">
          <div
            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs"
            style={{ background: 'linear-gradient(135deg,#0096B8 0%,#2E5E9C 45%,#7A2A85 100%)' }}
          >
            {initials(first.solicitante.primerNombre, first.solicitante.primerApellido)}
          </div>
          <div className="text-xs leading-tight hidden sm:block">
            <div className="font-semibold">{first.solicitante.primerNombre}</div>
            <div className="text-[#525964] text-[11px]">CC {first.solicitante.identificacion}</div>
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
      </header>

      {/* Title */}
      <div className="px-5 md:px-10 lg:px-16 xl:px-20 pt-4 pb-2">
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[#006984]">
          Bienvenido de vuelta
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-[44px] font-semibold mt-2 mb-2 text-[#0D1117]" style={{ letterSpacing: '-0.025em' }}>
          Hola, {first.solicitante.primerNombre || 'cliente'}.
        </h1>
        <p className="text-base text-[#525964] mb-2">
          Tenés <strong className="text-[#0D1117]">{credits.length} créditos</strong> con nosotros. Elegí cuál querés ver.
        </p>
        <p className="text-[13px] text-[#8A919C]">{fullName}</p>
      </div>

      {/* Cards */}
      <section className="px-5 md:px-10 lg:px-16 xl:px-20 pt-6 pb-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        {credits.map((c, i) => {
          const status = statusInfo(c.status)
          const vehicleStr =
            [c.vehiculo.marca, c.vehiculo.linea].filter(Boolean).join(' ').trim() || 'Vehículo'
          const vehicleMeta = [
            c.vehiculo.modelo ? `Modelo ${c.vehiculo.modelo}` : null,
            c.vehiculo.valorComercial != null ? formatCop(c.vehiculo.valorComercial) : null,
          ]
            .filter(Boolean)
            .join(' · ')
          const customIdDisplay = c.customId ? c.customId.replace(/-/g, ' · ') : '—'
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handlePick(c.id)}
              className="text-left bg-white border border-[#E9ECF1] hover:border-[#0096B8] hover:shadow-lg rounded-3xl p-6 md:p-8 transition group focus:outline-none focus:border-[#0096B8] focus:ring-4 focus:ring-[#0096B8]/15"
            >
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[#525964]">
                    Crédito {i + 1} de {credits.length} · Vehículo
                  </div>
                  <div className="font-mono text-base md:text-lg mt-1 tracking-[0.06em] text-[#0D1117] font-medium">
                    {customIdDisplay}
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0"
                  style={{ background: status.chipBg, color: status.chipFg, borderColor: status.chipBorder }}
                >
                  <span className="w-[7px] h-[7px] rounded-full" style={{ background: status.dotBg }} />
                  {status.label}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5EBF6] text-[#531F57] flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[#0D1117] truncate">{vehicleStr}</div>
                    {vehicleMeta && (
                      <div className="text-xs text-[#525964] truncate">{vehicleMeta}</div>
                    )}
                  </div>
                </div>

                {c.fundingSummary && (
                  <div className="bg-[#F6F7F9] rounded-xl p-3.5">
                    <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[#525964]">
                      Monto aprobado
                    </div>
                    <div className="font-semibold text-2xl text-[#0D1117] mt-1" style={{ letterSpacing: '-0.025em' }}>
                      {formatCop(c.fundingSummary.approvedAmount)}
                    </div>
                    <div className="text-xs text-[#525964] mt-1">
                      {c.fundingSummary.loanTermMonths} meses · Desembolso {formatCop(c.fundingSummary.disbursementAmount)}
                    </div>
                  </div>
                )}

                <div className="text-xs text-[#525964]">
                  Solicitud creada · {formatDate(c.createdAt)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#F1F3F6]">
                <span className="text-[13px] font-semibold text-[#0096B8] group-hover:text-[#006984]">
                  Ver este crédito
                </span>
                <span className="w-8 h-8 rounded-full bg-[#0D1117] text-white flex items-center justify-center group-hover:translate-x-0.5 transition">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          )
        })}
      </section>

      <footer className="px-5 md:px-10 lg:px-16 xl:px-20 pt-2 pb-8 flex flex-col md:flex-row justify-between gap-2 text-[11px] text-[#525964]">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Credion S.A.S. · NIT 901.831.706-1 · Vigilada Superintendencia Financiera de Colombia
        </span>
        <span className="font-mono">Sesión segura · token cifrado</span>
      </footer>
    </div>
  )
}
