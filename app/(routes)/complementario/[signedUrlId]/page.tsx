import { Suspense } from "react"
import FormComplementarioIdClient from "./FormComplementarioIdClient"

export const metadata = {
    title: 'Formulario complementario | Credion',
}

export default async function FormularioComplementarioPage({ params }: { params: Promise<{ signedUrlId: string }>}) {
    const { signedUrlId } = await params

    if (!signedUrlId) return

    return (
        <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
           <FormComplementarioIdClient signedUrlId={signedUrlId} />
        </Suspense>
    )
}