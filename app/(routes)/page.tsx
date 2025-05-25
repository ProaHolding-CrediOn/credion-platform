import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Bienvenido a <span className="text-black">FinTaxi</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
                Ofrecemos créditos accesibles para conductores que quieren adquirir su propio taxi y comenzar a generar ingresos desde el primer día.
            </p>

            <Link href="/solicitud">
                <Button className="bg-black hover:bg-gray-800 text-white">
                Solicita tu Crédito Ahora
                </Button>
            </Link>
        </div>
    )
}