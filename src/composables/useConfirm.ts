// Confirmaciones dentro de la propia página, en lugar de las ventanas del navegador
// (confirm/prompt), que algunos navegadores bloquean sin avisar.
// Uso: if (await askConfirm('¿Seguro?')) hacerAlgo()
//      if (await askConfirm('Esto lo borra todo.', 'BORRAR')) borrar()  ← pide escribir la palabra
//      const n = await askChoice('¿Qué hacemos?', ['Opción A', 'Opción B'])  ← -1 si cancelan
import { reactive } from 'vue'

export const confirmState = reactive({
  open: false,
  text: '',
  /** Si se indica, hay que escribir esta palabra para poder aceptar */
  word: '',
  typed: '',
  okLabel: 'Sí, seguir',
  /** Si hay varias opciones, un botón por opción (el último es el principal) */
  choices: [] as string[],
  resolve: null as null | ((answer: number) => void),
})

function ask(text: string, opts: Partial<{ word: string; okLabel: string; choices: string[] }>): Promise<number> {
  // Si ya había una abierta, se cancela
  confirmState.resolve?.(-1)
  return new Promise((resolve) => {
    Object.assign(confirmState, {
      open: true, text, typed: '', word: opts.word ?? '', okLabel: opts.okLabel ?? 'Sí, seguir', choices: opts.choices ?? [], resolve,
    })
  })
}

export async function askConfirm(text: string, word = '', okLabel = 'Sí, seguir'): Promise<boolean> {
  return (await ask(text, { word, okLabel })) === 0
}

/** Varias opciones: devuelve el número de la elegida (0, 1…) o -1 si cancelan */
export function askChoice(text: string, choices: string[]): Promise<number> {
  return ask(text, { choices })
}

/** answer: número de la opción elegida (0 = aceptar) o -1 = cancelar */
export function answerConfirm(answer: number | boolean) {
  const resolve = confirmState.resolve
  Object.assign(confirmState, { open: false, resolve: null, typed: '', choices: [] })
  resolve?.(typeof answer === 'boolean' ? (answer ? 0 : -1) : answer)
}
