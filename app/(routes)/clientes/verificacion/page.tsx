'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { ShieldCheck, AlertCircle, MessageCircle, ArrowLeft } from 'lucide-react'
import { useClientPortal } from '@/stores/clientPortalStore'

const WHATSAPP = '573334310479'

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

  // Si no hay identificacion, vuelvo al login
  useEffect(() => {
    if (!hydrated) return
    if (!identificacion) {
      router.replace('/clientes')
      return
    }
    setPhoneHint(sessionStorage.getItem('client-portal-phone-hint') || '')
  }, [hydrated, identificacion, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (code.length !== 6) {
      setError('Ingresá los 6 dígitos del código.')
      return
    }
    if (!identificacion) {
      setError('Sesión expirada. Volvé a empezar.')
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
        setError('No recibimos el token. Intentá de nuevo.')
        return
      }
      setToken(data.token, identificacion)
      router.push('/clientes/dashboard')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!identificacion) {
      router.replace('/clientes')
      return
    }
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
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <ShieldCheck className="w-4 h-4" /> Verificación
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Ingresá tu{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            código
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Te enviamos un código de 6 dígitos por SMS{phoneHint ? ` al ${phoneHint}` : ''}.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(v) => setCode(v.replace(/\D/g, ''))}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                  <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                  <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                  <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                  <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                  <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {info && (
              <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {info}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              {loading ? 'Verificando...' : 'Verificar e ingresar'}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => router.push('/clientes')}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cambiar cédula
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || loading}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {resending ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-3">¿No recibiste el SMS?</p>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                'Hola, no recibí el código SMS para acceder al portal de clientes.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium"
            >
              <MessageCircle className="w-4 h-4" /> Escribinos por WhatsApp
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
