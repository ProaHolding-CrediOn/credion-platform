import { logError } from '@/lib/errorResponse'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { signedUrlId } = await req.json()

    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/signedUrl/${signedUrlId}/verify/formSolicitudLibreInversion`,
      { method: 'POST' },
    )

    if (!response.ok) {
      logError(response)
      return NextResponse.json({ error: 'Error al verificar el formulario' }, { status: 500 })
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Unexpected error in POST /api/forms/libre-inversion-solicitud/validate', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
