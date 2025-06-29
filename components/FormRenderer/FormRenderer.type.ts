import { Step } from "@/types/FormField";

export interface FormRendererProps {
  steps: Step[];
  onSubmit: (data: Record<string, any>) => Promise<boolean>;
  submitting?: boolean;
}