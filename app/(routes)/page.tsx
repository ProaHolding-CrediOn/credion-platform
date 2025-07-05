'use client'

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.push('/solicitud')
        }, 50000)

        return () => clearTimeout(timeout)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="w-full md:w-1/2 flex flex-col items-center justify-start p-8 text-center space-y-6">
                <div className="animate-bounce mb-6">
                    <ArrowRightIcon className="h-18 w-18 mx-auto" />
                </div>
                <h1 className="text-2xl md:text-3xl font-light mt-6 text-foreground">
                    Te estamos redirigiendo a la página de solicitud
                </h1>
                <p className="mt-2 text-muted-foreground font-light">
                    Si no eres redirigido automáticamente,{" "}
                    <Link href="/solicitud" className="text-blue-500 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500">
                        haz clic aquí
                    </Link>.
                </p>
            </div>
      </div>
    );
}