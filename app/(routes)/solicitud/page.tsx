"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SolicitudPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/3 bg-muted"></div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-start p-8 text-center space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Comencemos con tu solicitud</h1>
        <p className="text-muted-foreground max-w-md">
          Necesitamos validar tu número de celular para continuar con el proceso de solicitud de crédito.
        </p>
        <Link href="/verificacion/telefono">
          <Button>Empezar</Button>
        </Link>
      </div>

      <div className="hidden md:flex w-1/3 bg-muted"></div>
    </div>
  );
}