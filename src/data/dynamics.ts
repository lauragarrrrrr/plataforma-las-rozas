// ==========================================================
// DINÁMICAS DE LOS EQUIPOS · lo que ve cada equipo en su app, en orden.
// Textos de docs/metodologia.html (Qué hacemos · Para qué · Cómo).
// Cada dinámica: explicación, chat que les reta, cronómetro, «Pedir ayuda»
// y foto obligatoria al terminar el tiempo para poder seguir.
// ==========================================================
import type { PhaseId, PhotoKind } from './types'
import { AGENDA } from './agenda'

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
  /** Sin chat que les reta en esta dinámica (decidido por Laura para el titular) */
  noChat?: boolean
  /** Pantalla previa a la dinámica (por ejemplo, abrir el sobre de la mesa) */
  intro?: { title: string; text: string; button: string }
}

export const TEAM_DYNAMICS: TeamDynamic[] = [
  {
    id: 'titular', phase: 'foresight', title: 'Titular positivo', minutes: 15, noChat: true,
    what: 'Escribid vuestro **primer titular positivo** para Las Rozas Times 2040.',
    why: 'Pasar del futuro que queremos evitar **al que sí queremos**, con un punto de partida común.',
    how: [
      'Escribidlo en el **periódico A2**, como una noticia que **ya ha pasado en 2040**.',
      'Responded a **las tres preguntas**:\n· ¿Qué nos gustaría que se dijera de Las Rozas en 2040?\n· ¿Qué tendría que haber cambiado?\n· ¿Cómo sabríamos que lo hemos conseguido?',
      'Si os da tiempo, añadid una **entradilla** de una frase.',
    ],
    output: 'Un **titular por equipo**, en borrador.',
    photo: { kind: 'headline', label: 'el periódico con vuestro titular' },
    challenges: [
      '¿Qué nos gustaría que se dijera de Las Rozas en 2040?',
      '¿Qué tendría que haber cambiado para que eso fuera verdad?',
      '¿Cómo sabríamos que lo hemos conseguido? Pensad en algo que se pueda ver o contar.',
      'Leed vuestro titular en voz alta. ¿Suena a una noticia que ya ha pasado, o a un deseo?',
    ],
  },
  {
    id: 'senales', phase: 'research', title: 'Señales de cambio', minutes: 20, research: true,
    what: 'Buscad **3 o 4 señales de hoy** relacionadas con vuestro titular.',
    why: 'Comprobar qué parte de ese 2040 **ya está empezando a pasar**.',
    how: [
      'Pensad en cambios **sociales, económicos o tecnológicos** que ya se ven hoy.',
      'Escribid **cada señal en un post-it**.',
      'Marcad si cada una es un **dato contrastado** o una **hipótesis**.',
    ],
    output: '**Tres o cuatro señales** que dan contexto al equipo.',
    photo: { kind: 'signals', label: 'vuestras señales de cambio' },
    challenges: [
      '¿Qué está pasando hoy que apunta a vuestro titular?',
      '¿Esto es un dato contrastado o una hipótesis vuestra?',
      '¿De dónde sale esa señal? ¿Dónde lo habéis visto o leído?',
      '¿Hay alguna señal que vaya en contra de vuestro titular?',
    ],
  },
  {
    // Escaleta del 19/11/2026: «¿A quién queremos ayudar?» y «¿Cómo podríamos…?» son una sola dinámica
    id: 'a-quien', phase: 'research', title: '¿A quién queremos ayudar? y ¿Cómo podríamos…?', minutes: 25, research: true,
    what: 'Entended a vuestro **cliente** y convertid lo aprendido en **vuestro reto**.',
    why: 'Que la idea responda a una **necesidad real**.',
    how: [
      '**Cliente:** ¿a quién queremos ayudar? ¿En qué situación le pasa?',
      '**Problema:** ¿qué le duele hoy? ¿Qué le impide conseguir lo que quiere?',
      '**Beneficio:** ¿qué ganaría si se resolviera?',
      '**El reto:** escribidlo en una frase que empiece por **«¿Cómo podríamos…?»**, sin dar la solución por hecha.',
    ],
    output: 'Vuestro **cliente**, su **problema**, el **beneficio** y el **reto** del equipo.',
    photo: { kind: 'dossier', label: 'el expediente de investigación' },
    challenges: [
      '¿A quién queréis ayudar? Sed concretos: no «los jóvenes», sino qué jóvenes.',
      '¿En qué situación concreta le aparece la necesidad?',
      '¿Qué le duele hoy? ¿Qué le impide conseguir lo que quiere?',
      '¿Qué sabéis y qué estáis suponiendo sobre esa persona?',
      '¿Qué ganaría si se resolviera su problema?',
      'Escribid aquí vuestro reto, empezando por «¿Cómo podríamos…?».',
      '¿Vuestra pregunta ya está dando por hecha una solución?',
    ],
  },
  {
    // Escaleta del 19/11/2026: una sola dinámica de ideación, con el sobre de 4 cartas como apoyo
    id: 'ideacion', phase: 'ideation', title: 'Ideación libre · Nuestra iniciativa', minutes: 20,
    intro: {
      title: '¿Tenéis el sobre de la mesa?',
      text: 'Dentro hay 4 cartas. Usadlas si os atascáis: cambian las reglas para que salgan otras ideas.',
      button: '¡Sí, ya lo tenemos!',
    },
    what: 'Buscad **la solución** a vuestro reto y completad la ficha de **«Nuestra iniciativa»**.',
    why: 'Pasar del reto a **una propuesta concreta** que se pueda contar y poner en marcha.',
    how: [
      'Proponed ideas **libremente** y quedaos con **una**.',
      'Completad la ficha: **la solución**, su **nombre**, **tres palancas** para impulsarla y **el primer paso**.',
      '¿Os atascáis? Mirad las **cartas del sobre**.',
    ],
    output: '**Una iniciativa** por equipo, con nombre, tres palancas y primer paso.',
    photo: { kind: 'initiative', label: 'la ficha de «Nuestra iniciativa»' },
    challenges: [],
  },
  {
    id: 'portada', phase: 'pitch', title: 'Portada', minutes: 15,
    what: 'Transformad vuestra iniciativa en **la portada de Las Rozas Times 2040**. Primero, en papel.',
    why: 'Que cualquier persona entienda la idea en segundos.',
    how: [
      'Rellenad la portada en papel.',
      'Haced la foto y subidla, para que quede en vuestro expediente.',
      '**Subiréis al escenario** con vuestra portada en papel.',
      'Tendréis **solo 30 segundos** para contar vuestra idea: preparadlos.',
    ],
    output: 'Una portada por equipo, lista para presentar en 30 segundos.',
    photo: { kind: 'cover', label: 'vuestra portada en papel' },
    challenges: [
      '¿Qué titular tendrá vuestra portada en 2040?',
      '¿Qué cifra resume lo que habéis conseguido?',
      '¿Qué cambió en Las Rozas gracias a vuestra iniciativa?',
      '¿Cómo empezó?',
      'Contad vuestra idea en 30 segundos. ¿Qué frase no puede faltar?',
    ],
  },
]

