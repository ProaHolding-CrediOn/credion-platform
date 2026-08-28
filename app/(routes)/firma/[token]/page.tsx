import { Suspense } from 'react'
import FirmaClient from './FirmaClient'

export const metadata = {
  title: 'Firma electrónica | Credion',
}

export default async function FirmaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!token) return null
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando tu sobre de firma…</div>}>
      <FirmaClient token={token} />
    </Suspense>
  )
}
