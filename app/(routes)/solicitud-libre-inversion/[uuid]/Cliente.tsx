'use client'

import FormSolicitudInvitacionClient from '@/components/FormSolicitudInvitacionClient'
import { useFormLibreInversionSolicitud } from '@/app/(routes)/libre-inversion-solicitud/[signedUrlId]/useFormLibreInversionSolicitud'

export default function Cliente({ uuid }: { uuid: string }) {
  return (
    <FormSolicitudInvitacionClient
      uuid={uuid}
      apiBase="libre-inversion-solicitud"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store={useFormLibreInversionSolicitud as any}
      title="Solicitud de crédito de libre inversión"
    />
  )
}
