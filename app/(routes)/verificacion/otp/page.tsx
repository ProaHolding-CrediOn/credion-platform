"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useOtpVerification } from "@/hooks/useOtpVerification";

export default function OtpPage() {
  const [code, setCode] = useState("");
  const { loading, error, verifyOtp } = useOtpVerification();

  useEffect(() => {
    const telefonoEnviado = localStorage.getItem("telefonoEnviado");

    if (!telefonoEnviado) {
      window.location.href = "/verificacion/telefono";
    }
  }, []);

  const handleSubmit = async () => {
    const result = await verifyOtp(code);
    if (result.success) {
      window.location.href = "/solicitud/formulario";
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/3 bg-muted"></div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-md space-y-6 bg-background p-8 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold text-foreground">Ingresa el código de verificación</h2>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-foreground">Código de 6 dígitos</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full">
              {loading ? "Verificando..." : "Verificar"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              ¿No recibiste el código?{" "}
              <button type="button" className="text-primary underline" disabled>
                Reenviar
              </button>
            </p>
          </form>

          <div className="text-center">
            <Link href="/verificacion/telefono" className="text-sm text-muted-foreground hover:text-foreground">
              ← Cambiar número
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-1/3 bg-muted"></div>
    </div>
  );
}