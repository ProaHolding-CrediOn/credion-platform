import { NextRequest, NextResponse } from 'next/server'
import { cabecerasDeOrigen } from '@/utils/origenDelCliente'
import { elCoreNoRespondio } from '@/utils/firma/faltaElCore'

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params
    const body = await req.text()
    const r = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/firma/${encodeURIComponent(token)}/identidad`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...cabecerasDeOrigen(req) },
        body: body || '{}',
        cache: 'no-store',
      },
    )
    return NextResponse.json(await r.json().catch(() => ({})), { status: r.status })
  } catch (e) {
    return elCoreNoRespondio('/identidad', e)
  }
}
