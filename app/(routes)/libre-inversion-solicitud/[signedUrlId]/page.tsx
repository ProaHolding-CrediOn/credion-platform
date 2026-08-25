import { Suspense } from 'react'
import FormLibreInversionSolicitudIdClient from './FormLibreInversionSolicitudIdClient'

export const metadata = {
  title: 'Solicitud de crédito de libre inversión | Credion',
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
      <FormLibreInversionSolicitudIdClient signedUrlId={signedUrlId} />
    </Suspense>
  )
}
