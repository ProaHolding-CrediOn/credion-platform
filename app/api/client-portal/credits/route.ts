import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/client-portal/credits`, {
      method: 'GET',
      headers: { Authorization: auth },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error proxying /client-portal/credits', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
