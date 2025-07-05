import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization') as string
    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/requests/6843a81c9c595f644861a92e?depth=1&draft=false&locale=undefined`, {
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
    const { formSolicitud } = await req.json()

    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/credit/form-solicitud`, {
        method: "POST",
        headers: {
            Authorization: token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ formSolicitud }),
    })

    if (!response.ok) {
        return NextResponse.json({ error: "Error al enviar el formulario" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
}
