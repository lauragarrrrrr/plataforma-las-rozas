// Modelo de datos de la plataforma (CLAUDE.md, apartado 8).
// Nombres en inglés en el código; los textos de pantalla van en español.

export type AreaId = 'open' | 'city' | 'business' | 'talent' | 'education' | 'public'

export type PhaseId = 'foresight' | 'research' | 'ideation' | 'pitch'
export type PhaseState = 'locked' | 'active' | 'done'

export interface Team { id: string; number: number; name: string; area: AreaId; phases: Record<PhaseId, PhaseState> }
export interface Headline { teamId: string; headline: string; lead?: string; said: string; changed: string; measure: string }
export interface Signal { id: string; teamId: string; title: string; description: string; source?: string; kind: 'fact' | 'hypothesis' }
export interface Dossier { teamId: string; who: string; when: string; goal: string; barrier: string; currentWorkaround: string; challenge: string }
export interface Idea { id: string; teamId: string; text: string; card?: string }
export interface Initiative { teamId: string; name: string; whoWeHelp: string; problem: string; benefit: string; solution: string; levers: [string, string, string] }
export interface Cover { teamId: string; headline: string; keyFigure?: string; keyFigureLabel?: string; whatChanged: string; howItStarted: string }
export type PhotoKind = 'premortem' | 'headline' | 'signals' | 'dossier' | 'challenge' | 'ideas' | 'initiative' | 'cover' | 'other'
export interface Photo { id: string; teamId: string; kind: PhotoKind; dynamicId?: string; url: string; createdAt: string }
export interface Alert { id: string; target: 'all' | string; title: string; body: string; minutes?: number; launchedAt?: string }
export interface VoteCode { code: string; used: boolean; teamId?: string }
export interface Vote { code: string; teamIds: [string, string, string]; createdAt: string }
export interface Assessment { teamId: string; scores: Record<string, number>; notes?: string }
export interface RoomState {
  mode: 'welcome' | 'phase' | 'alert' | 'pitch' | 'covers' | 'results'
  /** Paso de la presentación de la sala (índice en AGENDA) */
  step: number
  timerEndsAt?: string
  currentTeamId?: string
  alertId?: string
  resultsApproved: boolean
}

/** Estado general de la jornada, que controla el equipo facilitador. */
export interface EventState {
  /** Los ámbitos se revelan a todos los equipos a la vez (10:20) */
  areasRevealed: boolean
  /** Hasta qué dinámica (índice en TEAM_DYNAMICS) pueden llegar los equipos. -1: ninguna */
  openDynamic?: number
  /** Cuándo se abrió cada dinámica para todos: de aquí sale el cronómetro */
  openedAt?: Record<string, string>
  /** La votación está abierta (la abre el equipo facilitador al terminar el speed pitch) */
  votingOpen?: boolean
}

/** Quiénes forman el equipo (solo nombre de pila) y quién lleva el ordenador. */
export interface TeamSetup {
  teamId: string
  members: string[]
  digitalOwner: string
  /** El digital owner ha terminado el reto de subir las fichas individuales */
  premortemDone?: boolean
}

/**
 * En qué dinámica va el equipo y cuándo empezó cada una.
 * Solo lo escribe el ordenador del equipo. Una dinámica está hecha cuando
 * hay una foto con su `dynamicId` (la foto puede llegar desde el móvil).
 */
export interface TeamProgress {
  teamId: string
  /** Índice en TEAM_DYNAMICS de la dinámica actual */
  current: number
  started: Record<string, string>
  /**
   * Excepción para este equipo, puesta desde el panel: hasta qué dinámica puede llegar.
   * Sin valor, sigue al grupo (EventState.openDynamic).
   */
  limit?: number
  /** Cuándo se le abrió cada dinámica a este equipo por excepción */
  openedAt?: Record<string, string>
  /** Pantallas previas ya vistas (por ejemplo, el sobre de las cartas) */
  introSeen?: Record<string, boolean>
}

/** Mensaje del chat que les reta. `from: 'coach'` son las preguntas de la plataforma. */
export interface ChatMessage { id: string; teamId: string; dynamicId: string; from: 'team' | 'coach'; text: string; createdAt: string }

/** El equipo pide ayuda; el panel la marca como atendida. */
export interface HelpRequest { id: string; teamId: string; dynamicId: string; createdAt: string; attendedAt?: string }

/** Todo lo que guarda la plataforma. */
export interface Database {
  version: number
  /** Equipos que llevan datos de ejemplo. Se vacían antes del evento. */
  demoTeamIds: string[]
  event: EventState
  room: RoomState
  teams: Team[]
  headlines: Headline[]
  signals: Signal[]
  dossiers: Dossier[]
  ideas: Idea[]
  initiatives: Initiative[]
  covers: Cover[]
  photos: Photo[]
  alerts: Alert[]
  voteCodes: VoteCode[]
  votes: Vote[]
  assessments: Assessment[]
  setups: TeamSetup[]
  progress: TeamProgress[]
  chat: ChatMessage[]
  helpRequests: HelpRequest[]
}
