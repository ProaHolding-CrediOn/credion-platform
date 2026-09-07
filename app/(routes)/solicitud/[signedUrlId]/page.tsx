import { Suspense } from 'react'
import FormSolicitudEnlaceClient from './FormSolicitudEnlaceClient'

/**
 * El formulario de solicitud de un crédito QUE YA EXISTE, abierto por enlace.
 *
 * Convive con `/solicitud/formulario`, que es el flujo público: en Next un
 * segmento fijo gana al dinámico, así que esa ruta sigue entrando por su página
 * de siempre y solo los uuid de un enlace caen aquí.
 */
export const metadata = {
  title: 'Formulario de solicitud | Credion',
}

export default async function Page({
  params,
}: {
  params: Promise<{ signedUrlId: string }>
}) {
  const { signedUrlId } = await params
  if (!signedUrlId) return

  return (
    <Suspense fallback={<div className="p-6 text-center">Validando formulario...</div>}>
      <FormSolicitudEnlaceClient signedUrlId={signedUrlId} />
    </Suspense>
  )
}
