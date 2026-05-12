import { ReactNode } from 'react'

// El layout es solo un wrapper que respeta el chrome del platform.
// Cada página (/clientes, /verificacion, /dashboard) maneja su propio fondo y estructura.
export default function ClientesLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-[calc(100vh-200px)] bg-white text-[#0D1117]">{children}</div>
}
