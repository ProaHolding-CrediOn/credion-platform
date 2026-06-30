import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const token = req.headers.get('Authorization') as string

        if (!file) {
            return NextResponse.json({ error: 'No se encontró el archivo' }, { status: 400 })
        }

        // Reconstruir el FormData a partir de los bytes del archivo. Reenviar el
        // File-stream que viene directo de req.formData() puede fallar con
        // "Body is unusable: Body has already been read" en el runtime de Next;
        // materializar los bytes en un Blob nuevo evita ese problema.
        const arrayBuffer = await file.arrayBuffer()
        const outForm = new FormData()
        outForm.append(
            'file',
            new Blob([arrayBuffer], { type: file.type || 'application/octet-stream' }),
            file.name,
        )

        const uploadRes = await fetch(`${process.env.CORE_SERVICE_API_URL}/media`, {
            method: 'POST',
            headers: {
                Authorization: token,
            },
            body: outForm,
        })

        // Leer el body UNA sola vez. (Antes se hacia uploadRes.json() y luego
        // logError(uploadRes) volvia a leer el body -> ocultaba el error real
        // con "Body is unusable".)
        const raw = await uploadRes.text()

        if (!uploadRes.ok) {
            console.error('Error subiendo media a core-service', {
                status: uploadRes.status,
                body: raw.slice(0, 500),
            })
            // 401/403 = la sesion del cliente expiro (token vencido). Mensaje
            // accionable en vez del generico "Error al subir el archivo".
            if (uploadRes.status === 401 || uploadRes.status === 403) {
                return NextResponse.json(
                    {
                        error: 'Tu sesión expiró. Recarga la página e ingresa de nuevo para continuar.',
                        sessionExpired: true,
                    },
                    { status: 401 },
                )
            }
            return NextResponse.json(
                { error: 'Error al subir el archivo' },
                { status: uploadRes.status },
            )
        }

        const data = raw ? JSON.parse(raw) : {}
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in /api/media route', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
