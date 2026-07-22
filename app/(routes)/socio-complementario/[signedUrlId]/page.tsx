import { Suspense } from 'react'
import FormSocioComplementarioIdClient from './FormSocioComplementarioIdClient'

export const metadata = {
  title: 'Formulario complementario del socio | Credion',
}

export default async function FormularioSocioComplementarioPage({
  params,
}: {
  params: Promise<{ signedUrlId: string }>
}) {
  const { signedUrlId } = await params

  if (!signedUrlId) return

  return (
    <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
      <FormSocioComplementarioIdClient signedUrlId={signedUrlId} />
    </Suspense>
  )
}
