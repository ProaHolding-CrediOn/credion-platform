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
  // 🔴 El cuerpo de una Response se lee UNA sola vez. `logError` hace
  // `response.text()`, asi que llamarlo antes dejaba el cuerpo consumido y el
  // `json()` de aqui fallaba en silencio: el motivo real se perdia y salia
  // siempre el generico. Se lee una vez y se registra con lo leido.
  const crudo = await response.text().catch(() => '')
  let motivo = 'No se pudo cargar el formulario'
  try {
    const j = JSON.parse(crudo)
    if (j?.error) motivo = String(j.error)
  } catch {
    // El core no siempre responde JSON (un 502 del proxy, por ejemplo).
  }
  console.error('Error response from backend', {
    status: response.status,
    url: response.url,
    body: crudo.slice(0, 500),
  })
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
