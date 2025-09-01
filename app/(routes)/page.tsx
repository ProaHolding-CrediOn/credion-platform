'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Play } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <div className="mb-8">
        <Image
          src="/logo_text.svg"
          alt="Credion"
          width={240}
          height={100}
          priority
        />
      </div>

      <h1 className="text-3xl font-light text-foreground mb-4">
        Bienvenido a Credion
      </h1>
      <p className="text-base text-muted-foreground max-w-2xl mb-8">
        Esta página está dedicada a recopilar tu información para procesar tu
        solicitud de crédito de vehículo.  
        Durante este proceso pasaremos por diferentes etapas en las que nos
        comunicaremos contigo para avanzar de manera segura y transparente.
      </p>

      <Button
        onClick={() => router.push("/verificacion/telefono")}
      >
        <Play className="h-4 w-4" /> Iniciar proceso
      </Button>

      <p className="mt-10 text-sm text-muted-foreground">
        ¿Tienes alguna duda?{" "}
        <Link href="/contacto" className="text-sm text-muted-foreground hover:text-foreground underline">
            Contáctanos
        </Link>
      </p>
    </div>
  )
}
