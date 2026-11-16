// Configuración de la jornada. Cambiar aquí, no en las pantallas.
import type { AreaId, PhaseId } from './types'

/** Los 6 ámbitos, en el orden de los equipos (metodología v3 y presentación, 16/11/2026). */
export const AREAS: Record<AreaId, string> = {
  city: 'Ciudad + calidad de vida',
  business: 'Desarrollo empresarial',
  talent: 'Atracción de talento',
  education: 'Educación + futuro',
  public: 'Administración Pública',
  open: 'Mirada abierta',
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
