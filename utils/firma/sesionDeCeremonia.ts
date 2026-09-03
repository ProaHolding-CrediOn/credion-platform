/**
 * El avance de la ceremonia sobrevive a un F5.
 *
 * El testigo que devuelve el OTP vivía solo en memoria de React. Cualquier cosa
 * que recargara la página —refrescar, girar el teléfono en un navegador que
 * descarta la pestaña, volver de la cámara, perder cobertura un segundo— tiraba
 * ese testigo y devolvía al cliente al acuerdo, obligándole a pedir OTRO código.
 * Como solo se admiten unos pocos códigos por cuarto de hora, dos o tres
 * refrescos podían dejar al firmante fuera de su propia firma.
 *
 * Se guarda en `sessionStorage` y no en `localStorage`: muere al cerrar la
 * pestaña, que es justo lo que dura una ceremonia. El testigo tampoco es un
 * secreto mayor que el propio enlace, que viaja en la URL y en el WhatsApp del
 * cliente; y no sirve en ningún otro sobre, porque el servidor lo firma sobre
 * el token y la hora de SU verificación.
 */

/** Una llave por sobre: dos enlaces abiertos a la vez no se pisan. */
function llave(token: string, que: 'sesion' | 'otp'): string {
  return `credion.firma.${token}.${que}`
}

/**
 * Todo acceso va envuelto: en modo privado de Safari, y con las cookies de
 * terceros bloqueadas, el simple hecho de LEER `sessionStorage` lanza. Si no se
 * puede guardar nada, la ceremonia se comporta como antes en vez de romperse.
 */
function almacen(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.sessionStorage
  } catch {
    return null
  }
}

export function leerSesion(token: string): string {
  try {
    return almacen()?.getItem(llave(token, 'sesion')) ?? ''
  } catch {
    return ''
  }
}

export function guardarSesion(token: string, sesion: string): void {
  try {
    if (sesion) almacen()?.setItem(llave(token, 'sesion'), sesion)
  } catch {
    /* sin almacén, el testigo vive solo en memoria como antes */
  }
}

/**
 * Se olvida cuando el sobre queda firmado y cuando el servidor rechaza el
 * testigo (401): un testigo caduco que se quedara guardado dejaría al cliente
 * dando vueltas contra una pantalla que no carga.
 */
export function olvidarSesion(token: string): void {
  try {
    const s = almacen()
    s?.removeItem(llave(token, 'sesion'))
    s?.removeItem(llave(token, 'otp'))
  } catch {
    /* nada que olvidar */
  }
}

/**
 * Si ya se pidió el código, el refresco lleva a la casilla de escribirlo y no
 * al botón de pedirlo: reenviar sin necesidad gasta uno de los pocos envíos
 * permitidos y le llega al cliente un segundo código que invalida el primero.
 */
export function otpYaPedido(token: string): boolean {
  try {
    return almacen()?.getItem(llave(token, 'otp')) === '1'
  } catch {
    return false
  }
}

export function anotarOtpPedido(token: string): void {
  try {
    almacen()?.setItem(llave(token, 'otp'), '1')
  } catch {
    /* sin almacén se vuelve a ver el botón de pedir el código */
  }
}
