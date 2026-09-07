import { createFormStore } from '@/stores/formStore'

// Clave propia, distinta de la del formulario público: son el mismo formulario
// pero dos flujos, y compartir el almacén haría que lo escrito en uno apareciera
// en el otro.
export const useFormSolicitudEnlace = createFormStore('solicitud-enlace')
