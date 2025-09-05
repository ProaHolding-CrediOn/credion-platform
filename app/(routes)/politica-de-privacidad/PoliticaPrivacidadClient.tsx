'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PoliticaPrivacidadClient() {
  const pdfUrl = 'https://credion.s3.us-east-1.amazonaws.com/public/F-AC-091%20Credion%20Pol%C3%ADtica%20de%20Privacidad.pdf'

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-light">Pólitica de Privacidad</h1>
        </div>

        <div className="w-full h-[80vh] border border-border rounded-lg overflow-hidden shadow-sm">
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Politica de Privacidad"
          />
        </div>

        <div className="flex justify-center pt-6">
          <Link href="/">
            <Button variant="default" className="w-full sm:w-auto">
              ← Volver a la página principal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}