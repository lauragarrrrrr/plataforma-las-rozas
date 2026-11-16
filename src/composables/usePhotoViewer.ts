// Ver una foto en grande dentro de la página.
// No se abre en otra pestaña porque los navegadores bloquean las fotos guardadas
// en el propio navegador (modo sin Supabase).
import { reactive } from 'vue'

export const photoState = reactive({ url: '', caption: '' })

export function openPhoto(url: string, caption = '') {
  Object.assign(photoState, { url, caption })
}

export function closePhoto() {
  Object.assign(photoState, { url: '', caption: '' })
}
