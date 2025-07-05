import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json()

  const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: "Error al verificar el OTP" }, { status: 500 })
  }

  const data = await response.json()

  return NextResponse.json(data)
}
