import { memo, useEffect, useRef, useState } from "react";
import { ConceptDetailsFieldProps, ConceptDetailsValue } from "./ConceptDetailsField.type";
import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import TextViewer from "../TextViewer/TextViewer";
import { Info } from "lucide-react";
import { Input } from "../ui/input";

type ConceptField = { id: string, label: string, minValue: number, required: boolean, explaination?: string };

export default memo(function ConceptDetailsField({
  name,
  label,
  explain,
  value = [],
  validations,
  onChange,
  onValidationChange,
  disabled
}: ConceptDetailsFieldProps) {
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const [internalValues, setInternalValues] = useState<Record<string, string>>({});
    const debouncedValidationRef = useRef<number | null>(null);

    useEffect(() => {
        if (value) {
            setTouched(true);
            validateAll(value);
        }

        return () => {
            if (debouncedValidationRef.current) {
                window.clearTimeout(debouncedValidationRef.current);
            }
        }
    }, []);

    const required = validations?.find(value => value.name === "required")?.value as boolean;
    const concepts = validations?.find(value => value.name === "concepts")?.value as ConceptField[] | undefined;
    const minimumTotal = validations?.find(value => value.name === "minimumTotal")?.value as number;

    const validateAll = (values: ConceptDetailsValue[]): boolean => {
        if (!touched) return true;

        if (required && (!values || values.length === 0)) {
            setError("Este campo es obligatorio");
            onValidationChange?.(name, false, values);
            return false;
        }

        const hasInvalidConcept = concepts?.some((c) => {
            const val = values.find((v) => v.label === c.label)?.value ?? 0;
            return (c.required && val === 0) || val as number < c.minValue;
        });

        if (hasInvalidConcept) {
            setError("Uno o más campos no cumplen los requisitos mínimos");
            onValidationChange?.(name, false, values);
            return false;
        }

        const total = concepts?.reduce((acc, c) => {
            const val = values.find((v) => v.label === c.label)?.value ?? 0;
            return acc + (val as number);
        }, 0) || 0;

        if (minimumTotal !== undefined && total < minimumTotal) {
            setError(`El total debe ser al menos ${formatPrice(minimumTotal)} COP`);
            onValidationChange?.(name, false, values);
            return false;
        }

        setError(null);
        onValidationChange?.(name, true, values);
        return true;
    };

    function formatPrice(price: number) {
        return new Intl.NumberFormat("es-CO").format(price);
    };

    const parseNumber = (value: string): number => {
        if (!value) return 0;
        const cleaned = value?.replace(/\D/g, "");
        return cleaned ? parseInt(cleaned, 10) : 0;
    }

    const handleChange = (conceptLabel: string, inputValue: string) => {
        const onlyNumbers = inputValue.replace(/\D/g, "");
        const formattedValue = onlyNumbers ? formatPrice(parseInt(onlyNumbers, 10)) : "";

        setInternalValues((prev) => ({
            ...prev,
            [conceptLabel]: formattedValue,
        }));
    }

    const handleDebouncedValidation = (conceptLabel: string, numericValue: number) => {
        if (debouncedValidationRef.current) {
            window.clearTimeout(debouncedValidationRef.current);
        }

        debouncedValidationRef.current = window.setTimeout(() => {
            const updatedValues = [...value];
            const idx = updatedValues.findIndex((v) => v.label === conceptLabel);
            if (idx >= 0) {
                updatedValues[idx] = { ...updatedValues[idx], value: numericValue, type: "priceField" };
            } else {
                updatedValues.push({ label: conceptLabel, value: numericValue, type: "priceField" });
            }

            const total = concepts?.reduce((acc, c) => {
                const val = updatedValues.find(v => v.label === c.label)?.value ?? 0;
                return Number(acc) + Number(val);
            }, 0) || 0;

            const totalLabel = `${label} totales`
            const totalIdx = updatedValues.findIndex((v) => v.label === totalLabel);
            if (totalIdx >= 0) {
                updatedValues[totalIdx] = { label: totalLabel, value: total, type: "priceField" };
            } else {
                updatedValues.push({ label: totalLabel, value: total, type: "priceField" });
            }

            const isValid = validateAll(updatedValues);
            onChange(name, updatedValues);
            onValidationChange?.(name, isValid, updatedValues);
        }, 500);
    };

    const total = concepts?.reduce((acc, c) => {
        const val = value.find(v => v.label === c.label)?.value ?? 0;
        return Number(acc) + Number(val);
    }, 0) || 0;

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-base font-light">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {explain && (
                <Label className="text-xs text-muted-foreground font-light">
                    <TextViewer text={explain} />
                </Label>
            )}

            {concepts?.map(concept => {
                const currentValue = value.find((v) => v.label === concept.label)?.value ?? 0;
                const displayValue = internalValues[concept.label] ?? (currentValue ? formatPrice(currentValue as number) : "");
                const hasExplain = Boolean(concept.explaination);

                return (
                    <div className="flex flex-col" key={concept.id}>
                        <div key={concept.id} className="flex items-center justify-between gap-2">
                            <span className="text-xs font-light">{concept.label} {concept.required && <span className="text-destructive">*</span>}</span>
                            <div className="flex items-center gap-2 ml-2">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                        $
                                    </span>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                        COP
                                    </span>
                                    <Input
                                        id={name}
                                        type="text"
                                        min={concept.minValue}
                                        value={displayValue}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            handleChange(concept.label, inputValue)
                                            handleDebouncedValidation(concept.label,parseNumber(inputValue))
                                        }}
                                        onFocus={() => setTouched(true)}
                                        placeholder={`0`}
                                        className={`pl-8 pr-16 w-50 placeholder:font-light ${error ? "border-destructive" : ""}`}
                                    />
                                </div>
                                {hasExplain ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info size={14} className="cursor-pointer text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs text-xs">
                                            {concept.explaination}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <span className="inline-block w-[14px]" />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {total > 0 && (
                <div className="flex justify-end mr-6 mb-6">
                    <span className="font-light mt-2">Total {label}: <span className="font-semibold">{formatPrice(total as number)}</span> COP</span>
                </div>
            )}
        </div>
    );
})