import { useEffect, useState } from "react";
import { CustomRadioFieldProps } from "./CustomRadioField.type";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export function CustomRadioField({
  name,
  label,
  value = "",
  options,
  validations,
  onChange,
  onValidationChange,
}: CustomRadioFieldProps) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setTouched(true);
      validate(value);
    }
  }, [])

  const required = validations?.find(value => value.name === "required")?.value as boolean;

    const validate = (inputValue: string): boolean => {
        if (!touched) return true;

        if (!required) {
            setError(null);
            return true;
        }

        if (required && !inputValue) {
            setError("Este campo es obligatorio");
            return false;
        }

        setError(null);
        return true;
    };

  const handleChange = (selectedValue: string) => {
    onChange(name, selectedValue);
    const isValid = validate(selectedValue);
    onValidationChange?.(name, isValid, selectedValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <RadioGroup
        className="flex flex-col"
        value={value}
        onValueChange={handleChange}
      >
        {options.map((option, index) => (
            <div className="flex items-center gap-3" key={`radio_${index}`}>
                <RadioGroupItem id={option.id} value={String(option.value)}/>
                <Label
                  htmlFor={option.id}
                  className="cursor-pointer"
                  onClick={() => {
                    value = String(option.value);
                    handleChange(String(option.value));
                  }}
                >
                  {option.label}
                </Label>
            </div>    
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}