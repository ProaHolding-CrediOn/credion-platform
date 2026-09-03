/**
 * Por qué no se pudo abrir la cámara, dicho de forma que el cliente pueda
 * arreglarlo.
 *
 * Antes, los cuatro motivos que puede dar `getUserMedia` caían en el mismo
 * `catch` y se resolvían con un único consejo: «revisa el candado de la barra
 * del navegador». A quien tiene la cámara ocupada por otra aplicación, o abrió
 * el enlace dentro del navegador de WhatsApp, ese consejo no le sirve de nada:
 * mira el candado, ve el permiso concedido y se queda sin salida.
 */

export type AvisoDeCamara = { titulo: string; texto: string }

/**
 * Los nombres son los del estándar (`MediaStreamError.name`), no los mensajes,
 * que cambian con cada navegador y además vienen en inglés.
 */
export function avisoDeCamara(nombreDelError: unknown): AvisoDeCamara {
  switch (String(nombreDelError ?? '')) {
    case 'NotAllowedError':
    case 'SecurityError':
      return {
        titulo: 'Necesitamos tu cámara',
        texto:
          'Tienes bloqueado el permiso de la cámara para esta página. En iPhone: Ajustes → Safari → Cámara → Permitir. En Android: toca el candado junto a la dirección y activa la cámara. Después vuelve aquí y toca «Intentar de nuevo».',
      }
    case 'NotReadableError':
    case 'AbortError':
      return {
        titulo: 'Otra aplicación está usando la cámara',
        texto:
          'Cierra las aplicaciones que puedan estar usando la cámara (videollamadas, la cámara del teléfono) y toca «Intentar de nuevo».',
      }
    case 'NotFoundError':
    case 'OverconstrainedError':
      return {
        titulo: 'No encontramos una cámara',
        texto:
          'Este dispositivo no tiene cámara disponible. Abre el enlace que te enviamos por WhatsApp desde tu celular y podrás continuar.',
      }
    default:
      // El caso típico aquí es el navegador incrustado de WhatsApp o Instagram,
      // que bloquea la cámara sin dar un nombre de error reconocible.
      return {
        titulo: 'No pudimos abrir la cámara',
        texto:
          'Si abriste este enlace dentro de WhatsApp, toca los tres puntos y elige «Abrir en el navegador»; desde ahí sí funciona la cámara. Si ya estás en el navegador, toca «Intentar de nuevo».',
      }
  }
}

/**
 * El SDK de la prueba de vida habla en inglés y con nombres internos de AWS.
 * Enseñarle «AccessDeniedException» a un cliente en Medellín no le dice nada
 * y le hace pensar que hizo algo mal.
 */
export function avisoDePruebaDeVida(nombre: unknown): string {
  switch (String(nombre ?? '')) {
    case 'CameraAccessError':
    case 'NotAllowedError':
      return 'No pudimos usar tu cámara para la prueba de vida. Revisa el permiso de la cámara y vuelve a intentarlo.'
    case 'SessionNotFoundException':
    case 'SessionTimeoutError':
      return 'La prueba de vida caducó antes de completarse. Vuelve a intentarlo, sin cerrar la página.'
    case 'RuntimeError':
    case 'ServerError':
    case 'AccessDeniedException':
      return 'Tuvimos un problema técnico con la prueba de vida. No es culpa tuya: espera un momento y vuelve a intentarlo.'
    default:
      return 'La prueba de vida se interrumpió. Vuelve a intentarlo.'
  }
}
