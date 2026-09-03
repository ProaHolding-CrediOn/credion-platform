/**
 * Qué se le dice al cliente cuando algo sale mal en la ceremonia de firma.
 *
 * La página trataba por igual TODO lo que no fuera un 2xx: un enlace que de
 * verdad no existe y un tropiezo momentáneo del servidor le decían lo mismo,
 * «este enlace no es válido». Los dos mensajes llevan a sitios opuestos: uno
 * manda al cliente a pedir otro enlace, el otro solo pide esperar un momento.
 * Decirle lo primero cuando pasa lo segundo le hace cerrar la página y no
 * volver, y del lado de Credion no queda ni rastro de por qué se cayó la firma.
 *
 * La regla es simple: el estado HTTP ya distingue de quién es el problema. Los
 * 4xx hablan del enlace o de lo que hizo el cliente —y ahí el servidor manda un
 * mensaje concreto que conviene respetar—; los 5xx y los cortes de red son
 * nuestros, y ahí lo honesto es decirlo y ofrecer reintentar.
 */

export type Aviso = {
  texto: string
  /** Si tiene sentido volver a intentarlo: solo lo nuestro se reintenta. */
  sePuedeReintentar: boolean
}

/** Cuando el `fetch` ni siquiera llegó a responder. */
export const SIN_CONEXION: Aviso = {
  texto:
    'No pudimos conectarnos. Revisa tu conexión a internet y vuelve a intentarlo; tu avance está guardado.',
  sePuedeReintentar: true,
}

const NUESTRO: Aviso = {
  texto:
    'Tuvimos un problema de nuestro lado. No es culpa de tu enlace: vuelve a intentarlo en un momento.',
  sePuedeReintentar: true,
}

const ENLACE_MUERTO: Aviso = {
  texto: 'Este enlace no es válido. Pídele a tu asesor que te lo reenvíe.',
  sePuedeReintentar: false,
}

/**
 * El mensaje del core solo se muestra si de verdad viene uno. Los cuerpos que
 * no son JSON —el HTML de error de nginx cuando un contenedor está caído, o una
 * respuesta vacía— llegan aquí como `undefined` y no deben acabar en pantalla.
 */
const VACIOS = ['error', 'internal server error', 'something went wrong.', 'bad gateway']

function limpio(mensaje: unknown): string {
  const t = typeof mensaje === 'string' ? mensaje.trim() : ''
  if (!t || t.length > 200) return ''
  // Un «Error» a secas no explica nada y, puesto en pantalla, aparenta ser un
  // motivo de verdad. Mejor caer al mensaje genérico, que al menos dice qué
  // hacer.
  return VACIOS.includes(t.toLowerCase()) ? '' : t
}

export function avisoPorEstado(estado: number, mensajeDelCore?: unknown): Aviso {
  // 404: el token no existe. Este es el ÚNICO caso en que el enlace está muerto
  // de verdad y pedir otro es lo correcto.
  if (estado === 404) return ENLACE_MUERTO

  // 5xx, y el 0 con el que marcamos «no hubo respuesta». El cliente no hizo
  // nada mal y no gana nada pidiendo otro enlace: el siguiente fallaría igual.
  if (estado === 0) return SIN_CONEXION
  if (estado >= 500) return NUESTRO

  // El resto de 4xx los explica el core, que sabe el motivo exacto (vencido,
  // reemplazado, demasiados intentos). Si no mandó texto, se cae al genérico
  // del enlace: un 4xx sin mensaje es un problema del enlace, no nuestro.
  const suyo = limpio(mensajeDelCore)
  if (suyo) return { texto: suyo, sePuedeReintentar: false }
  return ENLACE_MUERTO
}

/**
 * El mismo criterio para una respuesta ya recibida. Se separa del anterior
 * porque leer el cuerpo puede fallar por su cuenta: un 502 de nginx trae HTML,
 * y `r.json()` lanza sobre él.
 */
export async function avisoDeRespuesta(r: Response): Promise<Aviso> {
  let mensaje: unknown
  try {
    const cuerpo = await r.json()
    mensaje = cuerpo?.error ?? cuerpo?.message
  } catch {
    mensaje = undefined
  }
  return avisoPorEstado(r.status, mensaje)
}
