import { ReactNode } from 'react'

export default function ClientesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">{children}</div>
    </div>
  )
}
