import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization') as string
    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/requests/6871cc03082b0dd15c926aa1?depth=1&draft=false&locale=undefined`, {
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
        console.log('Error al enviar el formulario', await response.json())
        return NextResponse.json({ error: "Error al enviar el formulario" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
}
