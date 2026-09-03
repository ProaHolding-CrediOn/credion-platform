'use client'

/**
 * La red de seguridad de la ceremonia.
 *
 * Sin un `error.tsx`, cualquier excepción que escape de un componente le deja
 * al cliente la pantalla blanca de Next con «Application error: a client-side
 * exception has occurred» — en inglés, sin el logo y sin nada que tocar. El
 * caso que lo provoca de verdad no es un fallo de programación: es un despliegue
 * a mitad de firma. El navegador tiene cargada la página de la versión anterior
 * y pide un trozo de JavaScript que en el servidor ya no existe; la carga
 * diferida de la prueba de vida es justo uno de esos trozos.
 *
 * Recargar lo arregla siempre —la versión nueva sí tiene sus propios trozos— y
 * el avance está guardado en el servidor, así que el cliente vuelve a donde
 * estaba.
 */
import { Button } from '@/components/ui/button'

export default function ErrorDeCeremonia({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-start justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Se interrumpió la carga</h1>
      <p>
        No pudimos terminar de cargar esta página. Tu avance está guardado: vuelve a intentarlo y seguirás por donde
        ibas.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>Volver a intentarlo</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Recargar la página
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Si vuelve a ocurrir, cierra esta pestaña y abre otra vez el enlace que te enviamos por WhatsApp.
      </p>
    </div>
  )
}
