import CompraventaDocsClient from './CompraventaDocsClient'

export const metadata = {
  title: 'Adjuntar documentos | Credion',
}

export default async function CompraventaDocsPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <CompraventaDocsClient token={token} />
}
