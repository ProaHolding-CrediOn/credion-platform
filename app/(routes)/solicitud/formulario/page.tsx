"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { mapPayloadFormToSteps } from "@/utils/mapPayloadFormToSteps";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import FormRenderer from "@/components/FormRenderer/FormRenderer";
import { Button } from "@/components/ui/button";
import api from "@/lib/axiosInstance";

export default function FormularioPage() {
  const { isAuthenticated, loading } = useAuth();
  const [steps, setSteps] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/solicitud";
    }

    const fetchForm = async () => {
      try {
        const response = await api.get('requests/6843a81c9c595f644861a92e?depth=1&draft=false&locale=undefined', { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } });

        if (!response.data) {
          throw new Error("Error al cargar el formulario");
        }

        const data = response.data;
        const mappedSteps = mapPayloadFormToSteps(data);
        setSteps(mappedSteps);
      } catch (error) {
        console.error("No se pudo cargar el formulario:", error);
      }
    };

    fetchForm();
  }, [isAuthenticated, loading]);

  const handleSubmit = async (formData: any) => {
    setSubmitting(true);

    try {
      const response = await api.post('credit/form-solicitud', { formSolicitud: formData }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } });

      if (!response.data) {
        throw new Error('Error al enviar el formulario');
      }

      setDialogMessage('Gracias por su información, prontamente nos estaremos comunicando.')
      setShowDialog(true);
      return true;
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setDialogMessage('Ha ocurrido un error. Por favor, intenta nuevamente.');
      setShowDialog(true);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    window.location.href = "/";
  }

  if (loading || !steps.length) {
    return (
      <div className="flex flex-col bg-background text-foreground">
        <main className="flex-1 w-full">
          <div className="w-full p-4 sm:p-6 md:p-8">
            <p className="text-muted-foreground">Cargando formulario...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background text-foreground">
      <main className="flex-1 w-full">
        <div className="w-full p-4 sm:p-6 md:p-8">
          <FormRenderer steps={steps} onSubmit={handleSubmit} submitting={submitting} />
        </div>
      </main>
      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMessage.includes("error") ? "Error" : "Éxito"}</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <Button onClick={handleDialogClose}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}