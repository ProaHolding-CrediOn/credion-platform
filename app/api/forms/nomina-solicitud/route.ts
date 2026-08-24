import { logError } from '@/lib/errorResponse'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Definición y envío del formulario de solicitud de crédito por nómina.
 *
 * El Request se busca por `formKey` y NO por un id fijo: el formulario lo crea un
 * seed al arrancar el core, así que su id cambia entre entornos. Hardcodearlo
 * obligaría a tocar este archivo cada vez que se recrea la base.
 */
const FORM_KEY = 'solicitud-nomina'

export async function GET() {
  try {
    // requests.read es abierto: este lookup no necesita token.
    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/requests?where[formKey][equals]=${FORM_KEY}&limit=1&depth=1&draft=false`,
      { headers: { 'Content-Type': 'application/json' } },
    )

    if (!response.ok) {
      logError(response)
      return NextResponse.json({ error: 'No se pudo cargar el formulario' }, { status: 500 })
    }

    const data = await response.json()
    const doc = data?.docs?.[0]

    if (!doc) {
      console.error(`No se encontró el request con formKey ${FORM_KEY}`)
      return NextResponse.json({ error: 'No se pudo cargar el formulario' }, { status: 500 })
    }

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Unexpected error in GET /api/forms/nomina-solicitud', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization') as string
    const body = await req.json()

    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/credit/form-nomina-solicitud`,
      {
        method: 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditId: body.creditId,
          formSolicitudNomina: body.formSolicitudNomina,
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
    console.error('Unexpected error in POST /api/forms/nomina-solicitud', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
