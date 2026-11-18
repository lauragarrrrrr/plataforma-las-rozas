// Textos de las dinámicas con un poco de formato, escrito a mano en src/data/dynamics.ts:
//   **palabras**  → negrita
//   salto de línea («\n») → línea nueva
// Todo lo demás se muestra tal cual (se escapa el HTML).
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function rich(text: string): string {
  return escape(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')
}

/** El mismo texto sin marcas, para el chat */
export function plainText(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\n/g, ' ')
}
