"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleMore } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, message } = formData;

    if (!name || !email || !message) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const recipient = "info@credion.com.co";
    const subject = `Consulta de ${encodeURIComponent(name)}`;
    const body = `
      Nombre: ${name}
      Correo: ${email}
      Mensaje:
      ${message}
    `.trim();

    const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Contáctanos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Información</h2>
            <p className="text-muted-foreground">
              Estamos aquí para ayudarte. Escríbenos por correo, llámanos o completa el formulario.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-sm text-muted-foreground">📞 Teléfonos</h3>
            <ul className="text-muted-foreground list-disc list-inside ml-2">
              <li>+57 301 773 0706</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm text-muted-foreground">✉️ Correos</h3>
            <ul className="text-muted-foreground list-disc list-inside ml-2">
              <li>info@credion.com.co</li>
            </ul>
          </div>

          <Link href="https://wa.me/573017730706" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer">
              <MessageCircleMore className="w-4 h-4 mr-2" />
              Escríbenos por WhatsApp
            </Button>
          </Link>
        </div>

        <div className="bg-muted p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Envíanos un Mensaje</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nombre</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu consulta..."
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            >
              Enviar Mensaje
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}