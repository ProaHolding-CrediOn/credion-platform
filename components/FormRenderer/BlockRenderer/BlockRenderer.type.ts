import { EnhancedBlock } from "@/types/FormField";

export interface BlockRendererProps {
  block: EnhancedBlock;
  formData: Record<string, any>;
  blockKey: any;
  handleInputChange: (blockKey: string, field: string, label: string, value: any) => void;
  onBlockValidation?: (isValid: boolean) => void;
}