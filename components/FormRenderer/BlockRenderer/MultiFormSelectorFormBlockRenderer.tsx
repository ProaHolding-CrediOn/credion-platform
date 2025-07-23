import { ConditionalFormBlock, EnhancedBlock, EnhancedField, FormBlock, MultiFormSelectorFormBlock } from "@/types/FormField";
import FieldRenderer from "../FieldRenderer/FieldRenderer";
import { BlockRendererProps } from "./BlockRenderer.type";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import TextViewer from "@/components/TextViewer/TextViewer";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { BlockState, createFormStore, FieldState, FormData } from "@/stores/formStore";
import { formatPrice, getInitialValueForType, numeroEnPalabras } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2Icon } from "lucide-react";

export default function MultiFormSelectorFormBlockRenderer({ block, blockKey, store }: BlockRendererProps) {
    block = block as MultiFormSelectorFormBlock

    const [openSelector, setOpenSelector] = useState(false)
    const [localStore, setLocalStore] = useState<ReturnType<typeof createFormStore> | null>(null);
    const [entries, setEntries] = useState<Record<string, any[]>>({})
    const [showForm, setShowForm] = useState(false)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    const maxEntriesPerBlock = block.options.map(opt => { return { label: opt.label, maxEntries: opt.maxEntries || 1 } }) || []
    const selectedOptionForm = block.options.find(opt => opt.label === selectedOption)
    const optionWithEntries = Object.entries(entries).filter(([option, entryList]) => entryList.length > 0)

    const validate = (optionLabel: string) => {
        const maxInfo = maxEntriesPerBlock.find(opt => opt.label === optionLabel);
        const maxEntries = maxInfo?.maxEntries ?? 1;
        const currentCount = entries[optionLabel]?.length ?? 0;
        return currentCount < maxEntries;
    }

    const disableItem = (optionLabel: string) => {
        return !validate(optionLabel)
    }

    const getEntriesAfterAdd = (currentEntries: Record<string, any[]>, entry: Record<string, any>, optionLabel: string) => {
        return {
            ...currentEntries,
            [optionLabel]: [...(currentEntries[optionLabel] || []), entry]
        }
    }

    const getEntriesAfterUpdate = (currentEntries: Record<string, any[]>, optionLabel: string, index: number, updatedEntry: Record<string, any[]>) => {
        const currentArray = currentEntries[optionLabel] || [];

        if (index < 0 || index >= currentArray.length) {
            return currentEntries;
        }

        const newArray = currentArray.map((entry, i) =>
            i === index ? updatedEntry : entry
        );

        return {
            ...currentEntries,
            [selectedOption]: newArray
        };
    };

    const getEntriesAfterDelete = (currentEntries: Record<string, any[]>, optionLabel: string, index: number) => {
        if (!currentEntries[optionLabel] || index < 0 || index >= currentEntries[optionLabel].length) {
            return currentEntries;
        }

        const updatedArray = currentEntries[optionLabel].filter((_, i) => i !== index);

        const updatedEntries = { ...currentEntries };

        if (updatedArray.length === 0) {
            delete updatedEntries[optionLabel];
        } else {
            updatedEntries[optionLabel] = updatedArray;
        }

        return updatedEntries;
    }

    useEffect(() => {
        if (!selectedOption) return
        if (validate(selectedOption)) {
            if (!store.getState().blockStates[blockKey.layout]?.[block.blockName]) {
                store.getState().setBlockValid(blockKey.layout, block.blockName, true);
            }
        } else {
            if (store.getState().blockStates[blockKey.layout]?.[block.blockName]) {
                store.getState().setBlockValid(blockKey.layout, block.blockName, false)
            }
        }
    }, [entries, store, blockKey, block.blockName, selectedOption]);

    useEffect(() => {
        if (block?.options?.length) {
            const initialEntries = block.options.reduce((acc, option) => {
                acc[option.label] = []
                return acc;
            }, {} as Record<string, any[]>);

            setEntries(initialEntries);
        }
    }, [block.options]);

    const handleNew = (optionLabel: string) => {
        setShowForm(true)
        setSelectedOption(optionLabel)
        const tempKey = `multiform-temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
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

        block.options.filter(opt => opt.label === optionLabel).forEach((opt) => {
            opt.forms.forEach((form: any) => {
                console.log('form', form)
                form.form.fields.forEach((field: any) => {
                    initialFormData[layoutId][blockName][field.name] = {
                        label: field.label,
                        value: getInitialValueForType(field.type),
                        type: field.type,
                        validation: field.validation,
                    }

                    const isRequired = field?.validation?.some(
                        (v: any) => v.name === "required" && v.value === true
                    )

                    initialFieldStates[blockKey.layout][blockName][field.name] = !isRequired
                })
            })
        })

        const tempStoreInstance = tempStore.getState();
        tempStoreInstance.setFormData(initialFormData);
        tempStoreInstance.setBlockStates(initialBlockStates);
        tempStoreInstance.setFieldStates(initialFieldStates);

        setLocalStore(() => tempStore);
        setShowForm(true);
        setEditingIndex(null);
        setOpenSelector(false);
    }

    const handleSave = () => {
        if (!localStore || !selectedOption || !selectedOptionForm?.forms?.every(form => Array.isArray(form.form.fields) && form.form.fields.length > 0)) return;
        
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

        const newEntry: Record<string, any> = {};

        selectedOptionForm.forms.forEach((form) => {
            form.form.fields.forEach((field) => {
                const fieldState = fieldValues[field.name]
                newEntry[field.name] = {
                    label: fieldState.label,
                    value: fieldState.value,
                    type: fieldState.type,
                    validation: fieldState.validation
                }
            })
        })

        let updatedEntries;
        if (editingIndex !== null) {
            updatedEntries = getEntriesAfterUpdate(entries, selectedOption, editingIndex, newEntry);
        } else {
            updatedEntries = getEntriesAfterAdd(entries, newEntry, selectedOption);
        }
        
        setEntries(updatedEntries)

        store.getState().updateBlock(blockKey.layout + 1, block.blockName, updatedEntries)
        
        state.clearPersistedStore();
        setShowForm(false);
        setEditingIndex(null);
        setLocalStore(null);
        setSelectedOption(null);
        scrollToTop();
    }

    const handleCancel = () => {
        localStore?.getState().clearPersistedStore();
        setShowForm(false);
        setLocalStore(null);
        setEditingIndex(null);
        setSelectedOption(null);
    }

    const handleDelete = (optionLabel: string, index: number) => {
        let updatedEntries = { ...entries };
        updatedEntries = getEntriesAfterDelete(updatedEntries, optionLabel, index);
        setEntries(updatedEntries);
        store.getState().updateBlock(blockKey.layout + 1, block.blockName, updatedEntries);
        scrollToTop();
    }

    const textToTitle = (text: string) => {
        return `${text.charAt(0).toUpperCase() + text.slice(1)}`
    }

    const itemTitle = (optionLabel: string) => {
        return `${optionLabel.charAt(0).toUpperCase() + optionLabel.slice(1)}${optionLabel.charAt(optionLabel.length - 1).toLowerCase() === 's' ? '' : 's'}`
    }

    const itemDetailTitle = (optionLabel: string) => {
        let text = `${optionLabel.charAt(0).toUpperCase() + optionLabel.slice(1)}`
        console.log('text', text.charAt(text.length - 1).toLowerCase())
        if (text.charAt(text.length - 1).toLowerCase() === 's') {
            text = text.slice(0, -1)
        }
        return text.toLocaleLowerCase()
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="space-y-6" key="multi-form-selector">
            <div className="flex items-center justify-between">
                <p className="font-light">{block.label}</p>
            </div>

            {optionWithEntries.length === 0 && (
                <p className="text-muted-foreground font-light text-sm">No se han agregado {block.value}</p>
            )}

            <div className="w-full space-y-2">
                {optionWithEntries.map(([optionLabel, entryList]) => (
                    <div key={optionLabel} className="shadow px-4 py-2 rounded-md flex justify-between items-start">
                        <div className="flex-1">
                            <Label className="font-light text-sm">{itemTitle(optionLabel)}</Label>
                            <div className="flex flex-col gap-2">
                                <Accordion type="single" collapsible className="w-full">
                                    {entryList.map((entry, index) => (
                                        <AccordionItem value={`${optionLabel}-${index}`}>
                                            <AccordionTrigger>
                                                <span className="font-light">{textToTitle(numeroEnPalabras(index))} {itemDetailTitle(optionLabel)}</span>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div key={index} className="text-sm p-0">
                                                    {Object.entries(entry).map(([key, field]) => {
                                                        const value = field?.value ?? "";
                                                        const label = field?.label ?? key;

                                                        return (
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-light text-muted-foreground mr-2">{label}:</span>
                                                                <span className="font-light text-foreground">{value}</span>
                                                            </div>
                                                        )
                                                    })}
                                                    
                                                    <div className="flex items-center justify-end mt-2">
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            onClick={() => handleDelete(optionLabel, index)}
                                                        >
                                                            <Trash2Icon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full">
                <Popover open={openSelector} onOpenChange={setOpenSelector}>
                    <PopoverTrigger asChild>
                        <Button className="w-full justify-start cursor-pointer" disabled={!!selectedOption}>
                            Agregar {block.value}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" side="bottom" align="center">
                        <Command>
                            <CommandList>
                                <CommandEmpty>No se encontraron opciones.</CommandEmpty>
                                <CommandGroup>
                                    {block.options.map((option) => (
                                        <CommandItem
                                            key={option.label}
                                            value={option.label}
                                            onSelect={handleNew}
                                            className="cursor-pointer"
                                            disabled={disableItem(option.label)}
                                        >
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {showForm && localStore && selectedOptionForm && (
                <div className="border border-border p-4 rounded-md space-y-4 bg-muted/5">
                    {selectedOptionForm.forms.map((form) => (
                        form.form.fields.map((field: EnhancedField, index: number) => (
                            <FieldRenderer
                                key={`${form.form.title}-${field.name}-${index}`}
                                field={field}
                                blockKey={blockKey}
                                store={localStore}
                            />
                        ))
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
        </div>
    );
}