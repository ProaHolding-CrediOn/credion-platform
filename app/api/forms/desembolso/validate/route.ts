import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { signedUrlId } = await req.json()

    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/signedUrl/${signedUrlId}/verify/formDesembolso`, {
        method: "POST"
    })

    if (!response.ok) {
        console.log('Error al verificar el formulario', await response.json())
        return NextResponse.json({ error: "Error al verificar el formulario" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
}
