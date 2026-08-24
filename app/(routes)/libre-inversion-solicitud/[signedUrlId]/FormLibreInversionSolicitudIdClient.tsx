'use client'

import FormCodeudorClient from '@/components/FormCodeudorClient'
import { useFormLibreInversionSolicitud } from './useFormLibreInversionSolicitud'

export default function FormLibreInversionSolicitudIdClient({ signedUrlId }: { signedUrlId: string }) {
  return (
    <FormCodeudorClient
      signedUrlId={signedUrlId}
      store={useFormLibreInversionSolicitud}
      apiBase="libre-inversion-solicitud"
      submitKey="formSolicitudLibreInversion"
      title="Solicitud de crédito de libre inversión"
    />
  )
}
