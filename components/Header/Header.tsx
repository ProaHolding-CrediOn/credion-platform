import Link from "next/link";
import { Logo } from "../Logo";
import { Button } from "../ui/button";
import { ToggleTheme } from "../ToggleTheme/ToggleTheme";

export function Header() {
    return (
        <header className="bg-background border-b border-gray-200 sticky top-0 z-50">
            <div className="flex justify-between items-center h-16 w-full">
                <div className="flex items-center">
                    <Logo />
                </div>
                <div className="flex items-center px-6">
                    <ToggleTheme />
                    <Link href="/contacto">
                        <Button variant="outline" className="ml-2 border-black text-foreground hover:bg-accent cursor-pointer">
                            Contáctanos
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}