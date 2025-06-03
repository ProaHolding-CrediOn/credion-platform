"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { ConditionalFormBlock, EnhancedBlock, EnhancedField, FormBlock, RepeatableFormBlock } from "@/types/FormField";
import { BlockRendererProps } from "./BlockRenderer.type";
import FieldRenderer, { isRegularField } from "../FieldRenderer/FieldRenderer";
import { validateBlockFields } from "@/utils/formValidation";

export const isRepeatableFormBlock = (field: EnhancedBlock): field is RepeatableFormBlock => {
  return "blockType" in field && field.blockType === "repeatableFormBlock";
}

export const isConditionalFormBlock = (field: EnhancedBlock): field is ConditionalFormBlock => {
  return "blockType" in field && field.blockType === "conditionalFormBlock";
}

export const isFormBlock = (field: EnhancedBlock): field is FormBlock => {
  return "blockType" in field && field.blockType === "formBlock";
}

export function validateBlock(blockKey: string, block: EnhancedBlock, formData: Record<string, any>): any {
  if (isFormBlock(block)) {
    return validateBlockFields(blockKey, block.form.fields, formData);
  }

  if (isConditionalFormBlock(block)) {
    const selectedOption = formData[blockKey][block.label];
    const shouldValidate = block.expectedAnswers.some(
      (ans) => ans.value === selectedOption
    );

    if (!shouldValidate) return {};

    return validateBlockFields(blockKey, block.form.fields, formData);
  }

  if (isRepeatableFormBlock(block)) {
    console.log('Es repetido', block)
    console.log('formData', formData[blockKey])
    const storageKey = `repeatable_${block.form.title}`;
    const items = formData[blockKey][storageKey] || [];
    if (items.length === 0) {
      console.log('no items')
      return {};
    }
    return validateBlockFields(blockKey, block.form.fields, formData);
  }

  return true;
}

export default function BlockRenderer({
  block,
  formData,
  blockKey,
  handleInputChange,
  errors,
}: BlockRendererProps) {
  if (isFormBlock(block)) {
    return (
      <div key={`formblock`} className="space-y-4">
        {block.form && Array.isArray(block.form.fields) && block.form.fields.map((field: EnhancedField, index: number) => (
          <FieldRenderer
            key={`${block.form.title}-${field.name}-${index}`}
            field={field}
            formData={formData}
            blockKey={blockKey}
            handleInputChange={handleInputChange}
            errors={errors}
          />
        ))}
      </div>
    );
  }

  if (isConditionalFormBlock(block)) {
    const selectedOption = formData[blockKey][block.label] || "";

    return (
      <div key={`conditional`} className="space-y-4">
        <div className="space-y-2">
          <p className="font-medium text-foreground">{block.label}</p>
          <div className="flex gap-4">
            {block.options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`conditional`}
                  value={opt.value}
                  checked={selectedOption === opt.value}
                  onChange={() =>
                    handleInputChange(blockKey, block.label, opt.value)
                  }
                  className="accent-black"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {block.expectedAnswers.some(
          (ans) => ans.value === selectedOption
        ) && block.form && Array.isArray(block.form.fields) && (
            <div className="border border-border rounded-md p-4 bg-muted/30 space-y-4 mt-2">
              {block.form.fields.map((field: EnhancedField, index: number) => (
                <FieldRenderer
                  key={`${block.form.title}-${field.name}-${index}`}
                  field={field}
                  formData={formData}
                  blockKey={blockKey}
                  handleInputChange={handleInputChange}
                  errors={errors}
                />
              ))}
            </div>
          )}
      </div>
    );
  }

  if (isRepeatableFormBlock(block)) {
    const storageKey = `repeatable_${block.form.title}`;
    const savedItems = formData[blockKey][storageKey] || [];
    
    const [isOpen, setIsOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Record<string, any>>({
      [blockKey]: {}
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFieldChange = (field: string, value: any) => {
      console.log('Field change', field, value);
      setCurrentItem((prev) => ({
        ...prev,
        [blockKey]: {
          ...prev[blockKey],
          [field]: value
        },
      }));
    };

    const canSaveItem = () => {
      const errors = validateBlock(blockKey, block, formData);
      console.log('Repeatable errors', errors);

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return false;
      }

      setErrors({});
      return true;
    }

    const handleSave = () => {
      const updatedItems = [...savedItems, currentItem];

      handleInputChange(blockKey, storageKey, updatedItems);
      setCurrentItem({});
      setIsOpen(false);
    };

    const handleDelete = (index: number) => {
      const updatedItems = savedItems.filter((_: any, i: number) => i !== index);
      handleInputChange(blockKey, storageKey, updatedItems);
    };

    return (
      <div className="space-y-4">
        {!isOpen && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            disabled={
              savedItems.length > 0 &&
              Object.keys(savedItems[savedItems.length - 1]).length === 0
            }
          >
            + {block.add}
          </Button>
        )}

        {isOpen && (
          <div className="border border-border rounded-md p-4 bg-muted/30 space-y-4 mt-2">
            <h3 className="font-semibold text-sm text-foreground">{block.header}</h3>

            {block.form.fields.map((field: EnhancedField, index: number) => (
              <FieldRenderer
                  key={`${block.form.title}-${field.name}-${index}`}
                  field={field}
                  formData={currentItem}
                  blockKey={blockKey}
                  handleInputChange={handleFieldChange}
                  errors={errors}
                />
            ))}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={() => {
                if (canSaveItem()) {
                  handleSave();
                }
              }}>
                Guardar
              </Button>
            </div>
          </div>
        )}

        {savedItems.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Elementos agregados:</p>
            <ul className="space-y-2">
              {savedItems.map((item: any, index: number) => (
                <li
                  key={`item-${index}`}
                  className="flex justify-between items-center p-2 border border-border rounded-md bg-background"
                >
                  <span>
                    {Object.entries(item)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(" | ")}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(index)}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
}