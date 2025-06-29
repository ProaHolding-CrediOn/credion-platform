"use client";

import { useEffect, useState } from "react";
import { CustomDateFieldProps } from "./CustomDateField.type";
import { Label } from "@radix-ui/react-label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { es as esLocale } from "date-fns/locale/es";

export default function CustomDateField({
    name,
    label,
    value = "",
    validations,
    onChange,
    onValidationChange,
}: CustomDateFieldProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (value) {
        setTouched(true);
        const parsedDate = new Date(value);
        setSelectedDate(parsedDate);
      }
    }, []);

    const parseRelativeDate = (str: string): { value: Date, quantity: number, unit: string } | null => {
        const today = new Date();
        if (str.startsWith("today")) {
            const matchYears = str.match(/today-([0-9]+)-years/);
            if (matchYears && matchYears[1]) {
                const years = parseInt(matchYears[1], 10);
                const date = new Date(today.getFullYear() - years, today.getMonth(), today.getDate());
                return { value: date, quantity: years, unit: "años" };
            }

            const matchMonths = str.match(/today-([0-9]+)-months/);
            if (matchMonths && matchMonths[1]) {
                const months = parseInt(matchMonths[1], 10);
                const date =  new Date(today.getFullYear(), today.getMonth() - months, today.getDate());
                return { value: date, quantity: months, unit: "meses" };
            }

            const matchDays = str.match(/today-([0-9]+)-days/);
            if (matchDays && matchDays[1]) {
                const days = parseInt(matchDays[1], 10);
                const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
                return { value: date, quantity: days, unit: "días" };
            }
        }
        return null;
    };

    const required = validations?.find(value => value.name === "required")?.value as boolean;
    const minDate = validations?.find(value => value.name === "minDate")?.value as string;
    const maxDate = validations?.find(value => value.name === "maxDate")?.value as string;
    const parsedMinDate = minDate ? parseRelativeDate(minDate) : undefined;
    const parsedMaxDate = maxDate ? parseRelativeDate(maxDate) : undefined;

    const validate = (date: Date | undefined): boolean => {
        if (!touched) return true;

        if (!required && !date) {
            setError(null);
            return true;
        }

        if (required && !date) {
            setError("Este campo es obligatorio");
            return false;
        }

        if (parsedMinDate && date && date > parsedMinDate.value) {
            setError(`La fecha debe ser mayor a hoy menos ${parsedMinDate.quantity} ${parsedMinDate.unit}`);
            return false;
        }

        if (parsedMaxDate && date && date < parsedMaxDate.value) {
            setError(`La fecha debe ser menor a hoy menos ${parsedMaxDate.quantity} ${parsedMaxDate.unit}`);
            return false;
        }

        setError(null);
        return true;
    };

    const handleSelect = (date: Date | undefined) => {
      setSelectedDate(date);
      const formattedValue = date ? format(date, "yyyy-MM-dd") : "";
      const isValid = validate(date);
      onChange(name, formattedValue);
      onValidationChange?.(name, isValid, formattedValue);
      setOpen(false);
    }

    const handleOnAttention = () => {
      setTouched(true);
      const isValid = validate(selectedDate);
      onValidationChange?.(name, isValid, value);
    };

    const displayDate = selectedDate ? format(selectedDate, 'PPP', { locale: esLocale }) : 'Selecciona una fecha';
    
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Popover open={open} onOpenChange={() => { setOpen(!open); setTouched(true);}}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground", error && "text-destructive")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayDate}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              autoFocus
              locale={esLocale}
              captionLayout="dropdown"
              className="rounded-md border shadow-sm p-3"
              defaultMonth={parsedMinDate?.value}
              endMonth={parsedMinDate?.value}
              startMonth={parsedMaxDate?.value}
            />
          </PopoverContent>
        </Popover>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
}