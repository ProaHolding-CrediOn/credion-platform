import { EnhancedField, FormBlock } from "@/types/FormField";
import FieldRenderer from "../FieldRenderer/FieldRenderer";
import { BlockRendererProps } from "./BlockRenderer.type";

export default function FormBlockRenderer({ block, blockKey, store }: BlockRendererProps) {
    block = block as FormBlock

    return (
        <div key={`formblock`} className="space-y-4">
            {/*<ResponsiveFieldGrid>*/}
                {block.form && Array.isArray(block.form.fields) && block.form.fields.map((field: EnhancedField, index: number) => (
                    <FieldRenderer
                        key={`${block.form.title}-${field.name}-${index}`}
                        field={field}
                        blockKey={blockKey}
                        store={store}
                    />
                ))}
            {/*</ResponsiveFieldGrid>*/}
        </div>
    );
}