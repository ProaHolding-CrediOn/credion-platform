import { Suspense } from "react"
import PoliticaTratamientoDatosClient from "./PoliticaTratamientoDatosClient"

export const metadata = {
    title: 'Política de Tratamiento de Datos Personales | Credion',
}

export default async function PoliticaTratamientoDatosPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Cargando información...</div>}>
           <PoliticaTratamientoDatosClient />
        </Suspense>
    )
}