// El chat (Unidad de Investigación) solo está en la fase de Investigación (decidido el 18/11/2026)
for (const d of TEAM_DYNAMICS) if (d.phase !== 'research') d.noChat = true

/**
 * Fichas individuales de «¿Cuál es la ciudad que no elegirías?».
 * Desde el 19/11/2026 se quedan en papel y NO se suben (ya no hay reto del digital owner).
 * Se mantiene solo para poder ver las fotos que se hubieran subido antes.
 */
export const PREMORTEM: TeamDynamic = {
  id: 'ciudad',
  phase: 'foresight',
  title: '¿Cuál es la ciudad que no elegirías?',
  minutes: 0,
  what: 'Subid la ficha individual de cada persona del equipo.',
  why: 'Para que vuestras ciudades de 2040 queden en el expediente del equipo.',
  how: [
    'Recoged la ficha de cada persona: el hecho de 2040 y sus causas inmediata, antecedente y fundamental.',
    'Haced una foto por ficha con el móvil, una detrás de otra.',
  ],
  output: 'Las fichas individuales del equipo.',
  photo: { kind: 'premortem', label: 'las fichas individuales' },
  challenges: [],
  noChat: true,
}

/** Todas las dinámicas a las que se puede subir foto, incluido el reto inicial */
export const ALL_DYNAMICS: TeamDynamic[] = [PREMORTEM, ...TEAM_DYNAMICS]

/**
 * ¿Hay que volver a la sala principal al terminar esta dinámica?
 * Sí cuando es la última de su fase: cada fase empieza todos juntos en la sala.
 */
export function backToRoomAfter(d: TeamDynamic): boolean {
  const i = TEAM_DYNAMICS.findIndex((x) => x.id === d.id)
  if (i < 0) return false
  const next = TEAM_DYNAMICS[i + 1]
  if (!next) return true
  // Manda la escaleta: se vuelve a la sala si entre esta dinámica y la siguiente
  // hay algún momento que no es de equipo (sala principal, pausa…)
  const a = AGENDA.findIndex((s) => s.id === d.id)
  const b = AGENDA.findIndex((s) => s.id === next.id)
  if (a < 0 || b < 0) return next.phase !== d.phase
  return AGENDA.slice(a + 1, b).some((s) => s.who !== 'Equipo')
}

/** «de el periódico» → «del periódico» */
export function photoOf(d: TeamDynamic): string {
  return d.photo.label.startsWith('el ') ? `del ${d.photo.label.slice(3)}` : `de ${d.photo.label}`
}

export const PHASE_OF_DYNAMIC = Object.fromEntries(TEAM_DYNAMICS.map((d) => [d.id, d.phase]))
