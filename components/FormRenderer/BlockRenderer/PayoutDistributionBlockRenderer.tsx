import { EnhancedField, PayoutDistributionFormBlock } from "@/types/FormField";
import FieldRenderer from "../FieldRenderer/FieldRenderer";
import { BlockRendererProps } from "./BlockRenderer.type";
import { useEffect, useState } from "react";
import { BlockState, createFormStore, FieldState, FormData } from "@/stores/formStore";
import { formatPrice, getInitialValueForType } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TextViewer from "@/components/TextViewer/TextViewer";
import { Label } from "@/components/ui/label";
import { formatFieldValue } from "@/lib/formatFields";

export default function PayoutDistributionFormBlockRenderer({ block, blockKey, store }: BlockRendererProps) {
    block = block as PayoutDistributionFormBlock

    const [localStore, setLocalStore] = useState<ReturnType<typeof createFormStore> | null>(null);
    const [entries, setEntries] = useState<Record<string, any>[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const maxEntries = block.maxEntries || 1
    const remainingAmount = block.info.approvedAmount - entries.reduce((sum, entry) => sum + Number(entry.cantidad?.value | 0), 0)

    useEffect(() => {
      const layoutId = `Paso ${blockKey.layout + 1}`
      const blockName = block.blockName
      const globalEntries = store.getState().formData?.[layoutId]?.[blockName] || [];

      if (Array.isArray(globalEntries) && JSON.stringify(globalEntries) !== JSON.stringify(entries)) {
        setEntries(globalEntries);
      }
    })

    const validate = () => {
      if (entries.length > 0 && entries.length <= maxEntries && remainingAmount === 0) return true
      return false
    }

    useEffect(() => {
      if (validate()) {
        if (!store.getState().blockStates[blockKey.layout]?.[block.blockName]) {
          store.getState().setBlockValid(blockKey.layout, block.blockName, true);
        }
      } else {
        if (store.getState().blockStates[blockKey.layout]?.[block.blockName]) {
          store.getState().setBlockValid(blockKey.layout, block.blockName, false)
        }
      }
    }, [entries, store, blockKey, block.blockName, remainingAmount]);

    const handleNew = () => {
      setShowForm(true)
      const tempKey = `desembolso-temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const tempStore = createFormStore(tempKey)

      const layoutId = `Paso ${blockKey.layout + 1}`;
      const blockName = block.blockName;

      const initialFormData: FormData = {
        [layoutId]: {
          [blockName]: {},
        },
      };

      const initialBlockStates: BlockState = {
        [blockKey.layout]: {
          [blockName]: false,
        },
      };

      const initialFieldStates: FieldState = {
        [blockKey.layout]: {
          [blockName]: {},
        },
      };

      block.form.fields.forEach((field: any) => {
        initialFormData[layoutId][blockName][field.name] = {
          label: field.label,
          value: getInitialValueForType(field.type),
          type: field.type,
          validation: field.validation,
        };

        const isRequired = field?.validation?.some(
          (v: any) => v.name === "required" && v.value === true
        );

        initialFieldStates[blockKey.layout][blockName][field.name] = !isRequired;
      });

      const tempStoreInstance = tempStore.getState();
      tempStoreInstance.setFormData(initialFormData);
      tempStoreInstance.setBlockStates(initialBlockStates);
      tempStoreInstance.setFieldStates(initialFieldStates);

      setLocalStore(() => tempStore);
      setShowForm(true);
      setEditingIndex(null);
    }

    const handleSave = () => {
      if (!localStore || !block.form?.fields) return;

      const layoutId = `Paso ${blockKey.layout + 1}`;
      const blockName = block.blockName;

      const state = localStore.getState();
      const fieldValues = state.formData?.[layoutId]?.[blockName] || {};
      const fieldValidations = state.fieldStates?.[layoutId]?.[blockName] || {};
      const blockValidation = state.blockStates?.[layoutId]?.[blockName] || {};

      const isFormValid = Object.values(fieldValidations).every(Boolean);
      const isBlockValid = Object.values(blockValidation).every(Boolean);

      if (!isFormValid || !isBlockValid) {
        console.warn('Formulario no valido');
        return;
      }

      const newEntry: Record<string, any> = {}
      block.form.fields.forEach((field) => {
        const fieldState = fieldValues[field.name]
        newEntry[field.name] = {
          label: fieldState.label,
          value: fieldState.value,
          type: fieldState.type,
          validation: fieldState.validation
        }
      })

      const updatedEntries = [...entries]
      if (editingIndex !== null) {
        updatedEntries[editingIndex] = newEntry
      } else {
        updatedEntries.push(newEntry)
      }

      setEntries(updatedEntries)

      store.getState().updateBlock(blockKey.layout + 1, block.blockName, updatedEntries)

      state.clearPersistedStore()
      setShowForm(false)
      setEditingIndex(null)
      setLocalStore(null)
    }

    const handleEdit = (index: number) => {
      const tempKey = `desembolso-temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const tempStore = createFormStore(tempKey);

      const layoutId = `Paso ${blockKey.layout + 1}`;
      const blockName = block.blockName;
      const entry = entries[index];

      const initialFormData: FormData = {
        [layoutId]: {
          [blockName]: {},
        },
      };

      const initialBlockStates: BlockState = {
        [blockKey.layout]: {
          [blockName]: true,
        },
      };

      const initialFieldStates: FieldState = {
        [blockKey.layout]: {
          [blockName]: {},
        },
      };

      initialFormData[layoutId][blockName] = entry
      block.form.fields.forEach((field: any) => {
        initialFieldStates[blockKey.layout][blockName][field.name] = true;
      });

      const tempState = tempStore.getState();
      tempState.setFormData(initialFormData);
      tempState.setBlockStates(initialBlockStates);
      tempState.setFieldStates(initialFieldStates);

      setLocalStore(() => tempStore);
      setEditingIndex(index);
      setShowForm(true);
    }

    const handleDelete = (index: number) => {
      const updated = [...entries]
      updated.splice(index, 1)
      setEntries(updated)
      store.getState().updateBlock(blockKey.layout + 1, block.blockName, updated)
    }

    const handleCancel = () => {
      localStore?.getState().clearPersistedStore();
      setShowForm(false);
      setLocalStore(null);
      setEditingIndex(null);
    };

    const renderItem = (key2: string, field: any) => {
      const label = field?.label ?? key2 ?? ''
      const isCantidad = key2.toLowerCase() === 'cantidad'
      if (isCantidad || key2 === '0') return null

      try {
        const value = formatFieldValue(field?.value)
        
        return (
          <div key={key2} className="flex items-center justify-between">
            <span className="font-light text-muted-foreground mr-2">{label}:</span>
            <span className="font-light text-foreground">{value}</span>
          </div>
        )
      } catch (error) {
        console.log('Error al renderizar el item', error)
        return (
          <div key={key2} className="flex items-center justify-between">
            <span className="font-light text-muted-foreground mr-2">{label}:</span>
            <span className="font-light text-foreground">No disponible</span>
          </div>
        )
      }
    }

    return (
      <div className="space-y-4" key={'payout-distrubition'}>
        <div className="flex justify-between items-center font-light">
          <p className="text-xl font-light">Información de Pago</p>
          {remainingAmount > 0 && <span className="text-sm text-muted-foreground">{`Pendiente por ingresar ${formatPrice(remainingAmount)} COP`}</span>}
          {remainingAmount < 0 && <span className="text-sm text-destructive">{`Excedido por ${formatPrice(remainingAmount)} COP, válida para continuar`}</span>}
          {remainingAmount === 0 && <span className="text-sm text-success">Has ingresado la totalidad correctamente</span>}
        </div>
        
        {block.introContent && <Label className="text-xs text-muted-foreground font-light">
            <TextViewer text={block.introContent} />
        </Label>}

        <div className="space-y-2">
          {Object.entries(entries).map((entry, index) => (
            <div className="shadow p-4 rounded-md flex justify-between items-start gap-4 bg-muted/5" key={index}>
              <div className="flex-1">
                {Object.entries(entry).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    {Object.entries(value).map(([key2, field]) => renderItem(key2, field))}
                  </div>
                ))}

                <div className="flex justify-between items-center mt-4">
                  {entry[1].cantidad.value !== undefined && (
                    <p className="mt-3 text-base font-light text-primary">
                      Cantidad a depositar en esta cuenta: {" "}
                      ${formatPrice(entry[1].cantidad.value)} COP
                    </p>
                  )}
                  <div className="flex gap-2 items-center">
                    <Button
                      onClick={() => handleEdit(index)}
                      variant="outline"
                      size='sm'
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(index)}
                      variant="destructive"
                      size='sm'
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showForm && localStore && (
          <div className="border border-border p-4 rounded-md space-y-4 bg-muted/5">
            {block.form.fields.map((field: EnhancedField, index: number) => (
              <FieldRenderer
                key={`${block.form.title}-${field.name}-${index}`}
                field={field}
                blockKey={blockKey}
                store={localStore}
              />
            ))}

            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                variant="default"
              >
                Guardar
              </Button>

              <Button
                onClick={handleCancel}
                variant="secondary"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {!showForm && entries.length < maxEntries && (
          <Button
            onClick={handleNew}
            className="w-full"
            variant='default'
          >
            Agregar cuenta
          </Button>
        )}

      </div>
    )
}