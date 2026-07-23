import { logError } from '@/lib/errorResponse'
import { NextRequest, NextResponse } from 'next/server'

// Definición del formulario del CODEUDOR-Solicitud: se reutiliza la MISMA
// definición del formulario de Solicitud del solicitante (mismo Request en Payload).
const SOLICITUD_REQUEST_ID = '6843a81c9c595f644861a92e'

// El codeudor NO compra el vehículo, así que el Paso 3 "Prefactibilidad de Tipo
// de Vehículo" se ELIMINA de su formulario. El Request es compartido con el del
// solicitante principal (que sí necesita esos datos), por eso el paso se quita
// acá en el proxy y no en la definición del formulario.
const PASO_VEHICULO_TITULO = /Prefactibilidad de Tipo de Veh/i

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function quitarPasoVehiculo(node: any): void {
  if (Array.isArray(node)) {
    // Se elimina del array el paso completo del vehículo.
    for (let i = node.length - 1; i >= 0; i--) {
      const hijo = node[i]
      if (hijo && typeof hijo === 'object' && typeof hijo.title === 'string' && PASO_VEHICULO_TITULO.test(hijo.title)) {
        node.splice(i, 1)
      } else {
        quitarPasoVehiculo(hijo)
      }
    }
    return
  }
  if (!node || typeof node !== 'object') return
  for (const k of Object.keys(node)) quitarPasoVehiculo(node[k])
}

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

    // El codeudor NO compra el vehículo: el Paso 3 se elimina del formulario.
    try {
      quitarPasoVehiculo(data)
    } catch {
      /* si la estructura cambió, devolvemos el formulario tal cual */
    }

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
