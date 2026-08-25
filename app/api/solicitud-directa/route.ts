import { logError } from '@/lib/errorResponse'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Envía la solicitud: de aquí nace el crédito.
 *
 * A diferencia de los otros formularios —que añaden un paso a un expediente que
 * ya existe—, esta es la primera vez que el crédito aparece. Por eso viaja el
 * `uuid` de la invitación: es lo que le dice al core qué tipo de crédito crear y
 * de quién era el enlace.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization') as string
    const { invitacion, formulario, version } = await req.json()

    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/credit/solicitud-directa`,
      {
        method: 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitacion, formulario, version }),
      },
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      logError(response)
      // El mensaje del core se conserva: distingue enlace vencido, ya usado y
      // celular que no coincide, y cada uno tiene una salida distinta para quien
      // está delante de la pantalla.
      return NextResponse.json(
        { error: data?.error || 'No se pudo enviar la solicitud' },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    // logError espera una Response del core; aquí lo que falló es la llamada
    // misma (red, JSON malformado), así que se registra el error tal cual.
    console.error('Error inesperado en %s', 'POST /api/solicitud-directa', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
