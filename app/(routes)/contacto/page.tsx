"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleMore } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
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
              <li>+34 630 92 76 47</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm text-muted-foreground">✉️ Correos</h3>
            <ul className="text-muted-foreground list-disc list-inside ml-2">
              <li>info@credion.com.co</li>
            </ul>
          </div>

          <Link href="https://wa.me/34630927647" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer">
              <MessageCircleMore className="w-4 h-4 mr-2" />
              Escríbenos por WhatsApp
            </Button>
          </Link>
        </div>

        <div className="bg-muted p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Envíanos un Mensaje</h2>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nombre</Label>
              <Input id="name" placeholder="Tu nombre" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="tu@email.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea id="message" placeholder="Escribe tu consulta..." rows={5} />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
              Enviar Mensaje
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}