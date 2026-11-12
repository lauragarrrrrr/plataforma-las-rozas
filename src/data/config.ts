// Configuración de la jornada. Cambiar aquí, no en las pantallas.
import type { AreaId, PhaseId } from './types'

/** Los 6 ámbitos, en el orden de los equipos (decidido por Laura y Marina el 12/11/2026). */
export const AREAS: Record<AreaId, string> = {
  open: 'Mirada abierta',
  city: 'Ciudad y calidad de vida',
  business: 'Desarrollo empresarial',
  talent: 'Atracción de talento',
  education: 'Educación y futuro',
  public: 'Administración pública',
}

/** Ámbito de cada equipo, de la A a la L: dos equipos por ámbito. Se revela a las 10:20. */
export const TEAM_AREAS: AreaId[] = [
  'open', 'open',           // A, B
  'city', 'city',           // C, D
  'business', 'business',   // E, F
  'talent', 'talent',       // G, H
  'education', 'education', // I, J
  'public', 'public',       // K, L
]

export const PHASES: { id: PhaseId; number: string; name: string; minutes: number }[] = [
  { id: 'foresight', number: '01', name: 'Foresight', minutes: 55 },
  { id: 'research', number: '02', name: 'Investigación', minutes: 50 },
  { id: 'ideation', number: '03', name: 'Ideación', minutes: 60 },
  { id: 'pitch', number: '04', name: 'Pitch y cierre', minutes: 100 },
]

export const PHASE_STATE_LABEL = { locked: 'Bloqueada', active: 'En curso', done: 'Completada' } as const
