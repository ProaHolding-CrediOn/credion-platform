import { Suspense } from 'react'
import FormNominaSolicitudIdClient from './FormNominaSolicitudIdClient'

export const metadata = {
  title: 'Solicitud de crédito por nómina | Credion',
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
      <FormNominaSolicitudIdClient signedUrlId={signedUrlId} />
    </Suspense>
  )
}
