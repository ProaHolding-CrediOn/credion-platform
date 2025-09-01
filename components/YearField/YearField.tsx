"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import TextViewer from "../TextViewer/TextViewer";
import { YearFieldProps } from "./YearField.type";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";

export default memo(function YearField({
    name,
    label,
    explain,
    value,
    validations,
    onChange,
    onValidationChange,
}: YearFieldProps) {
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const today = new Date();
    const currentYear = today.getFullYear();

    useEffect(() => {
      if (value) {
        setTouched(true);
        setSelectedYear(value);
      }
    }, []);

    const parseRelativeYear = (str: string): number | null => {
        const match = str.match(/^today([+-])(\d+)-(years)$/);
        if (!match) return null;

        const [, sign, amountStr] = match;
        const amount = parseInt(amountStr, 10);
        const offset = sign === "+" ? amount : -amount;

        return currentYear + offset;
    };

    const resolveYear = (input: string | undefined): number | null => {
        if (!input) return null;

        if (input.startsWith("today")) {
            return parseRelativeYear(input);
        }

        const parsed = parseInt(input, 10);
        return isNaN(parsed) ? null : parsed;
    };

    const required = validations?.find((v) => v.name === "required")?.value as boolean | undefined;
    const minYearStr = validations?.find((v) => v.name === "minYear")?.value as string | undefined;
    const maxYearStr = validations?.find((v) => v.name === "maxYear")?.value as string | undefined;
    const yearsLeft = validations?.find((v) => v.name === "yearsLeft")?.value as boolean | undefined;

    const minYear = minYearStr ? resolveYear(minYearStr) : null;
    const maxYear = maxYearStr ? resolveYear(maxYearStr) : null;

    const options = useMemo(() => {
        if (minYear === null || maxYear === null || minYear > maxYear) {
            console.warn("Rango de años inválido:", { minYear, maxYear });
            return [];
        }

        const start = minYear;
        const end = maxYear;
        const years: { value: number; label: string }[] = [];

        for (let year = start; year <= end; year++) {
            years.push({
                value: year,
                label: year.toString(),
            });
        }

        return years;
    }, [minYear, maxYear]);

    const getYearsDiffText = (year: number): string => {
        const diffYears = year - currentYear;

        if (diffYears === 0) return "Este año";
        if (diffYears > 0) return `Faltan ${diffYears} año${diffYears > 1 ? "s" : ""}`;
        return `Han pasado ${Math.abs(diffYears)} año${Math.abs(diffYears) > 1 ? "s" : ""}`;
    };

    const validate = useCallback((year: number | undefined): boolean => {
        if (!touched) return true;

        if (required && !year) {
            setError("Este campo es obligatorio");
            return false;
        }

        if (!required && !year) {
            setError(null);
            return true;
        }

        if (year) {
            if (minYear !== null && year < minYear) {
                setError(`El año debe ser mayor o igual a ${minYear}`);
                return false;
            }
            if (maxYear !== null && year > maxYear) {
                setError(`El año debe ser menor o igual a ${maxYear}`);
                return false;
            }
        }

        setError(null);
        return true;
    }, [touched, required, minYear, maxYear]);

    const handleChange = (year: number) => {
        const isValid = validate(year);
        onChange(name, year);
        onValidationChange?.(name, isValid, value);
        setSearchTerm("");
        setOpen(false);
        setSelectedYear(year);
    };

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;

        const searchStr = searchTerm;
        return options.filter((option) =>
            option.value.toString().includes(searchStr)
        );
    }, [options, searchTerm]);

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-sm font-light">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {explain && (
                <Label className="text-xs text-muted-foreground font-light">
                    <TextViewer text={explain} />
                </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        role="combobox"
                        className={cn(
                            "w-full flex justify-between items-center",
                            !selectedYear && "text-muted-foreground",
                            error && "border-destructive"
                        )}
                        aria-expanded={open}
                        onFocus={() => setTouched(true)}
                    >
                        <span className="text-left truncate font-light">
                            {selectedYear ? selectedYear : "Seleccione un año"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Buscar año..."
                            onValueChange={(value) => {
                                const numericValue = value.replace(/[^0-9]/g, "");
                                setSearchTerm(numericValue);
                            }}
                            value={searchTerm}
                        />
                        <CommandList>
                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                            <CommandGroup>
                                {filteredOptions.map((option, index) => (
                                    <CommandItem
                                        key={index}
                                        onSelect={() => {
                                            handleChange(option.value);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {yearsLeft && selectedYear && (
                <p className="text-xs text-muted-foreground italic">
                    {getYearsDiffText(selectedYear)}
                </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
})