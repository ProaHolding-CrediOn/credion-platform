'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PoliticasDePrivacidadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Políticas de Privacidad</h1>
          <p className="mt-3 text-muted-foreground">
            Última actualización: 7 de julio de 2025
          </p>
        </div>

        <section>
          <p className="text-lg leading-relaxed">
            En nuestra plataforma, valoramos tu privacidad y nos comprometemos a proteger tus datos personales. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestros servicios.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">1. Información que Recopilamos</h2>
          <p className="leading-relaxed text-muted-foreground">
            Podemos recopilar los siguientes tipos de información:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Datos personales:</strong> como nombre, correo electrónico, número de teléfono.</li>
            <li><strong>Datos financieros:</strong> si aplica, durante el proceso de solicitud.</li>
            <li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo, sistema operativo, entre otros.</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">2. Cómo Usamos Tu Información</h2>
          <p className="leading-relaxed text-muted-foreground">
            Utilizamos tu información para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Proporcionar y mejorar nuestros servicios.</li>
            <li>Procesar solicitudes y transacciones.</li>
            <li>Contactarte por correo o llamada, con tu consentimiento.</li>
            <li>Cumplir con obligaciones legales y regulatorias.</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">3. Compartición de la Información</h2>
          <p className="leading-relaxed text-muted-foreground">
            No vendemos ni alquilamos tus datos personales a terceros. Sin embargo, podemos compartir tu información con:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Socios de negocio:</strong> para cumplir con obligaciones contractuales.</li>
            <li><strong>Autoridades legales:</strong> si es requerido por ley.</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">4. Seguridad de los Datos</h2>
          <p className="leading-relaxed text-muted-foreground">
            Implementamos medidas técnicas y organizativas razonables para proteger tus datos contra accesos no autorizados, pérdida, uso indebido o alteración.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">5. Tus Derechos</h2>
          <p className="leading-relaxed text-muted-foreground">
            Tienes derecho a acceder, rectificar, eliminar o limitar el tratamiento de tus datos personales. Para ejercer estos derechos, contáctanos a través de nuestro formulario o al correo <Link href="mailto:contacto@credion.com.co" className="text-primary hover:underline">contacto@credion.com.co</Link>.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">6. Cambios a Esta Política</h2>
          <p className="leading-relaxed text-muted-foreground">
            Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Te notificaremos sobre cambios importantes mediante un aviso en nuestra plataforma o por correo electrónico.
          </p>
        </section>

        <div className="flex justify-center pt-6">
          <Link href="/terminos-de-uso">
            <Button variant="outline" className="w-full sm:w-auto">
              Ver términos de uso
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}