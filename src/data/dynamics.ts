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
  /** Ejemplo ya rellenado en papel, para ver cómo queda (imagen en public/) */
  example?: { image: string; caption: string }
}

export const TEAM_DYNAMICS: TeamDynamic[] = [
  {
    // Presentación v5 · diapositiva 15 · Expediente de futuro 02 (Las Rozas Times)
    id: 'titular', phase: 'foresight', title: 'Titular positivo', minutes: 15, noChat: true,
    what: 'Escribid en positivo **un titular de periódico**: **concreto, con un dato y que sorprenda**.',
    why: 'Pasar del futuro que queremos evitar **al que sí queremos**, con un punto de partida común.',
    how: [
      'Cada idea, **en un post-it**, sobre la plantilla de **Las Rozas Times**.',
      'Afinad el titular con **las tres preguntas**:\n· ¿Qué nos gustaría que se dijera de Las Rozas en 2040?\n· ¿Qué tendría que haber cambiado?\n· ¿Cómo sabríamos que lo hemos conseguido?',
      'Los **2 últimos minutos**, haced la foto y subidla.',
    ],
    output: '**Vuestro titular** y las tres preguntas que lo afinan, en la plantilla.',
    photo: { kind: 'headline', label: 'el periódico con vuestro titular' },
    challenges: [],
  },
  {
    // Diapositiva 20 · Expediente de futuro 03
    id: 'senales', phase: 'research', title: 'Señales de cambio', minutes: 20, research: true,
    what: 'Buscad **cuatro cosas que ya están ocurriendo** y apuntan a vuestro titular.',
    why: 'Comprobar qué parte de ese 2040 **ya está empezando a pasar**.',
    how: [
      'Buscad en **tendencias, datos, noticias, tecnología, normativa, hábitos de consumo y comportamientos**.',
      'Cada señal, con **título, descripción y fuentes**. En post-its.',
      'Marcad si cada señal es **fuente** o **hipótesis**.',
    ],
    output: '**Las cuatro señales** con título, descripción y fuentes.',
    photo: { kind: 'signals', label: 'vuestras señales de cambio' },
    challenges: [
      '¿Qué está pasando hoy que apunta a vuestro titular?',
      'Si fuera una noticia de hoy, ¿qué título le pondríais a esa señal?',
      '¿Qué está pasando exactamente? Contadlo en una frase.',
      '¿Dónde lo habéis visto o leído?',
      '¿Eso es una fuente o una hipótesis vuestra?',
      '¿Hay alguna señal que vaya en contra de vuestro titular?',
    ],
  },
  {
    // Diapositivas 21-23 · Expediente de futuro 04 (cliente, problema, beneficio y reto)
    id: 'a-quien', phase: 'research', title: '¿A quién queremos ayudar?', minutes: 25, research: true,
    what: 'Bajad del titular a **una persona concreta**: quién es, **qué le duele hoy** y **qué ganaría**.',
    why: 'Que vuestra idea responda a una **necesidad real**.',
    how: [
      '**01 Cliente:** una persona o colectivo concreto, no «los vecinos» en general. ¿En qué situación le pasa?',
      '**02 Problema:** qué le impide hoy conseguir lo que quiere, cómo lo resuelve ahora y por qué no le vale.',
      '**03 Beneficio:** qué intenta conseguir y cómo cambiaría su día a día si se resolviera.',
      '**Vuestro reto:** «¿Cómo podríamos ayudar a **[quién]** a **[conseguir qué]** cuando **[situación]**?», sin dar la solución por hecha.',
    ],
    output: 'El **expediente** con vuestro reto **«¿Cómo podríamos…?»**.',
    photo: { kind: 'dossier', label: 'el expediente de investigación' },
    challenges: [
      '¿A quién queréis ayudar? Sed concretos: una persona o un colectivo, no «los vecinos» en general.',
      '¿En qué situación le pasa? ¿Cuándo, dónde, qué lo desencadena?',
      '¿Qué le impide hoy conseguir lo que quiere?',
      '¿Cómo lo resuelve hoy esa persona, aunque sea mal?',
      '¿Eso lo sabéis o lo estáis suponiendo?',
      '¿Quién más vive este problema y no lo habéis nombrado?',
      '¿Qué ganaría si se resolviera? ¿Cómo cambiaría su día a día?',
      'Escribid vuestro reto: «¿Cómo podríamos ayudar a… a… cuando…?».',
      '¿Vuestro reto ya está dando por hecha una solución?',
    ],
  },
  {
    // Diapositivas 27-29 · Expediente de futuro 05 «Nuestra iniciativa» y la baraja
    id: 'ideacion', phase: 'ideation', title: 'Nuestra iniciativa', minutes: 20,
    intro: {
      title: '¿Tenéis el sobre de la mesa?',
      text: 'Dentro hay 4 cartas. Usadlas si os atascáis: cambian las reglas para que salgan otras ideas.',
      button: '¡Sí, ya lo tenemos!',
    },
    what: '**Ideación libre**: elegid **la idea con más fuerza** y rellenad la ficha de **«Nuestra iniciativa»**.',
    why: 'De vuestro reto a **una idea que lo cambie todo**.',
    how: [
      '**01 Solución:** qué hacéis exactamente. **Concreta y tangible**: que se pueda ver, usar o visitar.',
      '**02 Tres palancas:** quién y qué lo hace posible.',
      '**03 Primer paso:** cómo empezaríais mañana: un piloto pequeño, dónde y con quién.',
      'Al final, **el nombre de la iniciativa**, arriba.',
      '¿Os atascáis? Usad **las cartas del sobre**.',
    ],
    output: 'La ficha completa, con **el nombre de la iniciativa**.',
    photo: { kind: 'initiative', label: 'la ficha de «Nuestra iniciativa»' },
    challenges: [],
  },
  {
    // Diapositivas 33-35 · Portada de Las Rozas Times
    id: 'portada', phase: 'pitch', title: 'Portada', minutes: 25,
    what: 'Cread **vuestra portada en papel** a partir de vuestra iniciativa. Es la que presentaréis en el speed pitch.',
    why: 'Que cualquier persona entienda vuestra idea **en segundos**.',
    how: [
      'Usad lo que ya tenéis: **la entradilla, las tres palancas y el primer paso** salen de «Nuestra iniciativa»; **el reto de partida**, de vuestro expediente; y **«Del titular de la mañana»**, de vuestro primer titular.',
      'Escribid lo nuevo: **el titular de portada** (la noticia de 2040 si vuestra iniciativa funciona) y **una cifra**.',
      'Haced la foto y subidla: **la queremos en papel y en digital**.',
      '**Subiréis al escenario** con vuestra portada: **30 segundos** para contarla y **1:30** de preguntas del jurado.',
    ],
    output: 'La portada terminada y su foto subida.',
    example: { image: '/ejemplos/portada-ejemplo.jpg', caption: 'Una portada ya rellenada: «La Plaza Vuelve»' },
    photo: { kind: 'cover', label: 'vuestra portada en papel' },
    challenges: [],
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
