'use client'

import FormCodeudorClient from '@/components/FormCodeudorClient'
import { useFormCodeudorSolicitud } from './useFormCodeudorSolicitud'

export default function FormCodeudorSolicitudIdClient({ signedUrlId }: { signedUrlId: string }) {
  return (
    <FormCodeudorClient
      signedUrlId={signedUrlId}
      store={useFormCodeudorSolicitud}
      apiBase="codeudor-solicitud"
      submitKey="formSolicitudCodeudor"
      title="Formulario de Solicitud del Codeudor"
    />
  )
}
