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


/**
 * El formulario de solicitud (F-AC-02) de un crédito QUE YA EXISTE.
 *
 * No confundir con `/api/forms/solicitud`, que sirve el MISMO formulario para el
 * flujo público: allí el cliente entra sin enlace y su envío CREA un crédito.
 * Aquí llega por un enlace firmado y su envío rellena el crédito que el asesor
 * ya armó (financiación de seguro, retanqueo, crédito directo), sin abrirle uno
 * duplicado.
 *
 * ⚠️ El id va quemado, igual que en la ruta pública, porque ese Request es el
 * único de la casa SIN `formKey` —los de nómina y libre inversión sí lo tienen y
 * se buscan por él—. Si algún día se le pone uno, hay que cambiar los DOS sitios.
 */
const REQUEST_ID = '6843a81c9c595f644861a92e'

export async function GET() {
  try {
    // `requests.read` es abierto: la definición del formulario no lleva token.
    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/requests/${REQUEST_ID}?depth=1&draft=false`,
      { headers: { 'Content-Type': 'application/json' } },
    )

    if (!response.ok) {
      return reenviarElMotivo(response)
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Unexpected error in GET /api/forms/solicitud-existente', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization') as string
    const body = await req.json()

    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/credit/form-solicitud-existente`,
      {
        method: 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditId: body.creditId,
          formSolicitud: body.formSolicitud,
          version: body.version,
        }),
      },
    )

    if (!response.ok) {
      return reenviarElMotivo(response)
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Unexpected error in POST /api/forms/solicitud-existente', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
