import { FormStore } from "@/stores/formStore";
import { Step } from "@/types/FormField";
import { StoreApi, UseBoundStore } from "zustand";

export interface FormRendererProps {
  steps: Step[];
  onSubmit: (data: Record<string, any>) => Promise<boolean>;
  submitting?: boolean;

  store: UseBoundStore<StoreApi<FormStore>>;
}