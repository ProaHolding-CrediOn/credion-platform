import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { signedUrlId, token } = await req.json()

    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/signedUrl/${signedUrlId}/verify/formEstudio`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        console.log('Error al verificar el formulario', await response.json())
        return NextResponse.json({ error: "Error al verificar el formulario" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
}
