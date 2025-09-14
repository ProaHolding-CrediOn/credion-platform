"use client"

import { FieldRendererProps } from "./FieldRenderer.type";
import { EnhancedField, fieldTypesArray, Field, MessageField } from "@/types/FormField";
import { useCallback, useMemo } from "react";
import CustomTextField from "@/components/CustomTextField/CustomTextField";
import CustomDateField from "@/components/CustomDateField/CustomDateField";
import CustomSelectField from "@/components/CustomSelectField/CustomSelectField";
import CustomPriceField from "@/components/CustomPriceField/CustomPriceField";
import { Separator } from "@/components/ui/separator";
import { LocationValue } from "@/components/LocationField/LocationField.type";
import CustomEmailField from "@/components/CustomEmailField/CustomEmailField";
import CustomPhoneField from "@/components/CustomPhoneField/CustomPhoneField";
import CustomRadioField from "@/components/CustomRadioField/CustomRadioField";
import LocationField from "@/components/LocationField/LocationField";
import SecretariaTransitoField from "@/components/SecretariaTransitoField/SecretariaTransitoField";
import { SecretariaLocationValue } from "@/components/SecretariaTransitoField/SecretariaTransitoField.type";
import CustomTextareaField from "@/components/CustomTextareaField/CustomTextareaField";
import FileUploadField from "@/components/FileUploadField/FileUploadField";
import CustomNumberField from "@/components/CustomNumberField/CustomNumberField";
import { UploadedFile } from "@/components/FileUploadField/FileUploadField.type";
import PlacaField from "@/components/PlacaField/PlacaField";
import OptionsField from "@/components/OptionsField/OptionsField";
import { OptionsValue } from "@/components/OptionsField/OptionsField.type";
import ConceptDetailsField from "@/components/ConceptDetailsField/ConceptDetailsField";
import { ConceptDetailsValue } from "@/components/ConceptDetailsField/ConceptDetailsField.type";
import YearField from "@/components/YearField/YearField";
import IdentificationField from "@/components/IdentificationField/IdentificationField";

export const isMessageField = (field: EnhancedField): field is MessageField => {
  return "lines" in field && field.type === "message";
};

export const isRegularField = (field: EnhancedField): field is Field => {
  return "name" in field && fieldTypesArray.includes(field.type);
};

export default function FieldRenderer({
    field,
    blockKey,
    store
}: FieldRendererProps) {
    const { updateField, setFieldValid } = store();
    const currentValue = store.getState().formData?.[`Paso ${blockKey.layout + 1}`]?.[blockKey.blockName]?.[field.name]?.value;

    const onDataChange = useCallback((name: string, value: string | number | object | null | undefined) => {        
        updateField(blockKey.layout + 1, blockKey.blockName, name, value)
    }, [blockKey, updateField])

    const onValidationChange = useCallback((name: string, isValid: boolean) => {
        setFieldValid(blockKey.layout, blockKey.blockName, name, isValid)
    }, [blockKey, setFieldValid])

    if (isMessageField(field)) {
        return (
            <div key={`field-${field.name}`} role="note" aria-label="Mensaje informativo" className="space-y-2">
                {field.lines.map((line, i) => (
                <p key={`${field.name}_${i}`} className="text-sm text-muted-foreground">
                    {line}
                </p>
                ))}
            </div>
        );
    }

    const memoizedField = useMemo(() => field, [field.name, field.type, field.label, field.validation, field.options])

    if (isRegularField(memoizedField)) {
        return (
            <>
                {(field.type === "customTextField" || field.type === "text") && (
                    <CustomTextField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as string}
                        explain={field.explain}
                        validations={field.validation}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {(field.type === "customNumberField" || field.type === "number") && (
                    <CustomNumberField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as string}
                        validations={field.validation}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {(field.type === "customTextareaField" || field.type === "textarea") && (
                    <CustomTextareaField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as string}
                        validations={field.validation}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "customDateField" && (
                    <CustomDateField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as string}
                        validations={field.validation}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "email" && (
                    <CustomEmailField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as string}
                        validations={field.validation}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "phoneField" && (
                    <CustomPhoneField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as { codigoPais: string, codigoTelefono: string, telefono: string }}
                        validations={field.validation}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "radioButtonField" && field.options && (
                    <CustomRadioField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as string}
                        options={field.options}
                        validations={field.validation}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "priceField" && (
                    <CustomPriceField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as number}
                        validations={field.validation}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "select" && field.options && (
                    <CustomSelectField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as string}
                        options={field.options}
                        validations={field.validation}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "countryStateCityField" && (
                    <LocationField
                        name={field.name}
                        label={field.label}
                        validations={field.validation}
                        value={currentValue as LocationValue}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "secretariaTransitoField" && (
                    <SecretariaTransitoField
                        name={field.name}
                        label={field.label}
                        validations={field.validation}
                        value={currentValue as SecretariaLocationValue}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "fileUploadField" && (
                    <FileUploadField
                        name={field.name}
                        label={field.label}
                        validations={field.validation}
                        value={currentValue as UploadedFile[]}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {(field.type === "placaField") && (
                    <PlacaField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as string}
                        explain={field.explain}
                        validations={field.validation}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "optionsField" && field.options && (
                    <OptionsField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as OptionsValue[]}
                        options={field.options}
                        explain={field.explain}
                        validations={field.validation}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "conceptDetailsField" && (
                    <ConceptDetailsField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as ConceptDetailsValue[]}
                        explain={field.explain}
                        validations={field.validation}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "yearField" && (
                    <YearField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as number}
                        explain={field.explain}
                        validations={field.validation}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                {field.type === "identificationField" && (
                    <IdentificationField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={currentValue as string}
                        explain={field.explain}
                        onChange={onDataChange}
                        onValidationChange={onValidationChange}
                    />
                )}

                <Separator className="my-4"/> 
            </>
        )
    }

    return null;
}