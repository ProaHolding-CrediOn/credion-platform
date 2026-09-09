import { FieldValidation } from '@/types/FormField';
import { create } from 'zustand';
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * El borrador se guarda POR ENLACE, no por tipo de formulario.
 *
 * Antes la clave era `form-complementario` a secas, la misma para todos los
 * créditos y todos los clientes. Dos consecuencias, las dos vistas en
 * producción el 9-sep-2026:
 *
 *  1. Quien abría un enlace en un navegador donde alguien ya había empezado
 *     otro formulario del mismo tipo se encontraba el formulario RELLENO con
 *     las respuestas del anterior —vivienda, estrato, SISBÉN, referencias— y
 *     podía enviarlas como propias.
 *  2. Peor: al enviar con éxito queda `submitted: true` guardado, así que el
 *     siguiente cliente que abría SU enlace en ese navegador veía la pantalla
 *     de «Gracias por su información» y no podía llenar nada. Sin error, sin
 *     explicación y sin salida, porque `submitted` solo se limpia si cambia la
 *     versión del formulario.
 *
 * El sufijo es el último tramo de la ruta, que en las páginas por enlace es el
 * id del enlace firmado (`/complementario/<uuid>`) y en las públicas una
 * palabra fija (`/solicitud/formulario`), así que esas siguen compartiendo
 * borrador entre visitas, que es lo que se quiere. Se lee en cada acceso, no al
 * cargar el módulo, para que siga siendo correcto si se navega entre dos
 * enlaces sin recargar.
 */
const conElEnlace = (clave: string): string => {
  if (typeof window === 'undefined') return clave
  const ultimoTramo = window.location.pathname.split('/').filter(Boolean).pop()
  return ultimoTramo ? `${clave}-${ultimoTramo}` : clave
}

export type FormFieldValue = string | number | object | undefined | null;
export type FormFieldState = {
  label: string;
  value: FormFieldValue
  type: string;
  validation?: Array<FieldValidation>
}

export type FormData = Record<string, Record<string, Record<string, FormFieldState>>>;
export type FieldState = Record<string, Record<string, Record<string, boolean>>>;
export type BlockState = Record<string, Record<string, boolean>>;

export interface FormStore {
  formData: FormData;
  fieldStates: FieldState;
  blockStates: BlockState;
  currentStep: number;
  version: number;
  submitted: boolean;
  
  setFormData: (data: FormData) => void;
  setBlockStates: (states: BlockState) => void;
  setFieldStates: (states: FieldState) => void;

  updateField: (layout: number, blockName: string, name: string, value: FormFieldValue) => void;
  updateBlock: (layout: number, blockName: string, value: Record<string, any>) => void;
  setFieldValid: (layout: number, blockName: string, fieldName: string, isValid: boolean) => void;
  setBlockValid: (layout: number, blockName: string, isValid: boolean) => void;

  setCurrentStep: (step: number) => void;
  setSubmitted: (submitted: boolean) => void;
  setFormVersion: (value: number) => void;
  getFormVersion: () => number;

  resetForm: () => void;
  clearPersistedStore: () => void;
  rehydrated: boolean;
}

