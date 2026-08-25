import { NextRequest, NextResponse } from 'next/server'

/**
 * Valida la invitación con la que el asesor le pide a alguien que solicite un
 * crédito. Es lo primero que hace la página: sin invitación válida no se pinta
 * el formulario.
 *
 * No lleva token: el cliente todavía no se ha verificado cuando abre el enlace
 * —la invitación es justamente lo que le da acceso—. El core solo devuelve el
 * tipo de crédito y si sigue vigente.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  try {
    const { uuid } = await params
    if (!uuid) {
      return NextResponse.json({ error: 'Falta el identificador' }, { status: 400 })
    }

    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/solicitud-invitacion/${uuid}`,
      { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
    )

    const data = await response.json().catch(() => ({}))

    // Se conserva el CÓDIGO del core: 404 (no existe), 410 (usada o vencida) y
    // su mensaje. Aplanarlo todo a 500 dejaría a la persona sin saber si el
    // enlace caducó o si nunca existió, que se resuelven distinto.
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || 'Este enlace no es válido', motivo: data?.motivo },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    // logError espera una Response del core; aquí lo que falló es la llamada
    // misma (red, JSON malformado), así que se registra el error tal cual.
    console.error('Error inesperado en %s', 'GET /api/solicitud-invitacion', error)
    return NextResponse.json({ error: 'No se pudo validar el enlace' }, { status: 500 })
  }
}
