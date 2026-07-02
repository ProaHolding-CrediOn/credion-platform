import { Suspense } from "react"
import RegistroCompraventaClient from "./RegistroCompraventaClient"

export const metadata = {
    title: 'Registro de Compraventas | Credion',
}

export default async function RegistroCompraventasPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Validando formulario...</div>}>
           <RegistroCompraventaClient />
        </Suspense>
    )
}
