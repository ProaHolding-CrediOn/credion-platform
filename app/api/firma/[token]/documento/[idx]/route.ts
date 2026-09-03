import { NextRequest, NextResponse } from 'next/server'
import { cabecerasDeOrigen } from '@/utils/origenDelCliente'
import { elCoreNoRespondio } from '@/utils/firma/faltaElCore'

export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string; idx: string }> }) {
  try {
    const { token, idx } = await ctx.params
    const r = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/firma/${encodeURIComponent(token)}/documento/${encodeURIComponent(idx)}`,
      {
        headers: { 'x-sesion-firma': req.headers.get('x-sesion-firma') ?? '', ...cabecerasDeOrigen(req) },
        cache: 'no-store',
      },
    )
    if (!r.ok) {
      return NextResponse.json(await r.json().catch(() => ({})), { status: r.status })
    }
    return new NextResponse(r.body, {
      status: 200,
      headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return elCoreNoRespondio('/documento/[idx]', e)
  }
}
