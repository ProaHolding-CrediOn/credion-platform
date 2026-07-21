import ConfirmarCorreoClient from './ConfirmarCorreoClient'

export const metadata = {
  title: 'Confirma tu correo | Credion',
}

export default async function ConfirmarCorreoPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <ConfirmarCorreoClient token={token} />
}
