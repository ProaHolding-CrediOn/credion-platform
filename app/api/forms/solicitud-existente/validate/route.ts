import { logError } from '@/lib/errorResponse'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Deja pasar el motivo REAL que dio el core, con su codigo.
 *
 * Los demas formularios por enlace aplanan cualquier fallo a un 500 «error al
 * verificar el formulario». Aqui no sirve: este enlace se niega a proposito en
 * dos casos que el cliente puede entender y resolver —«este formulario ya fue
 * diligenciado» y «el credito ya no esta activo»—, y convertirlos en un 500 mudo
 * deja al cliente mirando una pantalla rota y al asesor sin saber que paso.
 */
async function reenviarElMotivo(response: Response) {
  logError(response)
  let motivo = 'No se pudo cargar el formulario'
  try {
    const j = await response.json()
    if (j?.error) motivo = String(j.error)
  } catch {
    // El core no siempre responde JSON (un 502 del proxy, por ejemplo).
  }
  return NextResponse.json({ error: motivo }, { status: response.status })
}


export async function POST(req: NextRequest) {
  try {
    const { signedUrlId } = await req.json()

    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/signedUrl/${signedUrlId}/verify/formSolicitud`,
      { method: 'POST' },
    )

    if (!response.ok) {
      return reenviarElMotivo(response)
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Unexpected error in POST /api/forms/solicitud-existente/validate', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
