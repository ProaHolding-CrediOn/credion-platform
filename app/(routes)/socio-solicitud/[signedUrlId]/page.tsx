import { Suspense } from 'react'
import FormSocioSolicitudIdClient from './FormSocioSolicitudIdClient'

export const metadata = {
  title: 'Formulario de solicitud del socio | Credion',
}

export default async function FormularioSocioSolicitudPage({
  params,
}: {
  params: Promise<{ signedUrlId: string }>
}) {
  const { signedUrlId } = await params

  if (!signedUrlId) return

  return (
    <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
      <FormSocioSolicitudIdClient signedUrlId={signedUrlId} />
    </Suspense>
  )
}
