import { logError } from "@/lib/errorResponse"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
    try {
        // Lookup por formKey (requests.read es abierto: no requiere auth)
        const response = await fetch(
            `${process.env.CORE_SERVICE_API_URL}/requests?where[formKey][equals]=registro-compraventa&limit=1&depth=1&draft=false`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        if (!response.ok) {
            logError(response)
            return NextResponse.json({ error: "No se pudo cargar el formulario de registro" }, { status: 500 })
        }

        const data = await response.json()
        const doc = data?.docs?.[0]

        if (!doc) {
            console.error('No se encontró el request con formKey registro-compraventa')
            return NextResponse.json({ error: "No se pudo cargar el formulario de registro" }, { status: 500 })
        }

        return NextResponse.json(doc)
    } catch (error) {
        console.error('Unexpected error in GET /api/forms/compraventa', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization') as string
        const { formCompraventa, version } = await req.json()

        const response = await fetch(`${process.env.CORE_SERVICE_API_URL}/compraventa/registro`, {
            method: "POST",
            headers: {
                Authorization: token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ formCompraventa, version }),
        })

        // Leer el body una sola vez para poder propagar el mensaje del core
        const raw = await response.text()

        if (!response.ok) {
            console.error('Error enviando registro de compraventa al core-service', {
                status: response.status,
                body: raw.slice(0, 500),
            })
            let message = 'Error al enviar el formulario'
            try {
                const parsed = JSON.parse(raw)
                if (parsed?.error) message = parsed.error
            } catch {
                /* respuesta sin JSON: dejamos el mensaje por defecto */
            }
            return NextResponse.json({ error: message }, { status: response.status })
        }

        const data = raw ? JSON.parse(raw) : {}
        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error in POST /api/forms/compraventa', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
