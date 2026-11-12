// Datos iniciales (CLAUDE.md, apartado 9).
//
// · Los 12 equipos empiezan EN BLANCO: solo número y ámbito. El reto lo construyen durante la jornada.
// · El equipo 07 lleva el ejemplo de la metodología («Primer Paso») para poder construir y probar
//   las pantallas. Es un dato de EJEMPLO: se vacía antes del evento con `clearDemo()` del almacén.
// · Todo es ficticio: ni nombres reales, ni partidos, ni cargos.
import { TEAM_AREAS } from './config'
import type { Database, Team } from './types'

export const DB_VERSION = 1
export const DEMO_TEAM_ID = '07'

export function teamId(n: number): string {
  return String(n).padStart(2, '0')
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
    room: { mode: 'welcome', resultsApproved: false },
    teams: blankTeams(),
    headlines: [], signals: [], dossiers: [], ideas: [], initiatives: [],
    covers: [], photos: [], alerts: [], voteCodes: [], votes: [], assessments: [],
  }
}

/** Base de datos para desarrollar y probar: en blanco + el ejemplo del equipo 07. */
export function createSeed(): Database {
  const db = createBlank()
  const id = DEMO_TEAM_ID
  db.demoTeamIds = [id]
  // El ejemplo simula la jornada ya avanzada: los ámbitos ya se han revelado
  db.event.areasRevealed = true

  const team = db.teams.find((t) => t.id === id)!
  team.phases = { foresight: 'done', research: 'done', ideation: 'done', pitch: 'active' }

  db.headlines.push({
    teamId: id,
    headline: 'En 2040, Las Rozas conecta talento, empresas y nuevas oportunidades',
    said: 'Que es el sitio donde los jóvenes empiezan su carrera',
    changed: 'Alianzas estables entre empresas y centros educativos',
    measure: 'Más jóvenes encuentran su primera oportunidad aquí',
  })

  // Señales genéricas y ficticias, solo para probar el formulario
  db.signals.push(
    { id: 's1', teamId: id, title: 'Nuevas profesiones', description: 'Aparecen perfiles que hace diez años no existían.', kind: 'hypothesis' },
    { id: 's2', teamId: id, title: 'Trabajo en remoto', description: 'Parte del empleo ya no depende de vivir cerca de la oficina.', kind: 'hypothesis' },
    { id: 's3', teamId: id, title: 'Nuevas formas de aprender', description: 'Formaciones cortas y prácticas ganan peso frente a las largas.', kind: 'hypothesis' },
  )

  db.dossiers.push({
    teamId: id,
    who: 'Jóvenes recién formados que viven en Las Rozas',
    when: 'Al terminar sus estudios, cuando busca su primera experiencia',
    goal: 'Su primera experiencia profesional cerca de casa',
    barrier: 'No conoce a las empresas locales y ellas no le conocen a él',
    currentWorkaround: 'Busca en portales de empleo generales, pero casi todas las ofertas le obligan a desplazarse lejos',
    challenge: '¿Cómo podríamos acercar a jóvenes y empresas locales en sus primeras oportunidades?',
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

  db.covers.push({
    teamId: id,
    headline: 'Las Rozas conecta a 1.000 jóvenes con su primera oportunidad profesional',
    keyFigure: '1.000',
    keyFigureLabel: 'jóvenes con su primera oportunidad profesional',
    whatChanged: 'Nació en el hackathon de 2026',
    howItStarted: 'Un piloto de 20 jóvenes y 5 empresas del Hub',
  })

  return db
}
