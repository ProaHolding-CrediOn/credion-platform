import { Suspense } from "react"
import FormSolicitudIdClient from "./FormSolicitudIdClient"

export const metadata = {
    title: 'Formulario de Solicitud | Credion',
}

export default async function FormularioSolicitudPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
           <FormSolicitudIdClient />
        </Suspense>
    )
}