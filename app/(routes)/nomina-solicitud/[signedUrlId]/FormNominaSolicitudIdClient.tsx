'use client'

import FormCodeudorClient from '@/components/FormCodeudorClient'
import { useFormNominaSolicitud } from './useFormNominaSolicitud'

export default function FormNominaSolicitudIdClient({ signedUrlId }: { signedUrlId: string }) {
  return (
    <FormCodeudorClient
      signedUrlId={signedUrlId}
      store={useFormNominaSolicitud}
      apiBase="nomina-solicitud"
      submitKey="formSolicitudNomina"
      title="Solicitud de crédito por nómina"
    />
  )
}
