"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOtpVerification } from "@/hooks/useOtpVerification";
import { CustomPhoneField } from "@/components/CustomPhoneField";

export default function TelefonoPage() {
  const [telefono, setTelefono] = useState("");
  const [isValid, setIsValid] = useState(false);
  const { loading, error, sendPhone } = useOtpVerification();

  const handleSubmit = async () => {
    const result = await sendPhone(telefono);
    if (result.success) {
      window.location.href = "/verificacion/otp";
    }
  };

  const handleOnChange = (name: string, value: any) => {
    setTelefono(value);
  }

  const handleFieldValidation = (fieldName: string, isValid: boolean, value: any) => {
    setIsValid(isValid);
  };

  return (
    <div className="min-h-screen flex md:flex-col md:items-center md:justify-center">
      <div className="w-full md:w-1/2 px-4 flex flex-col items-center">
        <div className="w-full space-y-6 bg-background p-8 md:max-w-md md:border md:border-border md:shadow-sm md:rounded-lg">
          <h2 className="text-xl font-semibold text-foreground">Ingresa tu número de celular</h2>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div className="space-y-2">
              <CustomPhoneField
                name="telefono"
                label="Número de Celular"
                value = ""
                validations = {[{ name: "required", value: true }]}
                onChange = {handleOnChange}
                onValidationChange = {handleFieldValidation}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading || !isValid}>
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
    </div>
  );
}