import { Suspense } from 'react'
import FormCodeudorSolicitudIdClient from './FormCodeudorSolicitudIdClient'

export const metadata = {
  title: 'Formulario de solicitud del codeudor | Credion',
}

export default async function FormularioCodeudorSolicitudPage({
  params,
}: {
  params: Promise<{ signedUrlId: string }>
}) {
  const { signedUrlId } = await params

  if (!signedUrlId) return

  return (
    <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
      <FormCodeudorSolicitudIdClient signedUrlId={signedUrlId} />
    </Suspense>
  )
}
