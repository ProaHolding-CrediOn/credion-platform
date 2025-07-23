import { FormStore } from "@/stores/formStore";
import { EnhancedBlock } from "@/types/FormField";
import { StoreApi, UseBoundStore } from "zustand";

export interface BlockRendererProps {
  block: EnhancedBlock;
  blockKey: any;
  store: UseBoundStore<StoreApi<FormStore>>;
}