import { memo, useEffect, useState } from "react";
import { Label } from "@radix-ui/react-label";
import TextViewer from "../TextViewer/TextViewer";
import { OptionFieldValue, OptionsFieldProps, OptionsValue } from "./OptionsField.type";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldOption } from "@/types/FormField";
import { ExtraFields } from "./ExtraFieldsRender";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type ExtraField = { id: string, label: string, value: string, type: string, required: boolean };

export default memo(function OptionsField({
  name,
  label,
  explain,
  value = [],
  options,
  validations,
  onChange,
  onValidationChange,
  disabled
}: OptionsFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [pendingSelections, setPendingSelections] = useState<{ option: FieldOption; extraValues: OptionFieldValue[] }[]>([]);
  const [selectedSaved, setSelectedSaved] = useState(false);

  useEffect(() => {
    if (value) {
      setTouched(true);
      //validate(value);
    }
  }, []);

  const required = validations?.find(value => value.name === "required")?.value as boolean;
  let inputType = validations?.find(value => value.name === "inputType")?.value;
  if (inputType !== 'select' && inputType !== 'radio' && inputType !== 'checkbox') {
    inputType = 'select'
  }

  const extraFields = validations?.find(value => value.name === "extraFields")?.value as { [key: string]: ExtraField[] } | undefined;

  const optionHasExtraFields = (optionValue: string) => {
    return Object.keys(extraFields || {}).some(key => optionValue === key);
  }

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

  const handleCheckboxChange = (isChecked: boolean, option: FieldOption) => {
    if (isChecked) {
      if (optionHasExtraFields(option.value as string)) {
        setPendingSelections((prev) => [
            ...prev,
            { option, extraValues: [] }
        ]);
      } else {
        const optionValue: OptionsValue = { label: option.label, value: [] };
        const newValue: OptionsValue[] = [...(Array.isArray(value) ? value : []), optionValue];
        const isValid = validate(newValue.length ? "ok" : "");
        onChange(name, newValue);
        onValidationChange?.(name, isValid, newValue);
      }
    } else {
      const newValue = (value as OptionsValue[]).filter(v => v.label !== option.value);
      const isValid = validate(newValue.length ? "ok" : "");
      onChange(name, newValue);
      onValidationChange?.(name, isValid, newValue);

      setPendingSelections((prev) => prev.filter(p => p.option.label !== option.value));
    }
  };

  const handleExtraFieldChange = (optionValue: string, fieldLabel: string, fieldValue: string, fieldType: string) => {
    setPendingSelections((prev) =>
      prev.map((p) => {
        if (p.option.value !== optionValue) return p;

        const existsIndex = p.extraValues.findIndex(v => v.label === fieldLabel);
        let updatedExtraValues;

        if (existsIndex >= 0) {
          updatedExtraValues = p.extraValues.map((v, i) => i === existsIndex ? { ...v, value: fieldValue } : v)
        } else {
          updatedExtraValues = [...p.extraValues, { label: fieldLabel, value: fieldValue, type: fieldType }]
        }

        return { ...p, extraValues: updatedExtraValues }
      })
    );
  };

  const checkAndConfirmPendingCheckbox = (optionValue: string) => {
    const pending = pendingSelections.find(p => p.option.value === optionValue);
    if (!pending) return;

    const extrasConfig = extraFields?.[optionValue] || [];
    const allFilled = extrasConfig.filter(f => f.required).every((f) => (pending.extraValues.find(v => v.label === f.label)?.value || "").trim() !== "");
    
    if (allFilled) {
      const newValue: OptionsValue[]  = [...(Array.isArray(value) ? value : []), {
        label: pending.option.label,
        value: pending.extraValues as OptionFieldValue[]
      }];
      const isValid = validate(newValue.length ? "ok" : "");
      onChange(name, newValue);
      onValidationChange?.(name, isValid, newValue);

      setPendingSelections((prev) => prev.filter(p => p.option.value !== optionValue));
      if (inputType === 'select') setSelectedSaved(true);
    }
  };

  const checkAndConfirmPendingSelect = (optionValue: string) => {
    const pending = pendingSelections.find(p => p.option.value === optionValue);
    if (!pending) return;

    const extrasConfig = extraFields?.[optionValue] || [];
    const allFilled = extrasConfig.filter(f => f.required).every((f) => (pending.extraValues.find(v => v.label === f.label)?.value || "").trim() !== "");
    
    if (allFilled) {
      const newValue: OptionsValue[]  = [{
        label: pending.option.label,
        value: pending.extraValues as OptionFieldValue[]
      }];
      const isValid = validate(newValue.length ? "ok" : "");
      onChange(name, newValue);
      onValidationChange?.(name, isValid, newValue);

      setPendingSelections((prev) => prev.filter(p => p.option.value !== optionValue));
      if (inputType === 'select') setSelectedSaved(true);
    }
  };

  const formatValue = (val: any) => {
    if (val == null) return "";

    if (typeof val === "number") {
      return val.toString();
    }

    if (typeof val === "string") {
      const isDateLike = /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(val);
      if (isDateLike) {
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "short",
            day: "2-digit"
          });
        }
      }
      return val;
    }

    return String(val);
  };

  const renderCheckboxOption = (options: FieldOption[]) => {
    return options.map((option) => {
      const checked = Array.isArray(value) && value.some(v => v.label === option.value);
      const pending = pendingSelections.find(p => p.option.label === option.value);

      return (
        <div key={option.id} className="flex flex-col ">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${name}-${option.id}`}
              checked={checked || !!pending}
              onCheckedChange={(isChecked) => handleCheckboxChange(!!isChecked, option)}
              disabled={disabled}
            />
            <Label htmlFor={`${name}-${option.id}`} className="text-sm font-light">
              {option.label}
            </Label>
          </div>

          {pending && (
            <ExtraFields
              optionValue={option.value as string}
              pending={pending}
              extraFields={extraFields}
              disabled={disabled}
              name={name}
              handleExtraFieldChange={handleExtraFieldChange}
              checkAndConfirmPending={checkAndConfirmPendingCheckbox}
            />
          )}

          {!pending && checked && optionHasExtraFields(option.value as string) && (() => {
            const selected = Array.isArray(value) 
              ? value.find(v => v.label === option.value) 
              : null;

            return (
              <div className="pl-6 text-xs text-muted-foreground font-light space-y-1">
                {selected?.value && (
                  <ul className="list-disc pl-4">
                    {Object.entries(selected.value).map(([key, val]) => (
                      <li key={key}>
                        <span className="font-medium">{val.label}:</span> {formatValue(val.value)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}

          {options.findLastIndex((o) => o.value === option.value) !== options.length - 1 && <Separator className="mt-2"/>}
        </div>
      );
    });
  };

const renderSelectOption = (options: FieldOption[]) => {
  const handleSelectChange = (selectedValue: string) => {
    const option = options.find(o => String(o.value) === selectedValue);
    if (!option) return;

    const hasExtra = optionHasExtraFields(String(option.value));

    if (hasExtra) {
      // Mostrar de una vez la opción seleccionada en el Select (estado local)
      setPendingSelections([{ option, extraValues: [] }]);
      setSelectedSaved(false);
    } else {
      // Confirmar inmediatamente
      const newValue: OptionsValue[] = [
        { label: option.label, value: [{ label: option.label, value: option.label }] }
      ];
      setSelectedSaved(true);
      const isValid = validate(newValue.length ? "ok" : "");
      onChange(name, newValue);
      onValidationChange?.(name, isValid, newValue);
      // Asegurar que no quede pendiente previo
      setPendingSelections([]);
    }
  };

  // Valor confirmado (mapeado por label → option.value)
  const committedOptionValue =
    Array.isArray(value) && value.length > 0
      ? String(options.find(o => o.label === value[0].label)?.value ?? "")
      : undefined;

  // Valor pendiente (si hay extraFields por diligenciar)
  const pendingOptionValue = pendingSelections[0]?.option
    ? String(pendingSelections[0].option.value)
    : undefined;

  // El Select debe mostrar primero el pendiente; si no hay, el confirmado
  const selectValue = pendingOptionValue ?? committedOptionValue;

  // Para el resumen, usa el confirmado (cuando no hay pending)
  const committedOption = options.find(o => String(o.value) === committedOptionValue);

  return (
    <div className="flex flex-col gap-2">
      <Select value={selectValue} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona una opción" />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.id} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {pendingSelections.map(pending => (
        <ExtraFields
          key={String(pending.option.value)}
          optionValue={String(pending.option.value)}
          pending={pending}
          extraFields={extraFields}
          disabled={disabled}
          name={name}
          handleExtraFieldChange={handleExtraFieldChange}
          checkAndConfirmPending={checkAndConfirmPendingSelect}
        />
      ))}

      {!pendingSelections.length &&
        committedOption &&
        optionHasExtraFields(String(committedOption.value)) && (
          <div className="pl-6 text-xs text-muted-foreground font-light space-y-1">

            {value[0]?.value && (
              <ul className="list-disc pl-4">
                {value[0].value.map((val: any, i: number) => (
                  <li key={i}>
                    <span className="font-medium">{val.label}:</span> {formatValue(val.value)}
                  </li>
                ))}
              </ul>
            )}
          </div>
      )}

      {selectedSaved && (
        <span className="pl-6 text-xs text-muted-foreground font-light">
          Información ingresada exitosamente
        </span>
      )}
    </div>
  );
};


  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-light">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {explain && <Label className="text-xs text-muted-foreground font-light">
        <TextViewer text={explain} />
      </Label>}
      {inputType === 'checkbox' && (
        <div className="flex flex-col gap-4 mt-2">
          {renderCheckboxOption(options)}
        </div>
      )}
      {inputType === 'select' && (
        <div className="flex flex-col gap-4 mt-2">
          {renderSelectOption(options)}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
})