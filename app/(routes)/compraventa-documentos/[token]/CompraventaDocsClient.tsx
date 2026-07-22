'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, Upload, XCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Estado = 'cargando' | 'form' | 'invalido'
type Item = {
  id: string
  name: string
  estado: 'subiendo' | 'ok' | 'error' | 'duplicado'
  msg?: string
}

function Seccion({
  token,
  tipo,
  titulo,
  descripcion,
  onListo,
}: {
  token: string
  tipo: string
  titulo: string
  descripcion: string
  onListo: (tipo: string, listo: boolean) => void
}) {
  const [items, setItems] = useState<Item[]>([])
  // Nombres ya enviados (o en curso) en esta sección. Va en un ref y no en el
  // estado porque la comprobación tiene que ser SÍNCRONA: leerla desde el
  // updater de setItems deja pasar el duplicado (el updater no corre al
  // instante) y el archivo terminaba subido dos veces.
  const enviadosRef = useRef<Set<string>>(new Set())

  async function subir(file: File) {
    // Evita que el mismo archivo se suba dos veces: la gente reintenta al no ver
    // un botón de "enviar", y terminaba duplicado en la ficha.
    if (enviadosRef.current.has(file.name)) {
      setItems((p) => [
        ...p,
        {
          id: `dup-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          estado: 'duplicado',
          msg: 'Ya lo habías enviado',
        },
      ])
      return
    }
    enviadosRef.current.add(file.name)

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setItems((p) => [...p, { id, name: file.name, estado: 'subiendo' }])
    try {
      const fd = new FormData()
      fd.append('token', token)
      fd.append('tipo', tipo)
      fd.append('file', file)
      const r = await fetch('/api/forms/compraventa-documentos', { method: 'POST', body: fd })
      const d = await r.json().catch(() => ({}))
      const ok = r.ok && d.ok
      setItems((p) =>
        p.map((s) =>
          s.id === id ? { ...s, estado: ok ? 'ok' : 'error', msg: d.error || 'No se pudo subir' } : s,
        ),
      )
      if (ok) onListo(tipo, true)
      // Si falló, liberamos el nombre para que puedan reintentar ese archivo.
      else enviadosRef.current.delete(file.name)
    } catch {
      enviadosRef.current.delete(file.name)
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
                {it.estado === 'subiendo' && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                )}
                {it.estado === 'ok' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                {it.estado === 'duplicado' && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                {it.estado === 'error' && <XCircle className="h-4 w-4 shrink-0 text-red-600" />}
                <span className="truncate">{it.name}</span>
                {it.estado === 'subiendo' && (
                  <span className="shrink-0 text-xs text-muted-foreground">Enviando…</span>
                )}
                {it.estado === 'ok' && (
                  <span className="shrink-0 text-xs font-semibold text-emerald-600">✓ Enviado</span>
                )}
                {it.estado === 'duplicado' && (
                  <span className="shrink-0 text-xs text-muted-foreground">{it.msg}</span>
                )}
                {it.estado === 'error' && (
                  <span className="shrink-0 text-xs text-red-600">{it.msg}</span>
                )}
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
  const [listos, setListos] = useState<Record<string, boolean>>({})

  const marcarListo = (tipo: string, listo: boolean) =>
    setListos((p) => (p[tipo] === listo ? p : { ...p, [tipo]: listo }))
  const algoEnviado = Object.values(listos).some(Boolean)

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

          <p className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
            No hay botón de enviar: cada archivo se envía solo al seleccionarlo.
          </p>

          <Seccion
            token={token}
            tipo="camara_rut"
            titulo="Cámara de Comercio y/o RUT"
            descripcion="Adjunta la Cámara de Comercio y/o el RUT (uno o ambos)."
            onListo={marcarListo}
          />
          <Seccion
            token={token}
            tipo="identidad_rl"
            titulo="Documento de identidad del representante legal"
            descripcion="Adjunta el documento de identidad del representante legal (frente y respaldo si aplica)."
            onListo={marcarListo}
          />

          {algoEnviado && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  ¡Listo! Recibimos tus documentos
                </p>
                <p className="text-sm text-emerald-700/90 dark:text-emerald-400/90">
                  Ya quedaron guardados en Credion. No necesitas enviarlos de nuevo — puedes cerrar
                  esta página.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
