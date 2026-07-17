'use client'

import FormCodeudorClient from '@/components/FormCodeudorClient'
import { useFormCodeudorComplementario } from './useFormCodeudorComplementario'

export default function FormCodeudorComplementarioIdClient({
  signedUrlId,
}: {
  signedUrlId: string
}) {
  return (
    <FormCodeudorClient
      signedUrlId={signedUrlId}
      store={useFormCodeudorComplementario}
      apiBase="codeudor-complementario"
      submitKey="formComplementarioCodeudor"
      title="Formulario Complementario del Codeudor"
    />
  )
}
