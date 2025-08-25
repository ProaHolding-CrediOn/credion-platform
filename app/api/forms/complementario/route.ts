import { logError } from "@/lib/errorResponse"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization') as string
        const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/requests/6871cc03082b0dd15c926aa1?depth=1&draft=false&locale=undefined`, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            logError(response)
            return NextResponse.json({ error: "No se pudo cargar el formulario" }, { status: 500 })
        }

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error in GET /api/forms/form-complementario', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization') as string
        const { creditId, formComplementario, version } = await req.json()

        const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/credit/form-complementario`, {
            method: "POST",
            headers: {
                Authorization: token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ creditId, formComplementario, version }),
        })

        if (!response.ok) {
            logError(response)
            return NextResponse.json({ error: "Error al enviar el formulario" }, { status: 500 })
        }

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error in POST /api/forms/form-complementario', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
