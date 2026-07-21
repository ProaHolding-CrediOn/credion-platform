'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Estado = 'cargando' | 'form' | 'invalido' | 'enviando' | 'ok'

export default function ConfirmarCorreoClient({ token }: { token: string }) {
  const [estado, setEstado] = useState<Estado>('cargando')
  const [nombre, setNombre] = useState('')
  const [correoAnterior, setCorreoAnterior] = useState('')
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    ;(async () => {
      try {
        const r = await fetch(`/api/forms/confirmar-correo?token=${encodeURIComponent(token)}`)
        const d = await r.json()
        if (!activo) return
        if (r.ok && d.ok) {
          setNombre(d.nombre || '')
          setCorreoAnterior(d.correoAnterior || '')
          setEstado('form')
        } else {
          setEstado('invalido')
        }
      } catch {
        if (activo) setEstado('invalido')
      }
    })()
    return () => {
      activo = false
    }
  }, [token])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const c = correo.trim().toLowerCase()
    if (!EMAIL_RE.test(c)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    setEstado('enviando')
    try {
      const r = await fetch('/api/forms/confirmar-correo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, correo: c }),
      })
      const d = await r.json()
      if (r.ok && d.ok) {
        setEstado('ok')
      } else {
        setError(d.error || 'No se pudo guardar. Intenta de nuevo.')
        setEstado('form')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setEstado('form')
    }
  }

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        {estado === 'cargando' && (
          <CardContent className="py-16 text-center text-muted-foreground">Cargando…</CardContent>
        )}

        {estado === 'invalido' && (
          <>
            <CardHeader>
              <CardTitle>Enlace no válido</CardTitle>
              <CardDescription>
                Este enlace ya fue usado o no es válido. Si necesitas corregir tu correo,
                comunícate con Credion.
              </CardDescription>
            </CardHeader>
          </>
        )}

        {estado === 'ok' && (
          <CardContent className="py-14 text-center">
            <div className="mb-4 text-5xl">✅</div>
            <h2 className="mb-2 text-xl font-semibold">¡Correo actualizado!</h2>
            <p className="text-muted-foreground">
              Gracias{nombre ? `, ${nombre}` : ''}. Ya registramos tu nuevo correo y seguiremos con
              tu solicitud. Puedes cerrar esta página.
            </p>
          </CardContent>
        )}

        {(estado === 'form' || estado === 'enviando') && (
          <>
            <CardHeader>
              <CardTitle>Confirma tu correo electrónico</CardTitle>
              <CardDescription>
                {nombre ? `Hola ${nombre}. ` : ''}
                El correo que registraste
                {correoAnterior ? ` (${correoAnterior})` : ''} nos rebotó y no pudimos contactarte.
                Escríbenos tu correo correcto para continuar con tu solicitud.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={enviar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo electrónico</Label>
                  <Input
                    id="correo"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    disabled={estado === 'enviando'}
                    required
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={estado === 'enviando'}>
                  {estado === 'enviando' ? 'Guardando…' : 'Confirmar correo'}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
