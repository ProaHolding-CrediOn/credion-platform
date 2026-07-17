import { logError } from '@/lib/errorResponse'
import { NextRequest, NextResponse } from 'next/server'

// Definición del formulario del CODEUDOR-Solicitud: se reutiliza la MISMA
// definición del formulario de Solicitud del solicitante (mismo Request en Payload).
const SOLICITUD_REQUEST_ID = '6843a81c9c595f644861a92e'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization') as string
    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/requests/${SOLICITUD_REQUEST_ID}?depth=1&draft=false&locale=undefined`,
      {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      logError(response)
      return NextResponse.json({ error: 'No se pudo cargar el formulario' }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in GET /api/forms/codeudor-solicitud', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization') as string
    const { creditId, formSolicitudCodeudor, version } = await req.json()

    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/credit/form-codeudor-solicitud`,
      {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditId, formSolicitudCodeudor, version }),
      },
    )

    if (!response.ok) {
      logError(response)
      return NextResponse.json({ error: 'Error al enviar el formulario' }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in POST /api/forms/codeudor-solicitud', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
