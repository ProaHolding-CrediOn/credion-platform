import { logError } from '@/lib/errorResponse'
import { NextRequest, NextResponse } from 'next/server'

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
      logError(response)
      return NextResponse.json({ error: 'No se pudo cargar el formulario' }, { status: 500 })
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
      logError(response)
      return NextResponse.json({ error: 'Error al enviar el formulario' }, { status: 500 })
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Unexpected error in POST /api/forms/solicitud-existente', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
