import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const token = req.headers.get('Authorization') as string
        
        if (!file) {
            return NextResponse.json({ error: 'No se encontró el archivo' }, { status: 400 })
        }

        const uploadRes = await fetch(`${process.env.CORE_SERVICE_API_URL}/media`, {
            method: 'POST',
            headers: {
                Authorization: token,
            },
            body: formData
        })

        const data = await uploadRes.json()

        if (!uploadRes.ok) {
            return NextResponse.json({ error: 'Error al subir el archivo' }, { status: uploadRes.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.log('Error in /api/media route', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
