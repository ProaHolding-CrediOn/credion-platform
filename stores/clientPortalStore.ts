import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// ────────────────────────────────────────────────────────────────────
// Tipos
// ────────────────────────────────────────────────────────────────────

export type ClientCredit = {
  id: string
  customId: string
  status: string
  createdAt: string
  solicitante: {
    primerNombre: string
    primerApellido: string
    email: string
    identificacion: string
  }
  vehiculo: {
    // marca/modelo pueden venir como string o number según el tipo de campo del form
    marca: string | number | null
    modelo: string | number | null
    valorComercial: number | null
  }
  fundingSummary: {
    approvedAmount: number
    loanTermMonths: number
    disbursementAmount: number
  } | null
  /**
   * Preferencia de pago del cliente (cuenta de ahorros vs tarjeta de crédito).
   * El dashboard muestra primero el tab que corresponde. Backend opcional —
   * cuando no viene, el frontend default a 'savings'. Llenado futuro vía
   * sincronización con tags de AiSensy/WhatsApp.
   */
  paymentPreference?: 'savings' | 'credit'
}

type ClientPortalState = {
  token: string | null
  identificacion: string | null
  credit: ClientCredit | null
  hydrated: boolean

  setToken: (token: string, identificacion: string) => void
  setCredit: (credit: ClientCredit) => void
  logout: () => void
  isAuthenticated: () => boolean
}

// ────────────────────────────────────────────────────────────────────
// Store con persist en sessionStorage (se borra al cerrar tab)
// ────────────────────────────────────────────────────────────────────

export const useClientPortal = create<ClientPortalState>()(
  persist(
    (set, get) => ({
      token: null,
      identificacion: null,
      credit: null,
      hydrated: false,

      setToken: (token, identificacion) => set({ token, identificacion }),

      setCredit: (credit) => set({ credit }),

      logout: () => set({ token: null, identificacion: null, credit: null }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'client-portal-storage',
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true
      },
    },
  ),
)
