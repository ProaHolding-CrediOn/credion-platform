import { Suspense } from 'react'
import FormCodeudorComplementarioIdClient from './FormCodeudorComplementarioIdClient'

export const metadata = {
  title: 'Formulario complementario del codeudor | Credion',
}

export default async function FormularioCodeudorComplementarioPage({
  params,
}: {
  params: Promise<{ signedUrlId: string }>
}) {
  const { signedUrlId } = await params

  if (!signedUrlId) return

  return (
    <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
      <FormCodeudorComplementarioIdClient signedUrlId={signedUrlId} />
    </Suspense>
  )
}
