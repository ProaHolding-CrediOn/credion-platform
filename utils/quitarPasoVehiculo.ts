/**
 * Quita el paso «Prefactibilidad de Tipo de Vehículo» de la definición de un
 * formulario, para los formularios de CODEUDOR y de SOCIO.
 *
 * POR QUÉ EXISTE. Ni el codeudor ni el socio compran el vehículo, así que no
 * tiene sentido preguntarles marca, línea, modelo o cuota inicial. Pero los tres
 * formularios (titular, codeudor y socio) reutilizan el MISMO Request de Payload
 * —y el titular sí necesita ese paso—, así que no se puede quitar de la
 * definición: hay que quitarlo aquí, en el proxy, justo antes de servírselo a
 * quien no debe verlo.
 *
 * CÓMO IDENTIFICA EL PASO. Por DOS señales independientes; basta con que
 * coincida una:
 *
 *   1. `blockName` — el nombre interno del bloque. Es la clave con la que se
 *      guarda la respuesta (`formSolicitud['Paso 3'].prefactibilidadDeTipoDeVehiculo`)
 *      y con la que el backend la lee. Renombrarla rompería cosas de forma
 *      ruidosa, no silenciosa, así que es la señal fiable.
 *
 *   2. El título visible. Era la única señal hasta ahora, y es frágil: se edita
 *      desde el CMS sin tocar código. El día que alguien renombrara ese paso, el
 *      filtro dejaba de coincidir y el vehículo REAPARECÍA sin error ni rastro
 *      en los logs. Se conserva como respaldo por si el bloque se recrea con
 *      otro `blockName`.
 *
 * ESTRUCTURA REAL DEL FORMULARIO (cuidado, no es la obvia): los PASOS son
 * `data.layouts[]`; el `blockName` vive en `layouts[i].layout[j]` y el título un
 * nivel más adentro todavía, en `layouts[i].layout[j].form.title`.
 *
 * @returns cuántos pasos se quitaron. Cero significa que no se encontró: quien
 * llama debe avisar, porque implica que se está sirviendo el formulario entero.
 */

const BLOQUE_VEHICULO = 'prefactibilidadDeTipoDeVehiculo'
const TITULO_VEHICULO = /Prefactibilidad de Tipo de Veh/i

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function quitarPasoVehiculo(data: any): number {
  const layouts = data?.layouts
  if (!Array.isArray(layouts)) return 0

  let quitados = 0
  for (let i = layouts.length - 1; i >= 0; i--) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bloques: any[] = Array.isArray(layouts[i]?.layout) ? layouts[i].layout : []
    const esPasoVehiculo = bloques.some(
      (b) =>
        b?.blockName === BLOQUE_VEHICULO ||
        (typeof b?.form?.title === 'string' && TITULO_VEHICULO.test(b.form.title)),
    )
    if (esPasoVehiculo) {
      layouts.splice(i, 1)
      quitados++
    }
  }
  return quitados
}

/**
 * Igual que `quitarPasoVehiculo`, pero nunca lanza y DEJA RASTRO cuando no
 * encuentra el paso.
 *
 * Ese aviso es el punto entero de esta función: el fallo que se quiere detectar
 * no es una excepción, es un silencio. Si el filtro deja de coincidir, el
 * formulario se sirve completo y todo «funciona» —el codeudor simplemente
 * empieza a ver preguntas de un vehículo que no compra— sin que nada lo delate.
 *
 * @param formulario nombre del formulario, solo para el mensaje del log.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function quitarPasoVehiculoConAviso(data: any, formulario: string): void {
  try {
    if (quitarPasoVehiculo(data) === 0) {
      console.warn(
        `[${formulario}] No se encontró el paso del vehículo: se está sirviendo el ` +
          `formulario COMPLETO. Comprobar si el bloque '${BLOQUE_VEHICULO}' se renombró ` +
          `en el CMS, o si el paso ya se quitó de la definición del Request.`,
      )
    }
  } catch (error) {
    // Si la estructura cambió por completo, se devuelve el formulario tal cual:
    // es preferible a dejar al cliente sin formulario.
    console.error(`[${formulario}] Error al quitar el paso del vehículo`, error)
  }
}
