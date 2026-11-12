// ==========================================================
// DINÁMICAS DE LOS EQUIPOS · lo que ve cada equipo en su app, en orden.
// Textos de docs/metodologia.html (Qué hacemos · Para qué · Cómo).
// Cada dinámica: explicación, chat que les reta, cronómetro, «Pedir ayuda»
// y foto obligatoria al terminar el tiempo para poder seguir.
// ==========================================================
import type { PhaseId, PhotoKind } from './types'

export interface TeamDynamic {
  id: string
  phase: PhaseId
  title: string
  minutes: number
  /** Qué hacemos */
  what: string
  /** Para qué */
  why: string
  /** Cómo, en pasos cortos */
  how: string[]
  /** Qué debe salir de la dinámica */
  output: string
  /** Qué foto hay que subir al final */
  photo: { kind: PhotoKind; label: string }
  /** Preguntas del chat que les reta, una cada vez */
  challenges: string[]
  /** La dinámica forma parte de la Unidad de Investigación (fase 02) */
  research?: boolean
}

export const TEAM_DYNAMICS: TeamDynamic[] = [
  {
    id: 'titular', phase: 'foresight', title: 'Titular positivo', minutes: 20,
    what: 'Escribid vuestro primer titular positivo para Las Rozas Times 2040.',
    why: 'Pasar del futuro que queremos evitar al que sí queremos construir, con un punto de partida común.',
    how: [
      'Escribidlo en el periódico A2, como una noticia que ya ha pasado en 2040.',
      'Responded a las tres preguntas: ¿Qué nos gustaría que se dijera de Las Rozas en 2040? ¿Qué tendría que haber cambiado? ¿Cómo sabríamos que lo hemos conseguido?',
      'Si os da tiempo, añadid una entradilla de una frase.',
    ],
    output: 'Un titular por equipo, en borrador.',
    photo: { kind: 'headline', label: 'el periódico con vuestro titular' },
    challenges: [
      '¿Qué nos gustaría que se dijera de Las Rozas en 2040?',
      '¿Qué tendría que haber cambiado para que eso fuera verdad?',
      '¿Cómo sabríamos que lo hemos conseguido? Pensad en algo que se pueda ver o contar.',
      'Leed vuestro titular en voz alta. ¿Suena a una noticia que ya ha pasado, o a un deseo?',
    ],
  },
  {
    id: 'senales', phase: 'research', title: 'Señales de cambio', minutes: 10, research: true,
    what: 'Buscad unas pocas señales de hoy relacionadas con vuestro titular.',
    why: 'Comprobar qué parte de ese 2040 ya está empezando a pasar.',
    how: [
      'Pensad en cambios sociales, económicos o tecnológicos que ya se ven hoy.',
      'Escribid cada señal en un post-it.',
      'Separad los hechos contrastados de las hipótesis.',
    ],
    output: 'Tres o cuatro señales que dan contexto al equipo.',
    photo: { kind: 'signals', label: 'vuestras señales de cambio' },
    challenges: [
      '¿Qué está pasando hoy que apunta a vuestro titular?',
      '¿Esto es un dato contrastado o una hipótesis vuestra?',
      '¿De dónde sale esa señal? ¿Dónde lo habéis visto o leído?',
      '¿Hay alguna señal que vaya en contra de vuestro titular?',
    ],
  },
  {
    id: 'a-quien', phase: 'research', title: '¿A quién queremos ayudar?', minutes: 30, research: true,
    what: 'Entended al colectivo al que queréis ayudar con cinco preguntas sencillas.',
    why: 'Que la idea responda a una necesidad real.',
    how: [
      '¿A quién queremos ayudar?',
      '¿Cuándo le pasa? En qué situación aparece la necesidad.',
      '¿Qué intenta conseguir?',
      '¿Qué le impide hacerlo hoy?',
      '¿Cómo lo resuelve hoy y por qué no le vale?',
    ],
    output: 'El expediente del colectivo completo.',
    photo: { kind: 'dossier', label: 'el expediente de investigación' },
    challenges: [
      '¿A quién queréis ayudar? Sed concretos: no «los jóvenes», sino qué jóvenes.',
      '¿Qué sabemos y qué estamos suponiendo sobre ese colectivo?',
      '¿En qué momento concreto le aparece la necesidad?',
      '¿Qué le impide hoy conseguir lo que quiere?',
      '¿Cómo lo resuelve hoy? ¿Por qué no le vale?',
    ],
  },
  {
    id: 'como-podriamos', phase: 'research', title: '¿Cómo podríamos…?', minutes: 10, research: true,
    what: 'Convertid lo aprendido en una pregunta.',
    why: 'Que sea el punto de partida para idear.',
    how: [
      'Escribid vuestro reto en una frase que empiece por «¿Cómo podríamos…?».',
      'Centradla en una necesidad concreta.',
      'No deis la solución por hecha.',
    ],
    output: 'El reto del equipo.',
    photo: { kind: 'challenge', label: 'vuestro reto «¿Cómo podríamos…?»' },
    challenges: [
      'Escribid aquí vuestro reto, empezando por «¿Cómo podríamos…?».',
      '¿Vuestra pregunta ya está dando por hecha una solución?',
      '¿Se entiende a quién ayuda y qué necesidad resuelve?',
    ],
  },
  {
    id: 'cartas', phase: 'ideation', title: 'Cartas de restricciones y de personajes', minutes: 20,
    what: 'Robad cartas que cambian las reglas de vuestro reto y mirad la idea con los ojos de otra persona.',
    why: 'Explorar soluciones diferentes antes de quedaros con una, y pensar en quien hoy queda fuera.',
    how: [
      'Restricciones: sin pantallas, con un presupuesto mínimo, multiplicando su impacto o con una primera solución en 24 horas.',
      'Personajes: una persona mayor, un adolescente, una persona emprendedora, alguien con movilidad reducida, alguien recién llegado…',
      'Generad varias ideas con cada carta.',
    ],
    output: 'Varias alternativas por equipo, pensadas para más personas.',
    photo: { kind: 'ideas', label: 'las ideas que han salido con las cartas' },
    challenges: [
      '¿Qué carta habéis robado? ¿Qué idea os sale con ella?',
      '¿Y si tuvierais que ponerla en marcha en 24 horas?',
      '¿Cómo la vería una persona mayor, o alguien recién llegado?',
    ],
  },
  {
    id: 'ideacion', phase: 'ideation', title: 'Ideación libre', minutes: 10,
    what: 'Seguid generando ideas libremente, a partir de lo que han abierto las cartas.',
    why: 'Ampliar las posibilidades, sin las restricciones de las cartas.',
    how: [
      'Proponed, combinad y evolucionad ideas en equipo.',
      'Las cartas quedan como apoyo si necesitáis inspiración.',
    ],
    output: 'Un conjunto de ideas para seleccionar una propuesta.',
    photo: { kind: 'ideas', label: 'vuestras ideas' },
    challenges: [
      '¿Qué dos ideas podríais combinar en una?',
      '¿Cuál responde mejor a vuestro reto «¿Cómo podríamos…?»?',
    ],
  },
  {
    id: 'ficha', phase: 'ideation', title: 'Ficha de iniciativa', minutes: 30,
    what: 'Elegid una única propuesta y desarrolladla en la ficha.',
    why: 'Poder compartirla y compararla. No hace falta un modelo de negocio.',
    how: [
      'Seis campos: nombre, a quién ayudamos, problema, beneficio, solución y tres palancas para impulsarla.',
      'Primero, a quién ayudamos y su problema.',
      'Después, lo que obtiene (beneficio).',
      'Al final, lo que construimos (solución).',
    ],
    output: 'Una iniciativa por equipo.',
    photo: { kind: 'initiative', label: 'la ficha de iniciativa' },
    challenges: [
      '¿A quién ayuda vuestra iniciativa y qué problema le resuelve?',
      '¿Qué obtiene esa persona? Contadlo sin hablar todavía de la solución.',
      '¿Qué tres palancas harían falta para impulsarla?',
      '¿Cómo se llama vuestra iniciativa?',
    ],
  },
  {
    id: 'portada', phase: 'pitch', title: 'Portada', minutes: 15,
    what: 'Transformad vuestra iniciativa en la portada de Las Rozas Times 2040.',
    why: 'Que cualquier persona entienda la idea en segundos.',
    how: [
      'La portada estará en pantalla detrás de vosotros en el speed pitch.',
      'Preparad cómo contar vuestra idea en 30 segundos.',
    ],
    output: 'Una portada por equipo, lista para presentar.',
    photo: { kind: 'cover', label: 'vuestra portada' },
    challenges: [
      '¿Qué titular tendrá vuestra portada en 2040?',
      '¿Qué cifra resume lo que habéis conseguido?',
      '¿Qué cambió en Las Rozas gracias a vuestra iniciativa?',
      '¿Cómo empezó?',
      'Contad vuestra idea en 30 segundos. ¿Qué frase no puede faltar?',
    ],
  },
]

/** «de el periódico» → «del periódico» */
export function photoOf(d: TeamDynamic): string {
  return d.photo.label.startsWith('el ') ? `del ${d.photo.label.slice(3)}` : `de ${d.photo.label}`
}

export const PHASE_OF_DYNAMIC = Object.fromEntries(TEAM_DYNAMICS.map((d) => [d.id, d.phase]))
