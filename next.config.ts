import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // El enlace de firma viaja por WhatsApp: /f/:token es la versión corta
      // que se manda hoy, y sirve la misma página sin redirigir (el cliente ve
      // en la barra el enlace que le llegó). /firma/:token se queda para los
      // enlaces ya enviados.
      { source: "/f/:token", destination: "/firma/:token" },
    ];
  },
};

export default nextConfig;
