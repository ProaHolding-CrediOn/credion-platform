import { NextRequest, NextResponse } from 'next/server'

/**
 * El acortador de los enlaces de firma.
 *
 * El cliente recibe por WhatsApp `forms.credion.com.co/{codigo}` (37
 * caracteres) y aquí se le manda a `/firma/{codigo}`, que es la página de
 * verdad. Lo corto es lo que viaja por el chat; lo que acaba viendo en la barra
 * sigue diciendo "firma".
 *
 * El código son 8 caracteres en base 62 **con al menos un dígito y una
 * mayúscula**. Esa forma no es capricho: es lo que garantiza que un código
 * jamás pueda comerse una ruta del portal, que son todas palabras en minúscula
 * — y tres miden exactamente 8 (`clientes`, `contacto`, `vehiculo`). Mientras
 * las rutas nuevas se sigan nombrando en minúscula, no hay colisión posible y
 * no hay ninguna lista que mantener.
 */
const CODIGO_DE_FIRMA = /^\/(?=[^/]*[0-9])(?=[^/]*[A-Z])[0-9A-Za-z]{8}$/

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!CODIGO_DE_FIRMA.test(pathname)) return NextResponse.next()
  const destino = req.nextUrl.clone()
  destino.pathname = `/firma${pathname}`
  // 307 y no 308: el día que el acortador cambie, ningún navegador se habrá
  // quedado con la redirección cacheada para siempre.
  return NextResponse.redirect(destino, 307)
}

export const config = {
  // Fuera del middleware todo lo que no puede ser un código: internos de Next,
  // la API y los archivos con extensión.
  matcher: ['/((?!_next/|api/|.*\\.).*)'],
}
