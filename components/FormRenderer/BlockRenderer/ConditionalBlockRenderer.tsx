import { ConditionalFormBlock, EnhancedField } from "@/types/FormField";
import FieldRenderer from "../FieldRenderer/FieldRenderer";
import { BlockRendererProps } from "./BlockRenderer.type";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ConditionalFormBlockRenderer({ block, blockKey, store }: BlockRendererProps) {
    block = block as ConditionalFormBlock

    const formData = store(state => state.formData)
    const selectedOption = formData?.[`Paso ${blockKey.layout + 1}`]?.[block.blockName]?.['Condicion'].value ?? "";
    const isExpected = block.expectedAnswers.some(ans => ans.value === selectedOption)

    const handleSelect = (value: string) => {
      store.getState().updateField(blockKey.layout + 1, block.blockName, 'Condicion', value)

      if (!block.expectedAnswers.some(ans => ans.value === value)) {
        store.getState().setBlockValid(blockKey.layout, block.blockName, true)
      } else {
        store.getState().setBlockValid(blockKey.layout, block.blockName, false)
      }
    }

    return (
      <div key={`conditional`} className="space-y-4">
        <div className="space-y-2">
          <Label className="font-light text-sm text-foreground">{block.label}</Label>
          <div className="flex gap-4">
            <RadioGroup
              value={String(selectedOption)}
              onValueChange={handleSelect}
              className="flex flex-col"
            >
              {block.options.map((opt) => {
                const inputId = `radio-${block.blockName}-${opt.value}`
                return (
                  <div className="flex items-center gap-3" key={opt.value}>
                    <RadioGroupItem id={inputId} value={opt.value} />
                    <Label htmlFor={inputId} className="cursor-pointer font-light">{opt.label}</Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>
        </div>

        <Separator className="my-4"/> 

        {isExpected && block.form && Array.isArray(block.form.fields) && (
            <div className="border border-border rounded-md p-4 bg-muted/10 space-y-4 mt-2">
              {/*<ResponsiveFieldGrid>*/}
                {block.form.fields.map((field: EnhancedField, index: number) => (
                  <FieldRenderer
                    key={`${block.form.title}-${field.name}-${index}`}
                    field={field}
                    blockKey={blockKey}
                    store={store}
                  />
                ))}
              {/*</ResponsiveFieldGrid>*/}
            </div>
          )}
      </div>
    );
}