// Configuración de la jornada. Cambiar aquí, no en las pantallas.
import type { AreaId, PhaseId } from './types'

/** Los 6 ámbitos, en el orden de la metodología. */
export const AREAS: Record<AreaId, string> = {
  city: 'Ciudad y calidad de vida',
  business: 'Desarrollo empresarial',
  education: 'Educación y futuro',
  talent: 'Atracción de talento',
  public: 'Administración pública',
  // ⚠️ Nombre pendiente de decidir (CLAUDE.md, apartado 13): puede pasar a llamarse «Mirada abierta».
  mobility: 'Movilidad y sostenibilidad',
}

/** Ámbito de cada equipo: dos equipos por ámbito, como en la metodología. Se revela a las 10:20. */
export const TEAM_AREAS: AreaId[] = [
  'city', 'city',
  'business', 'business',
  'education', 'education',
  'talent', 'talent',
  'public', 'public',
  'mobility', 'mobility',
]

export const PHASES: { id: PhaseId; number: string; name: string; minutes: number }[] = [
  { id: 'foresight', number: '01', name: 'Foresight', minutes: 55 },
  { id: 'research', number: '02', name: 'Investigación', minutes: 50 },
  { id: 'ideation', number: '03', name: 'Ideación', minutes: 60 },
  { id: 'pitch', number: '04', name: 'Pitch y cierre', minutes: 100 },
]

export const PHASE_STATE_LABEL = { locked: 'Bloqueada', active: 'En curso', done: 'Completada' } as const
