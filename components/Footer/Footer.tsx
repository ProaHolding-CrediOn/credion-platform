import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-background border-t border-gray-200 py-6">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 font-light">
                <p className="text-center text-sm text-muted-foreground mb-4">
                    &copy; {new Date().getFullYear()} Credion. Todos los derechos reservados.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <Link href="/terminos-de-uso" className="hover:text-foreground transition-colors">
                    Términos de Uso
                </Link>
                <Link href="/politica-de-privacidad" className="hover:text-foreground transition-colors">
                    Política de Privacidad
                </Link>
                </div>
            </div>
        </footer>
    )
}