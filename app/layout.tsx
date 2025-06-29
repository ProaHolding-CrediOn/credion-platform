import type { Metadata } from "next";
import { Noto_Sans_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import LoadingOverlay from "@/components/LoadingOverlay";

const noto = Noto_Sans_Display({ subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Credion",
  description: "Plataforma Credion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${noto.className} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            enableSystem
            disableTransitionOnChange
          >
            <LoadingOverlay />
            <main>{children}</main>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
