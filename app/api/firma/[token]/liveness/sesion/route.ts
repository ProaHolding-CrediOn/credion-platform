import { NextRequest, NextResponse } from 'next/server'
import { cabecerasDeOrigen } from '@/utils/origenDelCliente'

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  const body = await req.text()
  const r = await fetch(
    `${process.env.CORE_SERVICE_API_URL}/firma/${encodeURIComponent(token)}/liveness/sesion`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...cabecerasDeOrigen(req) }, body: body || '{}', cache: 'no-store' },
  )
  return NextResponse.json(await r.json().catch(() => ({ error: 'Error' })), { status: r.status })
}
