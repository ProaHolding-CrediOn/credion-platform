import { Suspense } from "react"
import FormVehiculoIdClient from "./FormVehiculoIdClient"

export const metadata = {
    title: 'Formulario de vehículo | Credion',
}

export default async function FormularioVehiculoPage({ params }: { params: Promise<{ signedUrlId: string }>}) {
    const { signedUrlId } = await params

    if (!signedUrlId) return

    return (
        <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
           <FormVehiculoIdClient signedUrlId={signedUrlId} />
        </Suspense>
    )
}