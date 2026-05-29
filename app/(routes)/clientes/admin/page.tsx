'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShieldCheck, AlertCircle, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useClientPortal } from '@/stores/clientPortalStore'

const ADMIN_JWT_KEY = 'client-portal-admin-jwt'

/**
 * Página oculta para QA — un admin pega su JWT una sola vez (queda en
 * sessionStorage) y después puede impersonar cualquier cliente tipeando
 * su cédula. Sin SMS, sin OTP.
 *
 * El JWT se obtiene de la cookie payload-token de api.credion.com.co
 * (F12 → Application → Cookies).
 */
export default function ClientesAdminPreviewPage() {
  const router = useRouter()
  const setToken = useClientPortal((s) => s.setToken)

  const [adminJwt, setAdminJwt] = useState('')
  const [showJwt, setShowJwt] = useState(false)
  const [identificacion, setIdentificacion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Recupero JWT de sessionStorage al montar
  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_JWT_KEY)
    if (saved) {
      setAdminJwt(saved)
      setInfo('JWT cargado desde la sesión anterior.')
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    const jwt = adminJwt.trim()
    if (!jwt || jwt.split('.').length !== 3) {
      setError('Pegá un JWT válido (formato: aaa.bbb.ccc)')
      return
    }

    const id = identificacion.trim().replace(/\D/g, '')
    if (!id || id.length < 5) {
      setError('Ingresá una cédula válida.')
      return
    }

    // Guardo el JWT en sessionStorage para no tener que pegarlo cada vez
    sessionStorage.setItem(ADMIN_JWT_KEY, jwt)

    setLoading(true)
    try {
      const res = await fetch('/api/client-portal/admin-impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${jwt}`,
        },
        body: JSON.stringify({ identificacion: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          setError('JWT inválido o expirado. Pegá uno nuevo (cookie payload-token de api.credion.com.co).')
          sessionStorage.removeItem(ADMIN_JWT_KEY)
        } else {
          setError(data.error || 'No pudimos generar la sesión.')
        }
        return
      }
      if (!data.token) {
        setError('La respuesta no tiene token.')
        return
      }
      setToken(data.token, id)
      const count = typeof data.creditsCount === 'number' ? data.creditsCount : 1
      router.push(count > 1 ? '/clientes/seleccionar' : '/clientes/dashboard')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const clearJwt = () => {
    setAdminJwt('')
    sessionStorage.removeItem(ADMIN_JWT_KEY)
    setInfo('JWT borrado.')
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F2FAFC] p-6">
      <div className="w-full max-w-xl bg-white border border-[#E9ECF1] rounded-3xl p-8 md:p-10 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Image src="/credion-mark.svg" alt="Credion" width={36} height={36} />
          <div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#9A3412]">
              ⚠ Modo Admin · QA
            </div>
            <div className="font-bold text-lg text-[#0D1117]">Vista previa del portal</div>
          </div>
        </div>

        <p className="text-sm text-[#525964] mb-6 leading-relaxed">
          Pegá tu JWT de admin (cookie <code className="font-mono text-[#0D1117] bg-[#F6F7F9] px-1.5 py-0.5 rounded text-xs">payload-token</code> de
          api.credion.com.co) y la cédula del cliente. Sin SMS. Solo para QA — todas las
          impersonations quedan logueadas en el backend.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* JWT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="adminJwt" className="text-[13px] font-medium text-[#0D1117]">
                JWT de admin
              </label>
              {adminJwt && (
                <button
                  type="button"
                  onClick={clearJwt}
                  className="text-[11px] text-[#9A3412] hover:underline"
                >
                  Borrar y pegar otro
                </button>
              )}
            </div>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#F6F7F9] border-[1.5px] border-[#E9ECF1] rounded-xl focus-within:border-[#0096B8]">
                <KeyRound className="w-4 h-4 text-[#8A919C] flex-shrink-0" />
                <input
                  id="adminJwt"
                  type={showJwt ? 'text' : 'password'}
                  autoComplete="off"
                  placeholder="eyJhbGciOi..."
                  value={adminJwt}
                  onChange={(e) => setAdminJwt(e.target.value)}
                  disabled={loading}
                  className="flex-1 border-none outline-none bg-transparent font-mono text-[13px] text-[#0D1117]"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowJwt((v) => !v)}
                className="flex-shrink-0 px-3 bg-white border border-[#E9ECF1] rounded-xl text-[#525964] hover:text-[#0D1117]"
                aria-label={showJwt ? 'Ocultar' : 'Mostrar'}
              >
                {showJwt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[#525964] mt-1.5">
              Se guarda en sessionStorage del navegador. Borrá al terminar.
            </p>
          </div>

          {/* Cedula */}
          <div>
            <label htmlFor="identificacion" className="block text-[13px] font-medium text-[#0D1117] mb-2">
              Cédula del cliente
            </label>
            <input
              id="identificacion"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="1234567890"
              value={identificacion}
              onChange={(e) => setIdentificacion(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3.5 bg-white border-[1.5px] border-[#E9ECF1] rounded-xl font-mono text-[17px] text-[#0D1117] outline-none focus:border-[#0096B8] focus:shadow-[0_0_0_4px_rgba(0,150,184,0.12)] transition"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {info && !error && (
            <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-[#0D1117] text-white rounded-xl font-semibold text-[15px] inline-flex items-center justify-center gap-2.5 hover:bg-[#1F2530] transition disabled:opacity-60"
          >
            {loading ? 'Generando sesión...' : (
              <>
                Ingresar como cliente <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Helper */}
        <details className="mt-6 text-[12px] text-[#525964]">
          <summary className="cursor-pointer hover:text-[#0D1117]">¿Cómo saco el JWT?</summary>
          <ol className="list-decimal list-inside mt-2 space-y-1 pl-2">
            <li>Abrí <code className="font-mono bg-[#F6F7F9] px-1 rounded">https://api.credion.com.co/admin</code> y logueate.</li>
            <li>F12 → tab <strong>Aplicación</strong> → <strong>Cookies</strong> → <code className="font-mono bg-[#F6F7F9] px-1 rounded">https://api.credion.com.co</code>.</li>
            <li>Buscá la fila <code className="font-mono bg-[#F6F7F9] px-1 rounded">payload-token</code>.</li>
            <li>Doble click en el value → Ctrl+C → pegalo arriba.</li>
            <li>Dura ~6h. Si expira, generá otro.</li>
          </ol>
        </details>
      </div>
    </div>
  )
}
