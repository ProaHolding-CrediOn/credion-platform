"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SolicitudPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">

      <div className="w-full md:w-1/2 flex flex-col items-center justify-start p-8 text-center space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Comencemos con tu solicitud</h1>
        <p className="text-muted-foreground max-w-md">
          Por favor, sigue los pasos para completar tu solicitud y una vez finalizada, te contactaremos para continuar con el proceso.
        </p>
        <Link href="/verificacion/telefono">
          <Button>Haz clic para comenzar</Button>
        </Link>
      </div>

    </div>
  );
}