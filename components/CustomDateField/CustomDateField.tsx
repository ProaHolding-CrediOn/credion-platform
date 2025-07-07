"use client";

import { memo, useEffect, useState } from "react";
import { CustomDateFieldProps } from "./CustomDateField.type";
import { Label } from "@radix-ui/react-label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { es as esLocale } from "date-fns/locale/es";

export default memo(function CustomDateField({
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

        const match = str.match(/^today([+-])(\d+)-(years|months|days)$/);
        if (!match) return null;

        const [, sign, amountStr, unit] = match;
        const amount = parseInt(amountStr, 10) * (sign === "+" ? 1 : -1);

        let date: Date;
        switch (unit) {
          case "years":
            date = new Date(today)
            date.setFullYear(today.getFullYear() + amount)
            return { value: date, quantity: amount, unit: "años" };
          case "months":
            date = new Date(today);
            date.setMonth(today.getMonth() + amount);
            return { value: date, quantity: amount, unit: "meses" };
          case "days":
            date = new Date(today);
            date.setDate(today.getDate() + amount);
            return { value: date, quantity: amount, unit: "días" };
          default:
            return null;
        }
    };

    const getDaysDiffText = (date: Date): string => {
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const selectedMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const diffTime = selectedMidnight.getTime() - todayMidnight.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Es hoy";
      if (diffDays > 0) return `Faltan ${diffDays} día${diffDays > 1 ? "s" : ""}`;
      return `Han pasado ${Math.abs(diffDays)} día${Math.abs(diffDays) > 1 ? "s" : ""}`;
    };

    const required = validations?.find(value => value.name === "required")?.value as boolean;
    const minDate = validations?.find(value => value.name === "minDate")?.value as string;
    const maxDate = validations?.find(value => value.name === "maxDate")?.value as string;
    const daysLeft = validations?.find(value => value.name === "daysLeft")?.value as boolean;
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

      console.log('parsedMinDate', parsedMinDate, 'parsedMaxDate', parsedMaxDate, 'date', date)
      if (parsedMinDate && date && date < parsedMinDate.value) {
          setError(`La fecha debe ser mayor a hoy menos ${parsedMinDate.quantity} ${parsedMinDate.unit}`);
          return false;
      }

      if (parsedMaxDate && date && date > parsedMaxDate.value) {
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

    const displayDate = selectedDate ? format(selectedDate, 'PPP', { locale: esLocale }) : 'Selecciona una fecha';
    
    const hiddenDates = (date: Date) => {
      if (parsedMinDate && date < parsedMinDate.value) return true;
      if (parsedMaxDate && date > parsedMaxDate.value) return true;
      return false;
    };

    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-light">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Popover open={open} onOpenChange={() => { setOpen(!open); setTouched(true);}}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-light", !selectedDate && "text-muted-foreground", error && "text-destructive")}
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
              defaultMonth={selectedDate ?? parsedMinDate?.value}
              disabled={(date) => {
                if (parsedMinDate && date < parsedMinDate.value) return true;
                if (parsedMaxDate && date > parsedMaxDate.value) return true;
                return false;
              }}
              startMonth={parsedMinDate?.value}
              endMonth={parsedMaxDate?.value}
            />
          </PopoverContent>
        </Popover>
        {daysLeft && selectedDate && <p className="text-xs text-muted-foreground italic">{getDaysDiffText(selectedDate)}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
})