'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, MessageCircle, AlertCircle } from 'lucide-react'
import { useClientPortal } from '@/stores/clientPortalStore'

const WHATSAPP = '573334310479'

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
      setError('Ingresá una cédula válida.')
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
      // Guardo identificacion temporalmente para el paso 2
      setToken('', id)
      sessionStorage.setItem('client-portal-phone-hint', data.phoneObfuscated || '')
      router.push('/clientes/verificacion')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <ShieldCheck className="w-4 h-4" /> Portal de Clientes
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">
          Ingresá a tu{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-500 dark:from-blue-400 dark:to-purple-300 bg-clip-text text-transparent">
            Área Personal
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Si ya tenés un crédito con nosotros, accedé con tu cédula. Te enviaremos un código por SMS
          al teléfono que registramos.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="identificacion" className="mb-2 block">
                Cédula de ciudadanía
              </Label>
              <Input
                id="identificacion"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="1234567890"
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1.5">Solo números, sin puntos ni espacios.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              {loading ? 'Enviando código...' : 'Enviar código por SMS'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-3">¿Problemas para ingresar?</p>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, no logro acceder al portal de clientes.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
            >
              <MessageCircle className="w-4 h-4" /> Escribinos por WhatsApp
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
