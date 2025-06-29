"use client"

import { Input } from "../../ui/input";
import { FieldRendererProps } from "./FieldRenderer.type";
import { EnhancedField, fieldTypesArray, Field, MessageField } from "@/types/FormField";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import CustomTextField from "@/components/CustomTextField/CustomTextField";
import CustomDateField from "@/components/CustomDateField/CustomDateField";
import CustomSelectField from "@/components/CustomSelectField/CustomSelectField";
import { CustomPhoneField } from "@/components/CustomPhoneField";
import { CustomEmailField } from "@/components/CustomEmailField/CustomEmailField";
import { LocationField } from "@/components/LocationField/LocationField";
import { CustomRadioField } from "@/components/CustomRadioField";
import CustomPriceField from "@/components/CustomPriceField/CustomPriceField";
import { Separator } from "@/components/ui/separator";

export const isMessageField = (field: EnhancedField): field is MessageField => {
  return "lines" in field && field.type === "message";
};

export const isRegularField = (field: EnhancedField): field is Field => {
  return "name" in field && fieldTypesArray.includes(field.type);
};

export default function FieldRenderer({
    field,
    formData,
    blockKey,
    handleInputChange,
    onFieldValidation
}: FieldRendererProps) {

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

    if (isRegularField(field)) {
        const onDataChange = (name: string, label: string, value: string | number) => {            
            handleInputChange(blockKey, name, label, value);
        }

        const layoutId = `layout_${blockKey['layout']}`
        const blockId = `block_${blockKey['block']}` 

        return (
            <div key={`field-${field.name}`} className="space-y-2">
                {(field.type === "customTextField" || field.type === "text")&& (
                    <CustomTextField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={formData[layoutId][blockId][field.name].value ?? ""}
                        validations={field.validation}
                        onChange={(fieldName, value) => onDataChange(fieldName, field.label, value)}
                        onValidationChange={(fieldName, isValid, value) => onFieldValidation?.(fieldName, isValid)}
                    />
                )}

                {field.type === "customDateField" && (
                    <CustomDateField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={formData[layoutId][blockId][field.name].value ?? ""}
                        validations={field.validation}
                        onChange={(fieldName, value) => onDataChange(fieldName, field.label, value)}
                        onValidationChange={(fieldName, isValid, value) => onFieldValidation?.(fieldName, isValid)}
                    />
                )}

                {field.type === "email" && (
                    <CustomEmailField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={formData[layoutId][blockId][field.name].value ?? ""}
                        validations={field.validation}
                        onChange={(fieldName, value) => onDataChange(fieldName, field.label, value)}
                        onValidationChange={(fieldName, isValid, value) => onFieldValidation?.(fieldName, isValid)}
                    />
                )}

                {field.type === "number" && (
                    <Input
                        id={field.name}
                        type="number"
                        value={formData[layoutId][blockId][field.name] ?? ""}
                    />
                )}

                {field.type === "phoneField" && (
                    <CustomPhoneField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={formData[layoutId][blockId][field.name].value ?? ""}
                        validations={field.validation}
                        onChange={(fieldName, value) => onDataChange(fieldName, field.label, value)}
                        onValidationChange={(fieldName, isValid, value) => onFieldValidation?.(fieldName, isValid)}
                    />
                )}

                {field.type === "radioButtonField" && field.options && (
                    <CustomRadioField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={formData[layoutId][blockId][field.name].value ?? ""}
                        options={field.options}
                        validations={field.validation}
                        onChange={(fieldName, value) => onDataChange(fieldName, field.label, value)}
                        onValidationChange={(fieldName, isValid, value) => onFieldValidation?.(fieldName, isValid)}
                    />
                )}

                {field.type === "priceField" && (
                    <CustomPriceField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={formData[layoutId][blockId][field.name].value ?? ""}
                        validations={field.validation}
                        onChange={(fieldName, value) => onDataChange(fieldName, field.label, value)}
                        onValidationChange={(fieldName, isValid, value) => onFieldValidation?.(fieldName, isValid)}
                    />
                )}

                {field.type === "select" && field.options && (
                    <CustomSelectField
                        key={`field-${field.name}`}
                        name={field.name}
                        label={field.label}
                        value={formData[layoutId][blockId][field.name].value ?? ""}
                        options={field.options}
                        validations={field.validation}
                        onChange={(fieldName, value) => onDataChange(fieldName, field.label, value)}
                        onValidationChange={(fieldName, isValid, value) => onFieldValidation?.(fieldName, isValid)}
                    />
                )}

                {field.type === "countryStateCityField" && (
                    <LocationField
                        name={field.name}
                        label={field.label}
                        validations={field.validation}
                        onChange={(fieldName, value) => onDataChange(fieldName, field.label, `${value.country}-${value.state}-${value.city}`)}
                        onValidationChange={(fieldName, isValid, value) => onFieldValidation?.(fieldName, isValid)}
                    />
                )}

                <Separator className="my-4"/>
                
            </div>
        )
    }

    return null;
}