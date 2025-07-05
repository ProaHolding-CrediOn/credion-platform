"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import Link from "next/link";

export default function OtpPage() {
  const [phone, setPhone] = useState({ codigoTelefono: '57', telefono: '' });
  const [code, setCode] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  useEffect(() => {
    const phoneNumber = JSON.parse(localStorage.getItem("phoneNumber") as string);

    if (!phoneNumber) {
      window.location.href = "/verificacion/telefono";
    } else {
      setPhone(phoneNumber);
    }
  }, []);

  const verifyOtp = async (phone: { codigoTelefono: string, telefono: string }, code: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      
      if (!response.ok) throw new Error()
      const data = await response.json()
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
        localStorage.removeItem('phoneNumber')
        return { success: true, token: data.token }
      }
      return { success: false }
    } catch (error) {
      console.log('Error al verificar el teléfono:', error);
      setError("Error al verificar el teléfono");
      return { success: false }
    } finally {
      setLoading(false);
    }
  };

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
    const result = await verifyOtp(phone, code);
    if (result.success) {
      window.location.href = "/solicitud/formulario";
    }
  };

  const handleChange = (value: string) => {
    setCode(value);
    if (value.length < 6) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

  const handleResendCode = async() => {
    setCanResend(false);
    setTimeLeft(60);
    setCode('');
    await sendPhone(phone);
  }

  return (
    <div className="min-h-screen flex md:flex-col md:items-center md:justify-center">
      <div className="w-full md:w-1/2 px-4 flex flex-col items-center">
        <div className="w-full space-y-6 bg-background p-8 md:max-w-md md:border md:border-border md:shadow-sm md:rounded-lg">
          <h2 className="text-xl font-light text-foreground">Ingresa el código de verificación</h2>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div className="space-y-2">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => handleChange(value)}
              >
                <div className="flex justify-center w-full">
                  {[0, 1, 2].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                  <InputOTPSeparator />
                  {[3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </div>
              </InputOTP>
            </div>

            {error && <p className="text-center text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={!isValid || loading}>
              {loading ? "Verificando..." : "Verificar"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              ¿No recibiste el código?{' '}
              {canResend ? (
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={handleResendCode}
                >
                  Reenviar
                </button>
              ) : (
                <span className="text-muted-foreground">
                  Espera {timeLeft} segundo{timeLeft !== 1 ? 's' : ''}...
                </span>
              )}
            </p>
          </form>

          <div className="text-center">
            <Link href="/verificacion/telefono" className="text-sm text-muted-foreground hover:text-foreground">
              ← Cambiar número
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}