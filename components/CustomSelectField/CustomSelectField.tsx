import { memo, useEffect, useState } from "react";
import { CustomSelectFieldProps } from "./CustomSelectField.type";
import { Label } from "@radix-ui/react-label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn, normalizeText } from "@/lib/utils";
import TextViewer from "../TextViewer/TextViewer";

export default memo(function CustomSelectField({
  name,
  label,
  explain,
  value = "",
  options,
  validations,
  onChange,
  onValidationChange,
  disabled
}: CustomSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (value) {
      setTouched(true);
      validate(value);
    }
  }, []);

  const required = validations?.find(value => value.name === "required")?.value as boolean;

  const validate = (inputValue: string): boolean => {
    if (!touched) return true;

    if (!required && inputValue.trim() === "") {
        setError(null);
        return true;
    }

    if (required && inputValue.trim() === "") {
      setError("Este campo es obligatorio");
      return false;
    }

    setError(null);
    return true;
  };

  const handleChange = (value: any) => {
    const isValid = validate(value);
    onChange(name, value);
    onValidationChange?.(name, isValid, value);
    setSearchTerm("");
    setOpen(false);
  };

  const filteredOptions = options.filter((option) => {
      const optionSearch = normalizeText(option.label)
      const searchTermSearch = normalizeText(searchTerm).toLowerCase()
      return optionSearch.includes(searchTermSearch)
    }
  );

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-light">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {explain && <Label className="text-xs text-muted-foreground font-light">
        <TextViewer text={explain} />
      </Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
                variant={"outline"}
                role="combobox"
                className={cn("w-full flex justify-between items-center", !selectedOption && "text-muted-foreground", error && "text-destructive")}
                aria-expanded={open}
                onFocus={() => setTouched(true)}
                disabled={disabled}
            >
                <span className="text-left truncate font-light">
                    {selectedOption ? selectedOption.label : "Seleccione una opción"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
            <Command shouldFilter={false}>
                <CommandInput
                    placeholder="Buscar..."
                    onValueChange={setSearchTerm}
                    value={searchTerm}
                />
                <CommandList>
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                    <CommandGroup>
                        {filteredOptions.map((option) => (
                            <CommandItem
                                key={option.value}
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
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})