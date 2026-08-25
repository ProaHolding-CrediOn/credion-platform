'use client'

import FormSolicitudInvitacionClient from '@/components/FormSolicitudInvitacionClient'
import { useFormNominaSolicitud } from '@/app/(routes)/nomina-solicitud/[signedUrlId]/useFormNominaSolicitud'

export default function Cliente({ uuid }: { uuid: string }) {
  return (
    <FormSolicitudInvitacionClient
      uuid={uuid}
      apiBase="nomina-solicitud"
      // Mismo store que el formulario por enlace firmado: es el MISMO formulario,
      // y darle un store propio duplicaría el borrador guardado en el navegador.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store={useFormNominaSolicitud as any}
      title="Solicitud de crédito por descuento de nómina"
    />
  )
}
