import { ReactNode } from 'react'
import { ForceLightTheme } from './_components/ForceLightTheme'

// El layout fuerza light mode en /clientes/* y deja a cada página manejar su fondo.
export default function ClientesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ForceLightTheme />
      <div className="min-h-[calc(100vh-200px)] bg-white text-[#0D1117]">{children}</div>
    </>
  )
}
