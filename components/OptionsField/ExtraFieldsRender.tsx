import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { OptionFieldValue } from "./OptionsField.type"

interface ExtraFieldsProps {
  optionValue: string
  pending: { option: any; extraValues: OptionFieldValue[] } | undefined
  extraFields?: Record<string, { id: string; label: string; value: string; type: string, required: boolean; }[]>
  disabled?: boolean
  name: string
  handleExtraFieldChange: (optionValue: string, fieldLabel: string, value: string, type: string) => void
  checkAndConfirmPending: (optionValue: string) => void
}

export function ExtraFields({
  optionValue,
  pending,
  extraFields,
  disabled,
  name,
  handleExtraFieldChange,
  checkAndConfirmPending
}: ExtraFieldsProps) {
  const [openDatePickers, setOpenDatePickers] = useState<Record<string, boolean>>({})
  const [selectedDates, setSelectedDates] = useState<Record<string, Date | undefined>>({})

  if (!pending) return null

  const toggleDatePicker = (fieldLabel: string, isOpen: boolean) => {
    setOpenDatePickers((prev) => ({ ...prev, [fieldLabel]: isOpen }))
  }

  const handleDateSelect = (fieldLabel: string, date: Date | undefined) => {
    setSelectedDates((prev) => ({ ...prev, [fieldLabel]: date }))
    handleExtraFieldChange(optionValue, fieldLabel, date ? date.toISOString() : "", "date")
    toggleDatePicker(fieldLabel, false)
  }

  const capitalizeFirst = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);


  return (
    <div className="ml-6 flex flex-col gap-2 border border-border rounded-md p-4 bg-muted/10 space-y-2 mt-2">
      {extraFields?.[optionValue]?.map((extraField) => {
        const currentValue = pending.extraValues.find(v => v.label === extraField.label)?.value || ""
        const selectedDate = selectedDates[extraField.label]

        return (
          <div key={extraField.id} className="flex flex-col gap-1">
            <Label htmlFor={name} className="text-xs font-light">
              {extraField.label} {extraField.required && <span className="text-destructive">*</span>}
            </Label>
            {extraField.type === "text" && (
              <Input
                id={`${name}-${extraField.id}`}
                value={currentValue}
                placeholder={`Ingrese ${extraField.label.toLowerCase()}`}
                onChange={(e) => handleExtraFieldChange(optionValue, extraField.label, capitalizeFirst(e.target.value), "text")}
                disabled={disabled}
                className="border rounded px-2 py-1 font-light pr-4 placeholder:font-light"
              />
            )}

            {extraField.type === "number" && (
              <Input
                id={`${name}-${extraField.id}`}
                type="number"
                value={currentValue}
                placeholder={`Ingrese ${extraField.label.toLowerCase()}`}
                onChange={(e) => handleExtraFieldChange(optionValue, extraField.label, e.target.value, "number")}
                disabled={disabled}
                className="border rounded px-2 py-1 font-light placeholder:font-light"
              />
            )}

            {extraField.type === "date" && (
              <Popover
                open={!!openDatePickers[extraField.id]}
                onOpenChange={(isOpen) => toggleDatePicker(extraField.id, isOpen)}
              >
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="font-light justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "dd/MM/yyyy")
                        : extraField.label}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => handleDateSelect(extraField.label, date)}
                    autoFocus
                    captionLayout="dropdown"
                    className="rounded-md border shadow-sm p-3"
                  />
                </PopoverContent>
              </Popover>
            )}

            {extraField.type === "textarea" && (
              <Textarea
                id={`${name}-${extraField.id}`}
                value={currentValue}
                placeholder={`Ingrese ${extraField.label.toLowerCase()}`}
                onChange={(e) => handleExtraFieldChange(optionValue, extraField.label, capitalizeFirst(e.target.value), "textarea")}
                disabled={disabled}
                className="border rounded px-2 py-1 font-light placeholder:font-light"
              />
            )}

          </div>
        )
      })}

      <span className="text-xs font-light">Completa todos los campos requeridos para continuar <span className="text-destructive">*</span></span>

      <Button
        variant="default"
        size="sm"
        onClick={() => checkAndConfirmPending(optionValue)}
        disabled={!extraFields?.[optionValue]?.filter(f => f.required).every((f) => (pending.extraValues.find(v => v.label === f.label)?.value || "").trim() !== "")}
        className="font-light"
      >
        Guardar
      </Button>
    </div>
  )
}
