import { Suspense } from "react"
import FormDesembolsoIdClient from "./FormDesembolsoIdClient"

export const metadata = {
    title: 'Formulario de desembolso | Credion',
}

export default async function FormularioDesembolsoPage({ params }: { params: Promise<{ signedUrlId: string }>}) {
    const { signedUrlId } = await params

    if (!signedUrlId) return

    return (
        <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
           <FormDesembolsoIdClient signedUrlId={signedUrlId} />
        </Suspense>
    )
}