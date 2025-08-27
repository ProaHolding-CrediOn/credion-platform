import { EnhancedField, FormBlock } from "@/types/FormField";
import FieldRenderer from "../FieldRenderer/FieldRenderer";
import { BlockRendererProps } from "./BlockRenderer.type";
import { Label } from "@/components/ui/label";
import TextViewer from "@/components/TextViewer/TextViewer";

export default function FormBlockRenderer({ block, blockKey, store }: BlockRendererProps) {
    block = block as FormBlock

    return (
        <div key={`formblock`} className="space-y-4">
            {block.introContent && <Label className="text-base text-foreground font-light">
                <TextViewer text={block.introContent} />
            </Label>}
            {block.form && Array.isArray(block.form.fields) && block.form.fields.map((field: EnhancedField, index: number) => (
                <FieldRenderer
                    key={`${block.form.title}-${field.name}-${index}`}
                    field={field}
                    blockKey={blockKey}
                    store={store}
                />
            ))}
        </div>
    );
}