import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy hacia el core-service para que un admin pueda generar un token del
 * portal de clientes para cualquier cédula (sin OTP).
 *
 * El frontend (página /clientes/admin) le pasa el JWT del admin en el header
 * Authorization: JWT <token>. Lo reenviamos como header `cookie` para que
 * Payload lo reconozca como auth (la cookie de Payload se llama "payload-token").
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth) {
      return NextResponse.json({ error: 'Falta JWT de admin (Authorization header)' }, { status: 401 })
    }
    // Authorization: "JWT <token>" o "Bearer <token>" — extraigo el token crudo
    const match = auth.match(/^(?:JWT|Bearer)\s+(.+)$/i)
    const adminToken = match ? match[1].trim() : auth.trim()

    const body = await req.json()
    const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/client-portal/admin-impersonate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Payload v3 acepta auth via cookie payload-token o Authorization: JWT <token>
        Cookie: `payload-token=${adminToken}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error proxying /client-portal/admin-impersonate', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
