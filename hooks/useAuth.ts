import { useEffect, useState } from "react";

/**
 * Un `auth_token` VENCIDO en localStorage hacía que el formulario se mostrara
 * igual (solo se chequeaba presencia) y el envío fallara con 401 "No autorizado"
 * sin salida. Ahora validamos la VIGENCIA del JWT (su `exp`) y, si venció,
 * limpiamos el token muerto → el flujo manda a re-verificar por OTP.
 *
 * Conservador: si el token NO es un JWT decodable o no trae `exp`, NO lo
 * borramos (para no romper flujos con tokens de otra forma).
 */
export function isJwtExpired(token: string): boolean {
  try {
    const part = token.split(".")[1];
    if (!part) return false;
    // base64url → base64 + padding (`atob` puede fallar sin el relleno `=`).
    let b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = JSON.parse(atob(b64));
    if (typeof json?.exp !== "number") return false;
    return json.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && isJwtExpired(token)) {
      localStorage.removeItem("auth_token");
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(!!token);
    }
    setLoading(false);
  }, []);

  return { isAuthenticated, loading };
}

export function removeAuth() {
  localStorage.removeItem("auth_token");
}
