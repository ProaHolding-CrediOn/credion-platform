import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const p = await ctx.params
  const body = await req.text()
  const r = await fetch(
    `${process.env.CORE_SERVICE_API_URL}/firma/${encodeURIComponent(p.token)}/otp`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body || '{}',
      cache: 'no-store',
    },
  )
  return NextResponse.json(await r.json().catch(() => ({ error: 'Error' })), { status: r.status })
}
