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
    // marca/linea/modelo pueden venir como string o number según el tipo de campo del form
    marca: string | number | null
    /** En el form se llama "lineaDelVehiculo" — ej. "GRAND I10". Es el modelo del auto. */
    linea: string | number | null
    /** En el form se llama "modeloDelVehiculo" — es el AÑO del auto (ej. 2015). */
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
  /** Lista completa de créditos del cliente (puede haber varios por la misma cédula). */
  credits: ClientCredit[] | null
  /** ID del crédito activo (el que muestra el dashboard ahora). */
  activeCreditId: string | null
  hydrated: boolean

  setToken: (token: string, identificacion: string) => void
  setCredits: (credits: ClientCredit[]) => void
  setActiveCreditId: (id: string) => void
  /** Devuelve el crédito activo (o null si no hay). */
  getActiveCredit: () => ClientCredit | null
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
      credits: null,
      activeCreditId: null,
      hydrated: false,

      setToken: (token, identificacion) => set({ token, identificacion }),

      setCredits: (credits) => {
        // Si no hay activo o el activo ya no existe en la lista, seteamos al primero
        const state = get()
        const stillValid = state.activeCreditId && credits.some((c) => c.id === state.activeCreditId)
        set({
          credits,
          activeCreditId: stillValid ? state.activeCreditId : credits[0]?.id ?? null,
        })
      },

      setActiveCreditId: (id) => {
        const state = get()
        if (!state.credits?.some((c) => c.id === id)) return
        set({ activeCreditId: id })
      },

      getActiveCredit: () => {
        const state = get()
        if (!state.credits || !state.activeCreditId) return null
        return state.credits.find((c) => c.id === state.activeCreditId) ?? null
      },

      logout: () =>
        set({
          token: null,
          identificacion: null,
          credits: null,
          activeCreditId: null,
        }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'client-portal-storage-v2',
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true
      },
    },
  ),
)
