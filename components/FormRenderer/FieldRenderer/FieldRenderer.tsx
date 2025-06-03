"use client"

import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldRendererProps } from "./FieldRenderer.type";
import { EnhancedField, Field, MessageField } from "@/types/FormField";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

export const isMessageField = (field: EnhancedField): field is MessageField => {
  return "lines" in field && field.type === "message";
};

export const isRegularField = (field: EnhancedField): field is Field => {
  return "name" in field && ["text", "email", "number", "textarea", "select"].includes(field.type);
};

function validateField(field: Field, value: any): string | null {
  if (field.required && (!value || (typeof value === "string" && value.trim() === ""))) {
    return "Este campo es obligatorio";
  }
  return null;
}

export default function FieldRenderer({ field, formData, blockKey, handleInputChange, errors }: FieldRendererProps) {
    console.log('Form in fieldrenderer', formData)
    const error = errors[field.name];

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
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            handleInputChange(blockKey, field.name, newValue);
        }

        return (
            <div key={`field-${field.name}`} className="space-y-2">
                <Label htmlFor={field.name}>
                    {field.label}
                </Label>

                {field.type === "text" && (
                    <Input
                        id={field.name}
                        value={formData[blockKey][field.name] ?? ""}
                        onChange={handleChange}
                    />
                )}

                {field.type === "email" && (
                    <Input
                        id={field.name}
                        type="email"
                        value={formData[blockKey][field.name] ?? ""}
                        onChange={handleChange}
                    />
                )}

                {field.type === "number" && (
                    <Input
                        id={field.name}
                        type="number"
                        value={formData[blockKey][field.name] ?? ""}
                        onChange={handleChange}
                    />
                )}

                {field.type === "textarea" && (
                    <Textarea
                        id={field.name}
                        value={formData[blockKey][field.name] ?? ""}
                        onChange={handleChange}
                    />
                )}

                {field.type === "select" && field.options && (
                    <Select
                        onValueChange={(value) => handleInputChange(blockKey, field.name, value)}
                        value={formData[blockKey][field.name] /*formData[field.name]*/}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options.map((option) => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {errors && <p className="text-sm text-destructive">{error}</p>}
            </div>
        )
    }

    return null;
}