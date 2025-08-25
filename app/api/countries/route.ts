import { logError } from "@/lib/errorResponse"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/countries?limit=0&sort=name`)

    if (!response.ok) {
      logError(response)
      return NextResponse.json({ error: "No se pudo cargar los paises" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in GET /api/countries', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
