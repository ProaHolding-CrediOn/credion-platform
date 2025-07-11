import { FieldValidation } from '@/types/FormField';
import { create } from 'zustand';
import { persist } from "zustand/middleware";

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
        setFormData: (data) => set({ formData: data }),
        updateField: (layout, blockName, name, value) =>
          set((state) => {
            const layoutId = `Paso ${layout}`;
            return {
              formData: {
                ...state.formData,
                [layoutId]: {
                  ...state.formData[layoutId],
                  [blockName]: {
                    ...state.formData[layoutId][blockName],
                    [name]: {
                      ...state.formData[layoutId][blockName][name],
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
        resetForm: () =>
          set({
            formData: {},
            blockStates: {},
            fieldStates: {},
            currentStep: 0,
          }),
        clearPersistedStore: () => {
          const storageKey = `form-${storeKey}`
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