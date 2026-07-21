import { NextRequest, NextResponse } from 'next/server'

// Proxy de la página pública de documentos de una compraventa (link por token).
// GET: datos por token. POST: sube un archivo (multipart) al core.
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token') || ''
    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/compraventa/documentos/${encodeURIComponent(token)}`,
      { headers: { 'Content-Type': 'application/json' } },
    )
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Unexpected error in GET /api/forms/compraventa-documentos', error)
    return NextResponse.json({ ok: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const token = String(form.get('token') || '')
    const file = form.get('file')
    const tipo = String(form.get('tipo') || 'otro')
    if (!token || !file) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }
    const fwd = new FormData()
    fwd.append('file', file)
    fwd.append('tipo', tipo)
    const response = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/compraventa/documentos/${encodeURIComponent(token)}`,
      { method: 'POST', body: fwd },
    )
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Unexpected error in POST /api/forms/compraventa-documentos', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
