'use client'

import FormCodeudorClient from '@/components/FormCodeudorClient'
import { useFormSolicitudEnlace } from './useFormSolicitudEnlace'

export default function FormSolicitudEnlaceClient({ signedUrlId }: { signedUrlId: string }) {
  return (
    <FormCodeudorClient
      signedUrlId={signedUrlId}
      store={useFormSolicitudEnlace}
      apiBase="solicitud-existente"
      submitKey="formSolicitud"
      title="Formulario de solicitud"
    />
  )
}
