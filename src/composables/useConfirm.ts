// Confirmaciones dentro de la propia página, en lugar de las ventanas del navegador
// (confirm/prompt), que algunos navegadores bloquean sin avisar.
// Uso: if (await askConfirm('¿Seguro?')) hacerAlgo()
//      if (await askConfirm('Esto lo borra todo.', 'BORRAR')) borrar()  ← pide escribir la palabra
import { reactive } from 'vue'

export const confirmState = reactive({
  open: false,
  text: '',
  /** Si se indica, hay que escribir esta palabra para poder aceptar */
  word: '',
  typed: '',
  okLabel: 'Sí, seguir',
  resolve: null as null | ((ok: boolean) => void),
})

export function askConfirm(text: string, word = '', okLabel = 'Sí, seguir'): Promise<boolean> {
  // Si ya había una abierta, se cancela
  confirmState.resolve?.(false)
  return new Promise((resolve) => {
    Object.assign(confirmState, { open: true, text, word, typed: '', okLabel, resolve })
  })
}

export function answerConfirm(ok: boolean) {
  const resolve = confirmState.resolve
  Object.assign(confirmState, { open: false, resolve: null, typed: '' })
  resolve?.(ok)
}
