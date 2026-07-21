import { NextRequest, NextResponse } from 'next/server'

// Proxy de la página pública de corrección de correo (link enviado por WhatsApp
// cuando el correo del cliente rebota). GET: datos por token. POST: guarda el correo.
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token') || ''
    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/credit/confirmar-correo/${encodeURIComponent(token)}`,
      { headers: { 'Content-Type': 'application/json' } },
    )
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Unexpected error in GET /api/forms/confirmar-correo', error)
    return NextResponse.json({ ok: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, correo } = await req.json()
    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/credit/confirmar-correo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, correo }),
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Unexpected error in POST /api/forms/confirmar-correo', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
