import { createFormStore } from "@/stores/formStore";

// Store propio con key de persistencia única (form-compraventa-registro),
// separado del store del formulario de solicitud.
export const useFormCompraventa = createFormStore('compraventa-registro')
