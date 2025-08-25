import { logError } from "@/lib/errorResponse"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })

    if (!response.ok) {
      logError(response)
      return NextResponse.json({ error: "Error al consumir el OTP" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in POST /api/otp/send', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
