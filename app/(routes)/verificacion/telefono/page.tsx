"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useOtpVerification } from "@/hooks/useOtpVerification";

export default function TelefonoPage() {
  const [telefono, setTelefono] = useState("");
  const { loading, error, sendPhone } = useOtpVerification();

  const handleSubmit = async () => {
    const result = await sendPhone(telefono);
    if (result.success) {
      window.location.href = "/verificacion/otp";
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/3 bg-muted"></div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-md space-y-6 bg-background p-8 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold text-foreground">Ingresa tu número de celular</h2>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-foreground">Número de Celular</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+57 300 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar código"}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/solicitud" className="text-sm text-muted-foreground hover:text-foreground">
              ← Volver
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-1/3 bg-muted"></div>
    </div>
  );
}