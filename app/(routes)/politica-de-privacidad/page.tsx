import { Suspense } from "react"
import PoliticaPrivacidadClient from "./PoliticaPrivacidadClient"

export const metadata = {
    title: 'Política de Privacidad | Credion',
}

export default async function PoliticaPrivacidadPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Cargando información...</div>}>
           <PoliticaPrivacidadClient />
        </Suspense>
    )
}