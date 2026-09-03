import { NextRequest, NextResponse } from 'next/server'
import { cabecerasDeOrigen } from '@/utils/origenDelCliente'
import { elCoreNoRespondio } from '@/utils/firma/faltaElCore'

/** Estado del sobre de firma (proxy al core). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params
    const r = await fetch(`${process.env.CORE_SERVICE_API_URL}/firma/${encodeURIComponent(token)}`, {
      headers: cabecerasDeOrigen(req),
      cache: 'no-store',
    })
    return NextResponse.json(await r.json().catch(() => ({})), { status: r.status })
  } catch (e) {
    return elCoreNoRespondio('/', e)
  }
}
