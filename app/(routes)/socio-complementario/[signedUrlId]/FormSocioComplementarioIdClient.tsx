'use client'

import FormCodeudorClient from '@/components/FormCodeudorClient'
import { useFormSocioComplementario } from './useFormSocioComplementario'

export default function FormSocioComplementarioIdClient({
  signedUrlId,
}: {
  signedUrlId: string
}) {
  return (
    <FormCodeudorClient
      signedUrlId={signedUrlId}
      store={useFormSocioComplementario}
      apiBase="socio-complementario"
      submitKey="formComplementarioSocio"
      title="Formulario Complementario del Socio"
    />
  )
}
