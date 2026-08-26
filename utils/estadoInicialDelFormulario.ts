import { getInitialValueForType } from '@/lib/utils'
import type { BlockState, FieldState, FormData } from '@/stores/formStore'
import type { Step } from '@/types/FormField'

/**
 * Arma el esqueleto vacío del formulario: una casilla por cada campo, con su
 * etiqueta, su tipo y sus validaciones.
 *
 * POR QUÉ HACE FALTA. El store no crea el camino al vuelo: `updateField` escribe
 * en `formData['Paso N'][bloque][campo]` dando por hecho que los tres niveles ya
 * existen. Si no se siembra antes, la PRIMERA tecla que pulse el cliente lanza
 * un `Cannot read properties of undefined` dentro del `set` de Zustand, el valor
 * no llega nunca al estado y el campo se queda en blanco. No hay pantalla de
 * error: el formulario se ve perfecto y sencillamente no responde.
 *
 * Y `blockStates` no es un detalle: `canGoToNextStep` lo lee para decidir si
 * habilita «Siguiente». Sin sembrarlo, el botón no se enciende aunque el cliente
 * conteste todo.
 *
 * Esto vivía copiado dentro de cada pantalla de formulario (solicitud,
 * complementario, vehículo, desembolso, estudio, compraventa, codeudor). El
 * formulario de invitación —nómina y libre inversión— nació sin él, y por eso
 * no se podía diligenciar. Al extraerlo, el que venga detrás lo hereda en vez
 * de tener que acordarse.
 */
export function construirEstadoInicial(steps: Step[]): {
  formData: FormData
  blockStates: BlockState
  fieldStates: FieldState
} {
  const formData: FormData = {}
  const blockStates: BlockState = {}
  const fieldStates: FieldState = {}

  steps.forEach((step, stepIndex) => {
    const layoutId = `Paso ${stepIndex + 1}`
    formData[layoutId] = {}
    blockStates[stepIndex] = {}
    fieldStates[stepIndex] = {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    step.blocks.forEach((block: any) => {
      const blockName = block.blockName

      formData[layoutId][blockName] = {}
      // Un bloque nace válido solo si NINGUNO de sus campos es obligatorio.
      blockStates[stepIndex][blockName] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        block.form?.fields?.every((field: any) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !field?.validation?.some((v: any) => v.name === 'required' && v.value === true),
        ) ?? false
      fieldStates[stepIndex][blockName] = {}

      if (block.blockType === 'multiFormSelectorBlock') {
        blockStates[stepIndex][blockName] = block.required ? false : true
      }

      // Estos dos bloques llevan su propio estado interno y no tienen `form.fields`.
      if (block.blockType === 'payoutDistributionBlock' || block.blockType === 'multiFormSelectorBlock') {
        return
      }

      if (block.blockType === 'conditionalFormBlock') {
        formData[layoutId][blockName]['Condicion'] = {
          label: block.label,
          value: '',
          type: 'Conditional',
          validation: [],
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      block.form?.fields?.forEach((field: any) => {
        formData[layoutId][blockName][field.name] = {
          label: field.label,
          value: getInitialValueForType(field.type),
          type: field.type,
          validation: field.validation,
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const esObligatorio = field?.validation?.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (v: any) => v.name === 'required' && v.value === true,
        )
        if (field?.validation) {
          fieldStates[stepIndex][blockName][field.name] = !esObligatorio
        }
      })
    })
  })

  return { formData, blockStates, fieldStates }
}
