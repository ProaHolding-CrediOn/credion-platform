import { useState } from "react";

export function useOtpVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendPhone = async (telefono: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Enviando teléfono:", telefono);
      localStorage.setItem("telefonoEnviado", telefono);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    } catch (err) {
      const errorMessage = "Error al enviar el teléfono";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Verificando OTP:", otp);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (otp === "123456") {
        const fakeToken = "fake-jwt-token-123";
        localStorage.setItem("auth_token", fakeToken);
        localStorage.removeItem("telefonoEnviado");
        return { success: true, token: fakeToken };
      } else {
        throw new Error("Código inválido");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Código incorrecto";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendPhone,
    verifyOtp,
  };
}