import { NextResponse } from 'next/server'

/**
 * Qué responde un proxy de la firma cuando el core no contesta.
 *
 * Ninguna de las nueve rutas tenía `try/catch`. Si el contenedor del core está
 * reiniciándose, o la petición agota el tiempo, el `fetch` lanza dentro del
 * manejador y Next devuelve su propio 500 —con cuerpo HTML, no JSON—. Al
 * cliente le llegaba una respuesta que no se puede leer, y la página se lo
 * traducía como que su enlace no valía.
 *
 * 503 y no 500: dice «ahora mismo no, vuelve a intentarlo», que es exactamente
 * lo que pasa.
 */
export function elCoreNoRespondio(donde: string, e: unknown): NextResponse {
  // El detalle queda en el log del contenedor, no en la pantalla del cliente.
  console.log(`firma: el core no respondió en ${donde}`, e)
  return NextResponse.json(
    {
      error:
        'No pudimos conectarnos con Credion en este momento. Tu enlace sigue activo: vuelve a intentarlo en un minuto.',
    },
    { status: 503 },
  )
}
