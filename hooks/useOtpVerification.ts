import api from "@/lib/axiosInstance";
import { useState } from "react";

export function useOtpVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function postPhone(phone: string) {
    const response = await api.post('otp/send', { phone });
    const data = response.data;
    return data;
  }

  async function postOtpVerification(phone: string, code: string) {
    const response = await api.post('otp/verify', { phone, code });
    const data = response.data;
    return data;
  }

  const sendPhone = async (telefono: string) => {
    try {
      setLoading(true);
      console.log("Enviando teléfono:", telefono);
      localStorage.setItem("phoneNumber", telefono);
      const response = await postPhone(telefono);
      return response;
    } catch (err) {
      setError("Error al enviar el teléfono");
      return { success: false, error: "Error al enviar el teléfono" };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      setLoading(true);
      console.log("Verificando OTP:", otp);
      const phone = localStorage.getItem("phoneNumber") as string;
      const response = await postOtpVerification(phone, otp);
      const token = response.token;
      if (token) {
        localStorage.setItem("auth_token", token);
        localStorage.removeItem("phoneNumber");
        return { success: true, token };
      } else {
        throw new Error("Código inválido o incorrect");
      }
    } catch (err: any) {
      setError("Código inválido incorrecto");
      return { success: false, error: "Código inválido o incorrecto" };
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