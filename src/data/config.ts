// Configuración de la jornada. Cambiar aquí, no en las pantallas.
import type { AreaId, PhaseId } from './types'

/** Día del evento: ese día la escaleta sigue la hora real («Seguir el horario» en el panel) */
export const EVENT_DATE = '2026-11-21'

/** Equipo facilitador que recibe avisos en el móvil (/avisos). Solo el nombre de pila. */
export const FACILITATORS = ['Andrea', 'Juanjo', 'Irene', 'Marina', 'Laura']

/** Dirección de la web pública (Cloudflare). Los QR para los participantes llevan siempre aquí. */
export const PUBLIC_URL = 'https://plataforma-las-rozas.hackathon-las-rozas-2040.workers.dev'

/** Los 6 ámbitos, en el orden de los equipos (metodología v3 y presentación, 16/11/2026). */
export const AREAS: Record<AreaId, string> = {
  city: 'Ciudad + calidad de vida',
  business: 'Desarrollo empresarial',
  talent: 'Atracción de talento',
  education: 'Educación + futuro',
  public: 'Administración Pública',
  open: 'Mirada abierta',
}

/** La pregunta de cada ámbito (metodología v3, «Transición · Ámbitos, equipos y salas») */
export const AREA_QUESTIONS: Record<AreaId, string> = {
  city: '¿Cómo puede la innovación mejorar la vida de las personas y hacer de Las Rozas una ciudad cada vez más atractiva para vivir y trabajar?',
  business: '¿Cómo hacemos de Las Rozas un lugar donde empresas y emprendedores quieran instalarse, crecer y colaborar?',
  talent: '¿Cómo hacemos de Las Rozas un lugar capaz de atraer, conectar y generar oportunidades para el talento?',
  education: '¿Cómo preparamos a nuestra población para las capacidades y oportunidades que traerá el futuro?',
  public: '¿Qué papel puede desempeñar la Administración Pública en el impulso y la transformación de la ciudad?',
  open: '¿Qué oportunidades para Las Rozas 2040 no estamos contemplando todavía?',
}

/**
 * Ámbito de cada equipo, de la A a la L: dos equipos por ámbito (metodología v3).
 * Manda sobre lo guardado: al cargar los datos, cada equipo toma su ámbito de aquí.
 */
export const TEAM_AREAS: AreaId[] = [
  'city', 'city',           // A, B
  'business', 'business',   // C, D
  'talent', 'talent',       // E, F
  'education', 'education', // G, H
  'public', 'public',       // I, J
  'open', 'open',           // K, L
]

export const PHASES: { id: PhaseId; number: string; name: string; minutes: number }[] = [
  { id: 'foresight', number: '01', name: 'Foresight', minutes: 55 },
  { id: 'research', number: '02', name: 'Investigación', minutes: 50 },
  { id: 'ideation', number: '03', name: 'Ideación', minutes: 60 },
  { id: 'pitch', number: '04', name: 'Pitch y cierre', minutes: 100 },
]

export const PHASE_STATE_LABEL = { locked: 'Bloqueada', active: 'En curso', done: 'Completada' } as const
