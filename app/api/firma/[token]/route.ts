import { NextRequest, NextResponse } from 'next/server'

/** Estado del sobre de firma (proxy al core). */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  const r = await fetch(`${process.env.CORE_SERVICE_API_URL}/firma/${encodeURIComponent(token)}`, {
    cache: 'no-store',
  })
  return NextResponse.json(await r.json().catch(() => ({ error: 'Error' })), { status: r.status })
}
