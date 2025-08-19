import { Suspense } from "react"
import EstudioDeCreditoIdClient from "./EstudioDeCreditoIdClient"

export const metadata = {
    title: 'Estudio de Credito | Credion',
}

export default async function EstudioDeCreditoPage({ params }: { params: Promise<{ signedUrlId: string }>}) {
    const { signedUrlId } = await params

    if (!signedUrlId) return

    return (
        <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
           <EstudioDeCreditoIdClient signedUrlId={signedUrlId} />
        </Suspense>
    )
}