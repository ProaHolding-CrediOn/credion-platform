import { Suspense } from 'react'
import Cliente from './Cliente'

export const metadata = {
  title: 'Solicitud de crédito de libre inversión | Credion',
}

export default async function Page({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  if (!uuid) return null

  return (
    <Suspense fallback={<div className="p-6 text-center">Validando enlace…</div>}>
      <Cliente uuid={uuid} />
    </Suspense>
  )
}
