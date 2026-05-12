import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/client-portal/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error proxying /client-portal/request-otp', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
