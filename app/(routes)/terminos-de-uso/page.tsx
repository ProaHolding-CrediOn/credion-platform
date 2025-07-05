'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TerminosDeUsoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Términos de Uso</h1>
          <p className="mt-3 text-muted-foreground">
            Última actualización: 7 de julio de 2025
          </p>
        </div>

        <section>
          <p className="text-lg leading-relaxed">
            Bienvenido a nuestra plataforma. Al acceder o utilizar nuestros servicios, aceptas cumplir y estar sujeto a los siguientes términos y condiciones.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">1. Aceptación de los Términos</h2>
          <p className="leading-relaxed text-muted-foreground">
            Al usar esta aplicación, sitio web o servicio asociado, aceptas estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguno de estos términos, no deberías utilizar nuestros servicios.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">2. Uso del Servicio</h2>
          <p className="leading-relaxed text-muted-foreground">
            Nuestro servicio está destinado al uso personal y profesional autorizado. Queda prohibido el uso no autorizado, comercial indebido, reproducción parcial o total sin permiso expreso.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">3. Registro y Cuenta</h2>
          <p className="leading-relaxed text-muted-foreground">
            Para acceder a ciertas funciones, es posible que debas registrarte y proporcionar información precisa. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">4. Privacidad</h2>
          <p className="leading-relaxed text-muted-foreground">
            Tu privacidad es importante para nosotros. Consulta nuestra Política de Privacidad para conocer cómo recopilamos, usamos y protegemos tus datos personales.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">5. Modificaciones</h2>
          <p className="leading-relaxed text-muted-foreground">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente tras su publicación. Te recomendamos revisarlos periódicamente.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">6. Contacto</h2>
          <p className="leading-relaxed text-muted-foreground">
            Si tienes alguna pregunta sobre estos Términos de Uso, puedes contactarnos a través de nuestro formulario de contacto o al correo electrónico: <Link href="mailto:contacto@credion.com.co" className="text-primary hover:underline">contacto@credion.com.co</Link>.
          </p>
        </section>

        <div className="flex justify-center pt-6">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Volver a la página principal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}