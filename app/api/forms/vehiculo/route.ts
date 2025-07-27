import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization') as string
    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/requests/6869af914342ba574d144ac5?depth=1&draft=false&locale=undefined`, {
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
    const { creditId, formVehiculo, version } = await req.json()

    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/credit/form-vehiculo`, {
        method: "POST",
        headers: {
            Authorization: token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ creditId, formVehiculo, version }),
    })

    if (!response.ok) {
        console.log('Error al enviar el formulario', await response.json())
        return NextResponse.json({ error: "Error al enviar el formulario" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
}
