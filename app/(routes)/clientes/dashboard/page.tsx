'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Landmark,
  CreditCard,
  Copy,
  Check,
  LogOut,
  Car,
  CalendarClock,
  Loader2,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  Receipt,
} from 'lucide-react'
import { useClientPortal, ClientCredit } from '@/stores/clientPortalStore'

const WHATSAPP = '573334310479'

// ────────────────────────────────────────────────────────────────────
// Métodos de pago (basado en GUÍA CLIENTES Credion)
// ────────────────────────────────────────────────────────────────────

const SAVINGS_BANKS = [
  {
    name: 'Bancolombia',
    type: 'Cuenta de Ahorros',
    number: '693-152169-93',
    holder: 'CREDION SAS',
    nit: '901.831.706-1',
  },
  {
    name: 'Davivienda',
    type: 'Cuenta de Ahorros',
    number: '0660-7000-1432',
    holder: 'CREDION SAS',
    nit: '901.831.706-1',
  },
  {
    name: 'BBVA',
    type: 'Cuenta de Ahorros',
    number: '477-001147-7',
    holder: 'CREDION SAS',
    nit: '901.831.706-1',
  },
]

const CREDIT_CARDS = [
  {
    name: 'Visa / Mastercard',
    note: 'Envianos los datos por WhatsApp y un asesor te ayuda con el pago seguro.',
  },
]

// ────────────────────────────────────────────────────────────────────
// Helpers de formato
// ────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  creado: { label: 'Solicitud creada', color: 'bg-slate-100 text-slate-700' },
  revision: { label: 'En revisión', color: 'bg-amber-100 text-amber-800' },
  preaprobado: { label: 'Preaprobado', color: 'bg-blue-100 text-blue-800' },
  aprobado: { label: 'Aprobado', color: 'bg-emerald-100 text-emerald-800' },
  tomado: { label: 'Tomado', color: 'bg-purple-100 text-purple-800' },
  desistido: { label: 'Desistido', color: 'bg-slate-100 text-slate-600' },
  rechazado: { label: 'No aprobado', color: 'bg-red-100 text-red-700' },
  duplicado: { label: 'Duplicado', color: 'bg-slate-100 text-slate-600' },
  cancelado: { label: 'Cancelado', color: 'bg-slate-100 text-slate-600' },
  test: { label: 'Prueba', color: 'bg-slate-100 text-slate-600' },
}

function statusBadge(status: string) {
  const s = STATUS_LABEL[status] || { label: status, color: 'bg-slate-100 text-slate-700' }
  return s
}

function formatCop(value: number | null | undefined) {
  if (value == null) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

// ────────────────────────────────────────────────────────────────────
// Componente de copy-to-clipboard
// ────────────────────────────────────────────────────────────────────

function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // noop
    }
  }
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
        aria-label={`Copiar ${label}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" /> Copiado
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Copiar
          </>
        )}
      </button>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Página principal
// ────────────────────────────────────────────────────────────────────

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
  const [tab, setTab] = useState<'savings' | 'credit'>('savings')

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
        if (!cancelled) setError('Error de conexión. Intentá recargar la página.')
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
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p>Cargando tu crédito...</p>
      </div>
    )
  }

  if (error || !credit) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 md:p-8 space-y-4">
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error || 'No encontramos tu crédito.'}
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    )
  }

  const badge = statusBadge(credit.status)
  const fullName = `${credit.solicitante.primerNombre} ${credit.solicitante.primerApellido}`.trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
            <ShieldCheck className="w-4 h-4" /> Portal de Clientes
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Hola, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{credit.solicitante.primerNombre}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Aquí está el estado de tu crédito Credion.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" /> Salir
        </Button>
      </div>

      {/* Tarjeta de crédito */}
      <Card>
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Solicitud</p>
              <p className="text-2xl font-bold font-mono">{credit.customId}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" /> Vehículo
              </p>
              <p className="font-medium">
                {credit.vehiculo.marca || '—'} {credit.vehiculo.modelo ? `· ${credit.vehiculo.modelo}` : ''}
              </p>
              {credit.vehiculo.valorComercial != null && (
                <p className="text-xs text-muted-foreground">
                  Valor comercial: {formatCop(credit.vehiculo.valorComercial)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" /> Solicitud creada
              </p>
              <p className="font-medium">{formatDate(credit.createdAt)}</p>
            </div>
          </div>

          {credit.fundingSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-700 font-medium uppercase tracking-wide">Monto aprobado</p>
                <p className="text-xl font-bold text-blue-900 mt-1">
                  {formatCop(credit.fundingSummary.approvedAmount)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-purple-700 font-medium uppercase tracking-wide">Plazo</p>
                <p className="text-xl font-bold text-purple-900 mt-1">
                  {credit.fundingSummary.loanTermMonths} meses
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide">Desembolso</p>
                <p className="text-xl font-bold text-emerald-900 mt-1">
                  {formatCop(credit.fundingSummary.disbursementAmount)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métodos de pago */}
      <Card>
        <CardContent className="p-6 md:p-8 space-y-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" /> Cómo pagar tu cuota
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Elegí el método que más te convenga. Recordá enviar el comprobante por WhatsApp.
            </p>
          </div>

          {/* Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setTab('savings')}
              className={`px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2 transition ${
                tab === 'savings' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-4 h-4" /> Cuenta de Ahorros
            </button>
            <button
              type="button"
              onClick={() => setTab('credit')}
              className={`px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2 transition ${
                tab === 'credit' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Tarjeta de Crédito
            </button>
          </div>

          {tab === 'savings' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAVINGS_BANKS.map((b) => (
                <div key={b.name} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold">{b.name}</h3>
                  </div>
                  <CopyableField label="Tipo" value={b.type} />
                  <CopyableField label="Número" value={b.number} />
                  <CopyableField label="Titular" value={b.holder} />
                  <CopyableField label="NIT" value={b.nit} />
                </div>
              ))}
            </div>
          )}

          {tab === 'credit' && (
            <div className="space-y-4">
              {CREDIT_CARDS.map((c) => (
                <div key={c.name} className="border rounded-lg p-5 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <h3 className="font-bold">{c.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{c.note}</p>
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                      `Hola, quiero pagar la cuota de mi crédito ${credit.customId} con tarjeta de crédito.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4" /> Pagar por WhatsApp
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* CTA enviar comprobante */}
          <div className="border-t pt-5">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Ya pagaste? Enviá el comprobante</p>
                <p className="text-sm text-muted-foreground">
                  Mandanos la foto del recibo por WhatsApp para confirmar tu pago.
                </p>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  `Hola, te envío el comprobante de pago de mi crédito ${credit.customId}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4" /> Enviar comprobante
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer info */}
      <p className="text-center text-xs text-muted-foreground">
        Sesión iniciada como {fullName} · CC {credit.solicitante.identificacion}
      </p>
    </div>
  )
}
