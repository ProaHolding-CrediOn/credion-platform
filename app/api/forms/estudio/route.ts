import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization') as string
    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/requests/689be78856c7997b1000c71d?depth=1&draft=false&locale=undefined`, {
        headers: {
            Authorization: token,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        return NextResponse.json({ error: "No se pudo cargar el formulario" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
    const token = req.headers.get('Authorization') as string
    const { creditId, formEstudio, version } = await req.json()

    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/credit/form-estudio`, {
        method: "POST",
        headers: {
            Authorization: token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ creditId, formEstudio, version }),
    })

    if (!response.ok) {
        console.log('Error al enviar el formulario', await response.json())
        return NextResponse.json({ error: "Error al enviar el formulario" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
}
