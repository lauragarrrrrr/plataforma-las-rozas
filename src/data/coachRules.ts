// ==========================================================
// REGLAS DEL CHAT QUE LES RETA (sin IA)
// El chat no entiende de verdad lo que escriben, pero reacciona a lo más habitual:
// piden ayuda, preguntan algo, responden muy corto, no saben, o hablan de datos e hipótesis.
// Solo las respuestas «de verdad» hacen avanzar a la siguiente pregunta.
// Para cambiar textos o añadir reglas, todo está aquí.
// ==========================================================
import type { TeamDynamic } from './dynamics'
import { ejemploPara } from './examples'

export type ReplyKind = 'help' | 'example' | 'question' | 'short' | 'unsure' | 'answer'

// Piden un ejemplo («dame un ejemplo», «¿algún ejemplo?», «por ejemplo qué»…)
const EXAMPLE = /\b(ejemplo|ejemplos|ejemplito|algun caso|un caso|otra carta|una carta|dame una idea|danos una idea)\b/

/** Sin tildes y en minúsculas, para comparar */
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// Frases concretas, para no confundir «personas que necesitan ayuda» con pedir ayuda
const HELP = /(^ayuda\b|^socorro|necesitamos ayuda|ayudanos|ayudame|no entiendo|no entendemos|estamos perdid|que (tengo|tenemos|hay) que hacer|no funciona)/
// Solo en mensajes cortos, para no confundir «no se puede aparcar» con no saber
const UNSURE = /\b(no (lo )?se|no sabemos|ni idea|no se nos ocurre(n)?( nada)?|no tenemos claro|nose)\b/
const QUESTION_START = /^(que|como|cual|cuales|por que|donde|quien|quienes|cuando|cuanto|puedes|podrias|me dices|nos dices|sabes)\b/
// Avisan de que preguntan algo, aunque no lleve interrogación
const QUESTION_ABOUT = /\b((es|tenemos|te hacemos|te hago|una) (una )?pregunta|tenemos (una )?duda|una duda)\b/

/** Qué tipo de mensaje ha escrito el equipo */
export function classify(text: string): ReplyKind {
  const t = plain(text)
  const words = t.split(/\s+/).filter(Boolean)
  if (HELP.test(t)) return 'help'
  if (EXAMPLE.test(t) && words.length <= 10) return 'example'
  if (UNSURE.test(t) && words.length <= 6) return 'unsure'
  if (t.endsWith('?') || t.startsWith('¿') || QUESTION_START.test(t) || QUESTION_ABOUT.test(t)) return 'question'
  if (words.length < 3) return 'short'
  return 'answer'
}

/** Solo las respuestas de verdad cuentan para pasar a la siguiente pregunta */
export const advances = (text: string) => classify(text) === 'answer'

// Frases breves y variadas antes de la siguiente pregunta
const ACKS = ['Vale.', 'Interesante.', 'Buen punto.', 'Anotado.', 'Bien.', 'Eso da que pensar.', 'Seguimos.']

const FACT = /\b(dato|datos|estudio|informe|encuesta|noticia|segun|estadistica|ine|cifra|porcentaje|articulo|fuente)\b|%|\d{2,}/
const HYPOTHESIS = /\b(creemos|creo|pensamos|suponemos|supongo|imaginamos|quiza|quizas|igual|seguramente|probablemente|nos parece|intuimos|hipotesis)\b/

/** Comentario breve según lo que dicen, solo en la Unidad de Investigación */
function researchNote(text: string): string | null {
  const t = plain(text)
  if (HYPOTHESIS.test(t)) return 'Eso suena a hipótesis. Está bien, pero marcadla como tal en el papel.'
  if (FACT.test(t)) return 'Eso parece un dato. Apuntad de dónde sale.'
  return null
}

const SHORT = [
  '¿Podéis concretar un poco más? Con una frase completa os ayudo mejor.',
  'Contadme algo más: ¿qué queréis decir exactamente?',
  'Un poco más de detalle, por favor. ¿Por qué lo decís?',
]

const QUESTION = [
  'Buena pregunta, pero aquí las preguntas las hago yo 😉 ¿Qué pensáis vosotros?',
  'No os voy a dar la respuesta: el trabajo es vuestro. ¿Qué diríais vosotros?',
  'Si tenéis una duda de cómo funciona la dinámica, pulsad «Pedir ayuda» y se acerca alguien del equipo facilitador. Mientras, ¿qué diríais vosotros?',
]

const CLOSING = [
  'Apuntado. Seguid trabajando en el papel y, cuando acabe el tiempo, subid la foto.',
  'Bien. Revisad que todo esté en el papel antes de que acabe el tiempo.',
  'Tenéis buen material. Si os atascáis, pulsad «Pedir ayuda».',
]

const pick = (list: string[], n: number) => list[n % list.length]

/**
 * La respuesta del chat a lo que acaba de escribir el equipo.
 * `answered`: cuántas respuestas de verdad llevan en esta dinámica (incluida esta, si lo es).
 * `turn`: número de mensajes del equipo en esta dinámica, para variar las frases.
 */
export function coachReply(dynamic: TeamDynamic, text: string, answered: number, turn: number): string {
  const kind = classify(text)
  if (kind === 'help') {
    return 'Si estáis atascados, pulsad «Pedir ayuda» (abajo a la derecha) y vendrá alguien del equipo facilitador. Mientras, releed la explicación de la izquierda.'
  }
  if (kind === 'example') {
    const ej = ejemploPara(dynamic.id, turn)
    if (!ej) return `Aquí no tengo ejemplos: lo importante es lo que penséis vosotros. Una pista: ${dynamic.what.charAt(0).toLowerCase()}${dynamic.what.slice(1)}`
    return dynamic.id === 'cartas'
      ? `${ej} ¿Qué idea os sale con ella?`
      : `Un ejemplo: ${ej} No lo copiéis: ¿cómo sería el vuestro?`
  }
  if (kind === 'unsure') {
    const tip = dynamic.how[turn % dynamic.how.length]
    return `Es normal. Una pista: ${tip.charAt(0).toLowerCase()}${tip.slice(1)} ¿Qué se os ocurre?`
  }
  if (kind === 'question') {
    // La primera vez, una pista de la explicación de la dinámica; después, se la devolvemos
    const asked = turn === 0 || !/pregunta|duda/.test(plain(text))
    return asked && turn < 2
      ? `Buena pregunta. Una pista: ${dynamic.what.charAt(0).toLowerCase()}${dynamic.what.slice(1)} ¿Qué pensáis vosotros?`
      : pick(QUESTION, turn)
  }
  if (kind === 'short') return pick(SHORT, turn)

  const note = dynamic.research ? researchNote(text) : null
  const next = dynamic.challenges[answered]
  if (!next) return note ? `${note} ${pick(CLOSING, turn)}` : pick(CLOSING, turn)
  return `${note ?? pick(ACKS, turn)} ${next}`
}
