import { logError } from "@/lib/errorResponse"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { signedUrlId } = await req.json()

        const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/signedUrl/${signedUrlId}/verify/formDesembolso`, {
            method: "POST"
        })

        if (!response.ok) {
            logError(response)
            return NextResponse.json({ error: "Error al verificar el formulario" }, { status: 500 })
        }

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error in POST /api/forms/desembolso/validate', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
