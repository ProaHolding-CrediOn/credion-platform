import { logError } from '@/lib/errorResponse'
import { NextRequest, NextResponse } from 'next/server'

// Definición del formulario del CODEUDOR-Complementario: se reutiliza la MISMA
// definición del formulario Complementario del solicitante (mismo Request en Payload).
const COMPLEMENTARIO_REQUEST_ID = '6871cc03082b0dd15c926aa1'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization') as string
    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/requests/${COMPLEMENTARIO_REQUEST_ID}?depth=1&draft=false&locale=undefined`,
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
    console.error('Unexpected error in GET /api/forms/codeudor-complementario', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization') as string
    const { creditId, formComplementarioCodeudor, version } = await req.json()

    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/credit/form-codeudor-complementario`,
      {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditId, formComplementarioCodeudor, version }),
      },
    )

    if (!response.ok) {
      logError(response)
      return NextResponse.json({ error: 'Error al enviar el formulario' }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in POST /api/forms/codeudor-complementario', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
