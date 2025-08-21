import { Suspense } from "react"
import EstudioDeCreditoIdClient from "./EstudioDeCreditoIdClient"

export const metadata = {
    title: 'Estudio de Credito | Credion',
}

export default async function EstudioDeCreditoPage({ params, searchParams }:
    { params: Promise<{ signedUrlId: string }>, searchParams: Promise<{ reference?: string }>}) {
    const { signedUrlId } = await params
    if (!signedUrlId) return

    const { reference } = await searchParams
    if (!reference) return

    return (
        <Suspense fallback={<div className="p-6 text-center">Válidando formulario...</div>}>
           <EstudioDeCreditoIdClient signedUrlId={signedUrlId} token={reference} />
        </Suspense>
    )
}