"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CustomPhoneField from "@/components/CustomPhoneField/CustomPhoneField";
import { useRouter } from "next/navigation";
export default function TelefonoPage() {
  const router = useRouter();
  const [phone, setPhone] = useState({ codigoTelefono: '57', telefono: '' });
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendPhone = async (phone: { codigoTelefono: string, telefono: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      if (!response.ok) throw new Error()
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('phoneNumber', JSON.stringify(phone))
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.log('Error al enviar el teléfono:', error);
      setError("Error al enviar el teléfono");
      return { success: false }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const result = await sendPhone(phone);
    if (result.success) {
      router.push('/verificacion/otp')
    }
  };

  const handleOnChange = (name: string, value: any) => {
    setPhone(value);
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
                value={{ codigoPais: "", codigoTelefono: "", telefono: "" }}
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