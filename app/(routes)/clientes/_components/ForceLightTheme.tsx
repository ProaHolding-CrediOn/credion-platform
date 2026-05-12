'use client'

import { useEffect } from 'react'

/**
 * Fuerza light mode solo en las rutas /clientes/* sin tocar la preferencia
 * persistida del usuario.
 *
 * Funcionamiento: al montar, recuerda si el <html> tenía la clase `dark` y la
 * remueve. Al desmontar (cuando el usuario sale de /clientes), la restaura.
 * Esto coexiste con `next-themes` porque solo manipula la clase del DOM —
 * el localStorage de next-themes queda intacto.
 */
export function ForceLightTheme() {
  useEffect(() => {
    const html = document.documentElement
    const wasDark = html.classList.contains('dark')
    if (wasDark) html.classList.remove('dark')
    html.style.colorScheme = 'light'
    return () => {
      if (wasDark) html.classList.add('dark')
      html.style.colorScheme = ''
    }
  }, [])
  return null
}
