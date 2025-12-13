import { logError } from "@/lib/errorResponse"
import { NextRequest, NextResponse } from "next/server"

type RouteParams = { countryId: string }

export async function GET(req: NextRequest, context: { params: Promise<RouteParams>}) {
    try {
        const { countryId } = await context.params
        const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/states?where[country][equals]=${countryId}&limit=0&sort=name`)

        if (!response.ok) {
            logError(response)
            return NextResponse.json({ error: "No se pudo cargar los estados" }, { status: 500 })
        }

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error in GET /api/countries/:countryId/states', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}