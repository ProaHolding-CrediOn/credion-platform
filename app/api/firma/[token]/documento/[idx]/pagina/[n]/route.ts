import { NextRequest, NextResponse } from 'next/server'
import { cabecerasDeOrigen } from '@/utils/origenDelCliente'
import { elCoreNoRespondio } from '@/utils/firma/faltaElCore'

/**
 * Una página del documento como PNG.
 *
 * El celular no pinta un PDF incrustado, así que el visor muestra las páginas
 * como imágenes. La imagen se pide con el testigo en la cabecera, igual que el
 * PDF, y se dibuja desde un blob — que un `<img>` sí admite en cualquier
 * navegador.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ token: string; idx: string; n: string }> },
) {
  try {
    const { token, idx, n } = await ctx.params
    const r = await fetch(
      `${process.env.CORE_SERVICE_API_URL}/firma/${encodeURIComponent(token)}/documento/${encodeURIComponent(idx)}/pagina/${encodeURIComponent(n)}`,
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
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return elCoreNoRespondio('/documento/[idx]/pagina/[n]', e)
  }
}
