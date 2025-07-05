import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {

  const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/countries?limit=0&sort=name`)

  if (!response.ok) {
    return NextResponse.json({ error: "No se pudo cargar los paises" }, { status: 500 })
  }

  const data = await response.json()

  return NextResponse.json(data)
}
