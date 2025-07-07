import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { signedUrlId } = await req.json()

    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/signedUrl/${signedUrlId}/verify/formVehiculo`, {
        method: "POST"
    })

    if (!response.ok) {
        return NextResponse.json({ error: "Error al verificar el formulario" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
}
