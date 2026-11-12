// Datos iniciales (CLAUDE.md, apartado 9).
//
// · Los 12 equipos (A a L) empiezan EN BLANCO: solo letra y ámbito. El reto lo construyen durante la jornada.
// · El equipo G (Atracción de talento) lleva datos de EJEMPLO para poder probar las pantallas:
//   nombres ficticios y el ejemplo de la metodología («Primer Paso»). Se vacía antes del evento desde el panel.
// · Todo es ficticio: ni nombres reales, ni partidos, ni cargos.
//
// ⚠️ Cambiar DB_VERSION borra los datos guardados (también en Supabase) y vuelve a estos.
//    No cambiarlo cerca del evento.
import { TEAM_AREAS } from './config'
import type { Database, Team } from './types'

export const DB_VERSION = 3
export const DEMO_TEAM_ID = 'G'

/** Letra del equipo: 1 → «A», 12 → «L» */
export function teamId(n: number): string {
  return String.fromCharCode(64 + n)
}

function blankTeams(): Team[] {
  return TEAM_AREAS.map((area, i) => ({
    id: teamId(i + 1),
    number: i + 1,
    name: `Equipo ${teamId(i + 1)}`,
    area,
    phases: { foresight: 'active', research: 'locked', ideation: 'locked', pitch: 'locked' },
  }))
}

/** Base de datos vacía, como quedará el día del evento antes de empezar. */
export function createBlank(): Database {
  return {
    version: DB_VERSION,
    demoTeamIds: [],
    event: { areasRevealed: false },
    room: { mode: 'welcome', step: 0, resultsApproved: false },
    teams: blankTeams(),
    headlines: [], signals: [], dossiers: [], ideas: [], initiatives: [],
    covers: [], photos: [], alerts: [], voteCodes: [], votes: [], assessments: [],
    setups: [], progress: [], chat: [], helpRequests: [],
  }
}

/** Base de datos para probar: en blanco, con los ámbitos ya revelados y el equipo G de ejemplo. */
export function createSeed(): Database {
  const db = createBlank()
  const id = DEMO_TEAM_ID
  db.demoTeamIds = [id]
  db.event.areasRevealed = true

  // Nombres ficticios
  db.setups.push({ teamId: id, members: ['Ana', 'Luis', 'Marta', 'Pablo'], digitalOwner: 'Ana', premortemDone: true })

  // Texto del ejemplo de la metodología (para la portada y la votación más adelante)
  db.covers.push({
    teamId: id,
    headline: 'Las Rozas conecta a 1.000 jóvenes con su primera oportunidad profesional',
    keyFigure: '1.000',
    keyFigureLabel: 'jóvenes con su primera oportunidad profesional',
    whatChanged: 'Nació en el hackathon de 2026',
    howItStarted: 'Un piloto de 20 jóvenes y 5 empresas del Hub',
  })
  db.initiatives.push({
    teamId: id,
    name: 'Primer Paso',
    whoWeHelp: 'Jóvenes recién formados que viven en Las Rozas',
    problem: 'No conocen a las empresas locales y ellas no les conocen a ellos',
    benefit: 'Una primera experiencia real cerca de casa, y empresas que conocen al talento local',
    solution: 'Estancias de dos semanas en empresas del municipio',
    levers: ['Alianzas con empresas del Hub', 'Centros educativos que derivan', 'Estancias cortas y sin burocracia'],
  })

  return db
}
