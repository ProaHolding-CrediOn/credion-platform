import { EnhancedBlock } from "@/types/FormField";

export interface BlockRendererProps {
  block: EnhancedBlock;
  formData: Record<string, any>;
  blockKey: string;
  handleInputChange: (blockKey: string, field: string, value: any) => void;
  errors: Record<string, string>;
}