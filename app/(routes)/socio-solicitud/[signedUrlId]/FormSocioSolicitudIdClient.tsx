'use client'

import FormCodeudorClient from '@/components/FormCodeudorClient'
import { useFormSocioSolicitud } from './useFormSocioSolicitud'

export default function FormSocioSolicitudIdClient({ signedUrlId }: { signedUrlId: string }) {
  return (
    <FormCodeudorClient
      signedUrlId={signedUrlId}
      store={useFormSocioSolicitud}
      apiBase="socio-solicitud"
      submitKey="formSolicitudSocio"
      title="Formulario de Solicitud del Socio"
    />
  )
}
