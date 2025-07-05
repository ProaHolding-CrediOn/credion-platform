"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SolicitudPage() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-8 w-full">
      <div className="mb-6">
        <Image
          src="/logo_text.svg"
          alt="Logo de la aplicación"
          width={300}
          height={100}
        />
      </div>
      <div className="w-full max-w-xl px-4 sm:px-0">
        <div className="bg-card sm:bg-card sm:rounded-lg sm:shadow-md p-4 md:p-6 w-full space-y-4">
          <h1 className="text-2xl md:text-3xl font-light text-foreground">
            Comencemos con tu solicitud
          </h1>
          <p className="text-left text-muted-foreground max-w-md mx-auto font-light">
            Antes de comenzar, necesitamos algunos datos importantes:
          </p>
          <ul className="text-left text-sm md:text-base text-muted-foreground max-w-md mx-auto space-y-2 font-light">
            <li>- Tu número de teléfono celular</li>
            <li>- Tus datos personales básicos</li>
            <li>- Datos de tu cónyuge (si aplica)</li>
            <li>- Información básica del vehículo que deseas adquirir</li>
          </ul>
          <p className="text-left text-muted-foreground max-w-md mx-auto mt-2 font-light">
            Una vez completes la solicitud, nos estaremos contactando contigo para continuar con el proceso.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Input
              id="aceptar-politicas"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <Label htmlFor="aceptar-politicas" className="text-sm font-light">
              Acepto los{' '}
              <Link href="/terminos-de-uso" className="text-primary hover:underline">
                Términos de Uso
              </Link>{' '}
              y las{' '}
              <Link href="/politica-de-privacidad" className="text-primary hover:underline">
                Políticas de Privacidad
              </Link>
            </Label>
          </div>
          <Link href="/verificacion/telefono" passHref>
            <Button className="group w-full sm:w-auto justify-center" variant="outline" disabled={!isChecked}>
              Haz clic para comenzar
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}