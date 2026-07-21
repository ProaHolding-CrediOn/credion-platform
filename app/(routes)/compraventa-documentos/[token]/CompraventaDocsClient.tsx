'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Upload, XCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Estado = 'cargando' | 'form' | 'invalido'
type Item = { id: string; name: string; estado: 'subiendo' | 'ok' | 'error'; msg?: string }

function Seccion({
  token,
  tipo,
  titulo,
  descripcion,
}: {
  token: string
  tipo: string
  titulo: string
  descripcion: string
}) {
  const [items, setItems] = useState<Item[]>([])

  async function subir(file: File) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setItems((p) => [...p, { id, name: file.name, estado: 'subiendo' }])
    try {
      const fd = new FormData()
      fd.append('token', token)
      fd.append('tipo', tipo)
      fd.append('file', file)
      const r = await fetch('/api/forms/compraventa-documentos', { method: 'POST', body: fd })
      const d = await r.json().catch(() => ({}))
      setItems((p) =>
        p.map((s) =>
          s.id === id
            ? { ...s, estado: r.ok && d.ok ? 'ok' : 'error', msg: d.error || 'No se pudo subir' }
            : s,
        ),
      )
    } catch {
      setItems((p) =>
        p.map((s) => (s.id === id ? { ...s, estado: 'error', msg: 'Error de conexión' } : s)),
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{titulo}</CardTitle>
        <CardDescription>{descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input px-4 py-6 text-sm text-muted-foreground transition hover:bg-muted">
          <Upload className="h-4 w-4" />
          Seleccionar archivo(s) — PDF o imagen
          <input
            type="file"
            className="hidden"
            accept="application/pdf,image/*"
            multiple
            onChange={(e) => {
              Array.from(e.target.files || []).forEach(subir)
              e.target.value = ''
            }}
          />
        </label>
        {items.length > 0 && (
          <ul className="space-y-1.5">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-2 text-sm">
                {it.estado === 'subiendo' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {it.estado === 'ok' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                {it.estado === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                <span className="truncate">{it.name}</span>
                {it.estado === 'error' && <span className="text-xs text-red-600">{it.msg}</span>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default function CompraventaDocsClient({ token }: { token: string }) {
  const [estado, setEstado] = useState<Estado>('cargando')
  const [razonSocial, setRazonSocial] = useState('')

  useEffect(() => {
    let activo = true
    ;(async () => {
      try {
        const r = await fetch(`/api/forms/compraventa-documentos?token=${encodeURIComponent(token)}`)
        const d = await r.json()
        if (!activo) return
        if (r.ok && d.ok) {
          setRazonSocial(d.nombreComercial || d.razonSocial || '')
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

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      {estado === 'cargando' && (
        <div className="py-16 text-center text-muted-foreground">Cargando…</div>
      )}

      {estado === 'invalido' && (
        <Card>
          <CardHeader>
            <CardTitle>Enlace no válido</CardTitle>
            <CardDescription>
              Este enlace no es válido. Comunícate con Credion para obtener uno nuevo.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {estado === 'form' && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Adjuntar documentos</h1>
            <p className="text-sm text-muted-foreground">
              {razonSocial ? `${razonSocial}. ` : ''}Sube los documentos de tu compraventa. Puedes
              subir uno o varios archivos en cada sección.
            </p>
          </div>

          <Seccion
            token={token}
            tipo="camara_rut"
            titulo="Cámara de Comercio y/o RUT"
            descripcion="Adjunta la Cámara de Comercio y/o el RUT (uno o ambos)."
          />
          <Seccion
            token={token}
            tipo="identidad_rl"
            titulo="Documento de identidad del representante legal"
            descripcion="Adjunta el documento de identidad del representante legal (frente y respaldo si aplica)."
          />

          <p className="text-center text-xs text-muted-foreground">
            Cuando cada archivo muestre un ✓, ya quedó guardado. Puedes cerrar la página.
          </p>
        </div>
      )}
    </div>
  )
}
