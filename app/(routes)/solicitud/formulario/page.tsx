"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { mapPayloadFormToSteps } from "@/utils/mapPayloadFormToSteps";
import FormRenderer from "@/components/FormRenderer/FormRenderer";

export default function FormularioPage() {
  const { isAuthenticated, loading } = useAuth();
  const [steps, setSteps] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/solicitud";
    }

    const fetchForm = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/pages/682f5859eb0a0e6b219a68f4?depth=1&draft=false&locale=undefined");

        if (!res.ok) {
          throw new Error("Error al cargar el formulario");
        }

        const data = await res.json();
        const mappedSteps = mapPayloadFormToSteps(data);
        setSteps(mappedSteps);
      } catch (error) {
        console.error("No se pudo cargar el formulario:", error);
      }
    };

    fetchForm();
  }, [isAuthenticated, loading]);

  const handleSubmit = (formData: any) => {
    console.log("Datos finales:", formData);
    alert("✅ Formulario completado");
  };

  if (loading || !steps.length) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/3 bg-muted"></div>

      <div className="w-full md:w-1/2 flex flex-col justify-start md:justify-center p-8">
        <div className="w-full max-w-md space-y-6 bg-background p-8 rounded-lg shadow-sm border border-border mx-auto">
          <FormRenderer steps={steps} onSubmit={handleSubmit} />
        </div>
      </div>

      <div className="hidden md:flex w-1/3 bg-muted"></div>
    </div>
  );
}