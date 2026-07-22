import { logError } from '@/lib/errorResponse'
import { NextRequest, NextResponse } from 'next/server'

// Definición del formulario del SOCIO-Solicitud: se reutiliza la MISMA
// definición del formulario de Solicitud del solicitante (mismo Request en Payload).
const SOLICITUD_REQUEST_ID = '6843a81c9c595f644861a92e'

// El socio NO compra el vehículo, así que el Paso 3 "Prefactibilidad de Tipo
// de Vehículo" no debe ser obligatorio para él. Como el Request es compartido con
// el formulario del solicitante principal (que SÍ requiere esos datos), relajamos
// `required` acá, en el proxy del socio, para NO afectar al solicitante.
const PASO_VEHICULO_TITULO = /Prefactibilidad de Tipo de Veh/i

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepUnrequire(node: any): void {
  if (Array.isArray(node)) {
    node.forEach(deepUnrequire)
    return
  }
  if (!node || typeof node !== 'object') return
  if (Object.prototype.hasOwnProperty.call(node, 'required')) node.required = false
  for (const k of Object.keys(node)) deepUnrequire(node[k])
}

// Busca el/los form(s) del paso de vehículo (por su `title`) y hace opcionales
// todos sus campos. Defensivo: si la estructura cambia, no rompe (deja el form igual).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function relajarRequeridosVehiculo(node: any): void {
  if (Array.isArray(node)) {
    node.forEach(relajarRequeridosVehiculo)
    return
  }
  if (!node || typeof node !== 'object') return
  if (typeof node.title === 'string' && PASO_VEHICULO_TITULO.test(node.title)) {
    deepUnrequire(node)
    return
  }
  for (const k of Object.keys(node)) relajarRequeridosVehiculo(node[k])
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

    // Paso 3 (vehículo) opcional SOLO para el socio.
    try {
      relajarRequeridosVehiculo(data)
    } catch {
      /* si la estructura cambió, devolvemos el formulario tal cual */
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in GET /api/forms/socio-solicitud', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization') as string
    const { creditId, formSolicitudSocio, version } = await req.json()

    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/credit/form-socio-solicitud`,
      {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditId, formSolicitudSocio, version }),
      },
    )

    if (!response.ok) {
      logError(response)
      return NextResponse.json({ error: 'Error al enviar el formulario' }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in POST /api/forms/socio-solicitud', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
