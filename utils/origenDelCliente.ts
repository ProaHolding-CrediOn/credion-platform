import type { NextRequest } from 'next/server'

/**
 * Las cabeceras que identifican a quien está firmando, para pasárselas al core.
 *
 * Sin esto, el core solo ve quién le habló — que es este contenedor — y la
 * bitácora de la firma acaba diciendo `172.19.0.4 / node` en vez de la
 * dirección y el navegador del cliente. Esa bitácora existe para sostener la
 * firma ante un juez, así que el dato tiene que ser el de la persona.
 *
 * `x-real-ip` la pone nginx con `$remote_addr` sobrescribiendo lo que mande el
 * cliente, así que es la de confianza. `x-forwarded-for` se reenvía tal cual
 * para no perder la cadena de proxies; el core sabe que de ahí solo puede
 * fiarse del último trozo.
 */
export function cabecerasDeOrigen(req: NextRequest): Record<string, string> {
  const cabeceras: Record<string, string> = {}
  const real = req.headers.get('x-real-ip')
  if (real) cabeceras['x-real-ip'] = real
  const reenviadas = req.headers.get('x-forwarded-for')
  if (reenviadas) cabeceras['x-forwarded-for'] = reenviadas
  const navegador = req.headers.get('user-agent')
  if (navegador) cabeceras['user-agent'] = navegador.slice(0, 300)
  return cabeceras
}
