import { FormStore } from "@/stores/formStore";
import { Field } from "@/types/FormField";
import { StoreApi, UseBoundStore } from "zustand";

export type FieldRendererProps = {
    field: Field;
    blockKey: any;

    store: UseBoundStore<StoreApi<FormStore>>;
};