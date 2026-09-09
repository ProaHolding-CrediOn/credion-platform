import { NextRequest, NextResponse } from 'next/server'
import { cabecerasDeOrigen } from '@/utils/origenDelCliente'
import { elCoreNoRespondio } from '@/utils/firma/faltaElCore'

/** Cuántas páginas tiene el documento: el visor las pide una por una. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string; idx: string }> }) {
  try {
    const { token, idx } = await ctx.params
    const r = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/firma/${encodeURIComponent(token)}/documento/${encodeURIComponent(idx)}/paginas`,
      {
        headers: { 'x-sesion-firma': req.headers.get('x-sesion-firma') ?? '', ...cabecerasDeOrigen(req) },
        cache: 'no-store',
      },
    )
    return NextResponse.json(await r.json().catch(() => ({})), { status: r.status })
  } catch (e) {
    return elCoreNoRespondio('/documento/[idx]/paginas', e)
  }
}