export const createFormStore = (storeKey: string) => {
  return create<FormStore>()(
    persist(
      (set, get) => ({
        formData: {},
        fieldStates: {},
        blockStates: {},
        currentStep: 0,
        submitted: false,
        version: 0,
        setFormData: (data) => set({ formData: data }),
        /**
         * El esqueleto lo siembra la pantalla al cargar el formulario (ver
         * `construirEstadoInicial`), y de ahí salen la etiqueta, el tipo y las
         * validaciones de cada campo.
         *
         * Aun así se navega con `?.`: antes esto accedía en firme a
         * `state.formData[layoutId][blockName][name]`, y en un formulario sin
         * sembrar la PRIMERA tecla lanzaba `Cannot read properties of undefined`
         * dentro del `set`. Lo que escribía el cliente se perdía y el campo se
         * quedaba en blanco, sin nada en pantalla que lo explicara. Pasó con los
         * formularios de nómina y libre inversión.
         *
         * Perder una pulsación es peor que guardarla sin metadatos: así el dato
         * entra igual, y si falta el esqueleto se nota por la validación, no por
         * un campo muerto.
         */
        updateField: (layout, blockName, name, value) =>
          set((state) => {
            const layoutId = `Paso ${layout}`;
            return {
              formData: {
                ...state.formData,
                [layoutId]: {
                  ...state.formData[layoutId],
                  [blockName]: {
                    ...state.formData[layoutId]?.[blockName],
                    [name]: {
                      ...state.formData[layoutId]?.[blockName]?.[name],
                      value,
                    },
                  },
                },
              },
            };
          }),
        updateBlock: (layout, blockName, value) =>
          set((state) => {
            const layoutId = `Paso ${layout}`;
            return {
              formData: {
                ...state.formData,
                [layoutId]: {
                  ...state.formData[layoutId],
                  [blockName]: value
                },
              },
            };
          }),
        setFieldStates: (states) => set({ fieldStates: states }),
        setFieldValid: (layoutId, blockName, fieldName, isValid) => {   
          set((state) => {
            const currentBlock = state.fieldStates?.[layoutId]?.[blockName] || {};

            const updateFieldBlockState: Record<string, boolean> = {
              ...currentBlock,
              [fieldName]: isValid
            };

            const allFieldValid = Object.values(updateFieldBlockState).every(Boolean)

            return {
              fieldStates: {
                ...state.fieldStates,
                [layoutId]: {
                  ...state.fieldStates[layoutId],
                  [blockName]: updateFieldBlockState
                }
              },
              blockStates: {
                ...state.blockStates,
                [layoutId]: {
                  ...state.blockStates[layoutId],
                  [blockName]: allFieldValid
                }
              }
            } as FormStore
          })    
        },
        setBlockStates: (states) => set({ blockStates: states }),
        setBlockValid: (layoutId, blockName, isValid) => {
          set((state) => {
            return {
              blockStates: {
                ...state.blockStates,
                [layoutId]: {
                  ...state.blockStates[layoutId],
                  [blockName]: isValid,
                },
              }
            }
          });
        },
        setCurrentStep: (step) => set({ currentStep: step }),
        setSubmitted: (value) => set({ submitted: value }),
        setFormVersion: (value) => set({ version: value }),
        getFormVersion: () => get().version,
        resetForm: () =>
          set({
            formData: {},
            blockStates: {},
            fieldStates: {},
            currentStep: 0,
            submitted: false,
            version: 0
          }),
        clearPersistedStore: () => {
          const storageKey = conElEnlace(`form-${storeKey}`)
          try {
            localStorage.removeItem(storageKey)
            console.log(`[Zustand] Persistencia eliminada para ${storageKey}`)
          } catch {
            console.warn(`[Zustand] Persistencia no encontrada para ${storageKey}`)
          }
        },
        rehydrated: false
      }),
      {
        name: `form-${storeKey}`,
        /**
         * `name` se queda como el nombre del store (zustand lo usa para
         * identificarlo); la clave real del navegador la pone este almacén, que
         * le añade el enlace. Se construye perezosamente porque el módulo
         * también se evalúa en el servidor, donde no hay `localStorage`.
         */
        storage: createJSONStorage(() => ({
          getItem: (name) => localStorage.getItem(conElEnlace(name)),
          setItem: (name, value) => localStorage.setItem(conElEnlace(name), value),
          removeItem: (name) => localStorage.removeItem(conElEnlace(name)),
        })),
        onRehydrateStorage: () => (state) => {
          console.log('Rehidratando formulario', storeKey)
          if (state) {
            state.rehydrated = true
          }
        }
      }
    )
  )
}