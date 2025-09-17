import { EnhancedField, MultiFormSelectorFormBlock } from "@/types/FormField";
import FieldRenderer from "../FieldRenderer/FieldRenderer";
import { BlockRendererProps } from "./BlockRenderer.type";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import TextViewer from "@/components/TextViewer/TextViewer";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { BlockState, createFormStore, FieldState, FormData } from "@/stores/formStore";
import { getInitialValueForType, numeroEnPalabras } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2Icon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { formatFieldValue } from "@/lib/formatFields";
import { format, formatDate } from "date-fns";

export interface StoredFieldData {
    label: string;
    value: any;
    type: string;
    validation: any;
}

export type EntryData = Record<string, StoredFieldData>;

export default function MultiFormSelectorFormBlockRenderer({ block, blockKey, store }: BlockRendererProps) {
    block = block as MultiFormSelectorFormBlock

    const [openSelector, setOpenSelector] = useState(false)
    const [localStore, setLocalStore] = useState<ReturnType<typeof createFormStore> | null>(null);
    const [entries, setEntries] = useState<Record<string, EntryData[]>>({})
    const [showForm, setShowForm] = useState(false)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [conditionalAnswers, setConditionalAnswers] = useState<Record<string, string | null>>({})
    const formRef = useRef<HTMLDivElement>(null);
    const entriesListRef = useRef<HTMLDivElement>(null);
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);

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

    const getEntriesAfterAdd = (currentEntries: Record<string, EntryData[]>, entry: EntryData, optionLabel: string): Record<string, EntryData[]> => {
        return {
            ...currentEntries,
            [optionLabel]: [...(currentEntries[optionLabel] || []), entry]
        }
    }

    const getEntriesAfterUpdate = (currentEntries: Record<string, EntryData[]>, optionLabel: string, index: number, updatedEntry: EntryData): Record<string, EntryData[]>  => {
        const currentArray = currentEntries[optionLabel] || [];

        if (index < 0 || index >= currentArray.length) {
            return currentEntries;
        }

        const newArray = currentArray.map((entry, i) =>
            i === index ? updatedEntry : entry
        );

        return {
            ...currentEntries,
            [optionLabel]: newArray
        };
    };

    const getEntriesAfterDelete = (currentEntries: Record<string, EntryData[]>, optionLabel: string, index: number): Record<string, EntryData[]> => {
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

    const checkCanSave = () => {
        const blockStates = localStore?.getState().blockStates[blockKey.layout]
        if (!blockStates) {
            setIsSaveEnabled(false)
            return
        }

        const allValiod = Object.values(blockStates).every(Boolean)
        setIsSaveEnabled(allValiod)
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
            const hasEntries = Object.keys(entries).length > 0;

            if (!hasEntries) {

                const initialEntries: Record<string, EntryData[]> = {}
                block.options.forEach(option => {
                    initialEntries[option.label] = []
                });

                setEntries(initialEntries);
            }
        }
    }, [block.options]);

    useEffect(() => {
        if (!store || !block.blockName || blockKey.layout === undefined) {
            return;
        }

        try {
            const layoutKey = blockKey.layout + 1;
            const layoutId = `Paso ${layoutKey}`;
            const storedEntries = store.getState().formData?.[layoutId]?.[block.blockName];

            if (storedEntries && typeof storedEntries === 'object' && !Array.isArray(storedEntries) && Object.keys(storedEntries).length > 0) {
                let isValidStructure = false;

                for (const value of Object.values(storedEntries)) {
                    if (Array.isArray(value)) {
                        isValidStructure = true;
                        break;
                    }
                }

                if (isValidStructure) {
                    if (JSON.stringify(storedEntries) !== JSON.stringify(entries)) {
                        setEntries(storedEntries as unknown as Record<string, EntryData[]>);
                    }
                } else {
                    console.log("Los datos almacenados no tienen la estructura esperada para entries.");
                }
            } else {
                console.log("No se encontraron entries válidos en el store para este bloque o ya están cargados.");
            }
        } catch (error) {
            console.error('Error al cargar entries desde el store:', error)
        }
    }, [store, block.blockName, blockKey.layout, block.options, entries])

    useEffect(() => {
        if (!localStore) {
            setIsSaveEnabled(false)
            return
        }

        checkCanSave()

        const unsubscribe = localStore.subscribe(checkCanSave)

        return unsubscribe;
    }, [localStore, blockKey.layout, showForm])

    const handleNew = (optionLabel: string) => {
        setOpenSelector(false);
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

                if (form.type === 'conditionalForm') {
                    initialFormData[layoutId][blockName]['Condicion'] = {
                        label: form.question,
                        value: '',
                        type: 'Conditional',
                        validation: []
                    }
                }
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
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
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

        const newEntry: EntryData = {};

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

            if (form.type === 'conditionalForm') {
                newEntry['Condicion'] = {
                    label: fieldValues['Condicion'].label,
                    value: fieldValues['Condicion'].value,
                    type: fieldValues['Condicion'].type,
                    validation: fieldValues['Condicion'].validation
                }
            }
        })

        let updatedEntries: Record<string, EntryData[]>;
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
        setConditionalAnswers({});
        
        setTimeout(() => {
            entriesListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    }

    const handleCancel = () => {
        localStore?.getState().clearPersistedStore();
        setShowForm(false);
        setLocalStore(null);
        setEditingIndex(null);
        setSelectedOption(null);
        setConditionalAnswers({});
    }

    const handleDelete = (optionLabel: string, index: number) => {
        let updatedEntries = { ...entries };
        updatedEntries = getEntriesAfterDelete(updatedEntries, optionLabel, index);
        setEntries(updatedEntries);
        store.getState().updateBlock(blockKey.layout + 1, block.blockName, updatedEntries);
        
        setTimeout(() => {
            entriesListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    }

    const textToTitle = (text: string) => {
        return `${text.charAt(0).toUpperCase() + text.slice(1)}`
    }

    const itemTitle = (optionLabel: string) => {
        return `${optionLabel.charAt(0).toUpperCase() + optionLabel.slice(1)}${optionLabel.charAt(optionLabel.length - 1).toLowerCase() === 's' ? '' : 's'}`
    }
    const shortenText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength).trim() + '...';
    };

    const extractLeafValues = (value: any): string[] => {
        if (value === null || value === undefined) return [];

        if (value instanceof Date) {
            return [formatDate(value, 'dd/MM/yyyy')];
        }

        if (typeof value !== 'object') {
            return [String(value)];
        }

        if (Array.isArray(value)) {
            return value.flatMap(extractLeafValues);
        }

        if ('label' in value && 'value' in value) {
            return extractLeafValues(value.value);
        }

        if (typeof value === 'object') {
            return Object.entries(value)
                .filter(([key]) => key !== 'id')
                .flatMap(([key, val]) => extractLeafValues(val));
        }

        return Object.values(value).flatMap(extractLeafValues);
    };

    const formatEntryToText = (entry: EntryData): string => {
        return Object.values(entry)
            .flatMap((field) => extractLeafValues(field.value))
            .filter((val) => val.trim() !== '')
            .join(', ');
    };

    const handleSelectConditional = (value: string, conditionalId: string, expectedAnswer: string, formFields: EnhancedField[]) => {
        setConditionalAnswers(prev => ({
            ...prev,
            [conditionalId]: String(value)
        }))
        
        localStore?.getState().updateField(blockKey.layout + 1, block.blockName, 'Condicion', value);

        const isExpectedAnswer = String(value) === expectedAnswer
        if (isExpectedAnswer) {
            localStore?.getState().setBlockValid(blockKey.layout, block.blockName, false)
        } else {
            localStore?.getState().setBlockValid(blockKey.layout, block.blockName, true)
        }
    }

    return (
        <div className="space-y-2" key="multi-form-selector">
            <div className="flex items-center justify-between" ref={entriesListRef}>
                <p className="font-light">{block.label}</p>
            </div>

            {block.introContent && <Label className="text-xs text-muted-foreground font-light">
                <TextViewer text={block.introContent} />
            </Label>}

            <div key='list'>
                <div className="w-full space-y-2">
                    {optionWithEntries.map(([optionLabel, entryList]) => (
                        <div key={optionLabel} className="w-full shadow px-4 py-2 rounded-md flex justify-between items-start">
                            <div className="flex-1">
                                <Label className="font-light text-sm">{itemTitle(optionLabel)}</Label>
                                <div className="flex flex-col gap-2">
                                    <Accordion type="single" collapsible className="w-full">
                                        {entryList.map((entry, index) => (
                                            <AccordionItem value={`${optionLabel}-${index}`} key={index} className="w-full">
                                                <AccordionTrigger className="w-full">
                                                    <span
                                                        className="font-light text-sm block min-w-0 truncate"
                                                        title={formatEntryToText(entry)}
                                                    >
                                                        <span className="hidden sm:inline">
                                                            {index + 1}. {textToTitle(formatEntryToText(entry))}
                                                        </span>
                                                        <span className="inline sm:hidden">
                                                            {index + 1}. {shortenText(textToTitle(formatEntryToText(entry)), 30)}
                                                        </span>
                                                    </span>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div key={index} className="text-sm p-0">
                                                        {Object.entries(entry).filter(([key, fieldData]) => {
                                                            const field = fieldData as StoredFieldData;
                                                            const formattedValue = formatFieldValue(field?.value);

                                                            return !(formattedValue === '' || formattedValue === '-')
                                                        }).map(([key, fieldData], idx) => {
                                                            const field = fieldData as StoredFieldData;
                                                            const formattedValue = formatFieldValue(field?.value);
                                                            const label = field?.label ?? key;

                                                            return (
                                                                <div 
                                                                    className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2" 
                                                                    key={key}
                                                                >
                                                                    <span className="text-sm font-light text-muted-foreground">
                                                                        {label}:
                                                                    </span>
                                                                    <span className="font-light text-foreground break-words text-sm text-left">
                                                                        {formattedValue}
                                                                    </span>
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
            </div>

            <div className="w-full">
                {block.options.length === 1 ? (
                    <Button
                        className="w-full justify-start cursor-pointer"
                        disabled={!!selectedOption || disableItem(block.options[0].label)}
                        onClick={() => handleNew(block.options[0].label)}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Agregar {block.value}
                    </Button>
                ) : (
                    <Popover open={openSelector} onOpenChange={setOpenSelector}>
                        <PopoverTrigger asChild>
                            <Button className="w-full justify-start cursor-pointer" disabled={!!selectedOption}>
                                <Plus className="mr-2 h-4 w-4" /> Agregar {block.value}
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
                )}
            </div>

            {showForm && localStore && selectedOptionForm && (
                <div ref={formRef} className="border border-border p-4 rounded-md space-y-4 bg-muted/5">
                    {selectedOptionForm.forms.map((formConfig, formIndex) => {
                        const conditionalId = `${selectedOption}-${formIndex}`

                        if (formConfig.type === 'conditionalForm') {
                            const currentAnswer = conditionalAnswers[conditionalId] || null;
                            const isExpected = formConfig.expectedAnswer === currentAnswer;

                            return (
                                <div key={`conditional-${conditionalId}`} className="space-y-2">
                                    <div className="space-y-2">
                                        <Label className="font-light text-sm text-foreground">{formConfig.question}</Label>
                                        <div className="flex gap-4">
                                            <RadioGroup
                                                onValueChange={(value) => handleSelectConditional(value, conditionalId, formConfig.expectedAnswer!, formConfig.form.fields)}
                                                className="flex flex-col"
                                            >
                                                {formConfig.questionAnswers?.map((opt) => {
                                                    const inputId = `radio-${opt.value}`
                                                    
                                                    return (
                                                        <div className="flex items-center gap-3">
                                                            <RadioGroupItem id={inputId} value={opt.value} />
                                                            <Label htmlFor={inputId} className="cursor-pointer font-light">{opt.label}</Label>
                                                        </div>
                                                    )
                                                })}
                                            </RadioGroup>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    {isExpected && formConfig.form && Array.isArray(formConfig.form.fields) && (
                                        <div className="border border-border rounded-md p-4 bg-muted/10 space-y-4 mt-2">
                                            {formConfig.form.fields.map((field: EnhancedField, index: number) => (
                                                <FieldRenderer
                                                    key={`${formConfig.form.title}-${field.name}-${index}`}
                                                    field={field}
                                                    blockKey={blockKey}
                                                    store={localStore}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        } else {
                            return (
                                <div key={`form-${formIndex}`}>
                                    {formConfig.form.fields.map((field: EnhancedField, index: number) => (
                                        <FieldRenderer
                                            key={`${formConfig.form.title}-${field.name}-${index}`}
                                            field={field}
                                            blockKey={blockKey}
                                            store={localStore}
                                        />
                                    ))}
                                </div>
                            )
                        }
                        
                    })}

                    <div className="flex gap-4">
                        <Button
                            onClick={handleSave}
                            disabled={!isSaveEnabled}
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

            <Separator className="my-4" />
        </div>
    );
}