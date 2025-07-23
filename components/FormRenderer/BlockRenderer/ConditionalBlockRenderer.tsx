import { ConditionalFormBlock, EnhancedField,  } from "@/types/FormField";
import FieldRenderer from "../FieldRenderer/FieldRenderer";
import { BlockRendererProps } from "./BlockRenderer.type";
import { Separator } from "@/components/ui/separator";

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
          <p className="font-medium text-foreground">{block.label}</p>
          <div className="flex gap-4">
            {block.options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`conditional-${opt.value}`}
                  value={opt.value}
                  checked={selectedOption === opt.value}
                  onChange={() =>handleSelect(opt.value)}
                  className="accent-black"
                />
                {opt.label}
              </label>
            ))}
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