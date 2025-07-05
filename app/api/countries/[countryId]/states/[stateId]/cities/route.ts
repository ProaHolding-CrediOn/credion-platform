import { Params } from "@/types/Params"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, context: { params: Promise<Params>}) {
    const { stateId } = await context.params
    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/cities?where[state][equals]=${stateId}&limit=0&sort=name`)

    if (!response.ok) {
        return NextResponse.json({ error: "No se pudo cargar las ciudades" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
}