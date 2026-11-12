// ==========================================================
// ALMACÉN DE DATOS · única puerta de entrada a los datos (CLAUDE.md, apartado 3)
//
// Las pantallas NUNCA hablan con localStorage ni con Supabase: usan este módulo.
// Fase 1 (ahora): datos en el navegador (localStorage) y sincronización entre
// pestañas con BroadcastChannel. Fase 2 (hito 8): se cambia solo este archivo.
// ==========================================================
import { reactive, readonly, watch } from 'vue'
import { AREAS } from './config'
import { TEAM_DYNAMICS } from './dynamics'
import { createBlank, createSeed, DB_VERSION } from './seed'
import type { AreaId, Database, PhaseId, PhaseState, PhotoKind, TeamProgress } from './types'

const STORAGE_KEY = 'lr2040:db'
const CHANNEL_NAME = 'lr2040'

function load(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Database
      if (parsed.version === DB_VERSION) return parsed
    }
  } catch {
    // Almacenamiento bloqueado o dato roto: empezamos con los datos de ejemplo
  }
  return createSeed()
}

const state = reactive<Database>(load())

// Guardado y sincronización -------------------------------------------------
let lastSynced = JSON.stringify(state)
let saveError = false
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null

function replaceState(next: Database) {
  for (const key of Object.keys(state) as (keyof Database)[]) {
    if (!(key in next)) delete (state as Partial<Database>)[key]
  }
  Object.assign(state, next)
}

watch(
  state,
  () => {
    const json = JSON.stringify(state)
    if (json === lastSynced) return
    lastSynced = json
    try {
      localStorage.setItem(STORAGE_KEY, json)
      saveError = false
    } catch {
      saveError = true // sin espacio (fotos grandes): seguimos en memoria
    }
    channel?.postMessage(json)
  },
  { deep: true },
)

channel?.addEventListener('message', (e: MessageEvent<string>) => {
  if (e.data === lastSynced) return
  lastSynced = e.data
  replaceState(JSON.parse(e.data) as Database)
})

const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()

// Lectura ------------------------------------------------------------------
const db = readonly(state)

export function useStore() {
  return {
    db,
    areaName: (area: AreaId) => AREAS[area],
    team: (teamId: string) => db.teams.find((t) => t.id === teamId),
    setup: (teamId: string) => db.setups.find((s) => s.teamId === teamId),
    progress: (teamId: string) => db.progress.find((p) => p.teamId === teamId),
    photos: (teamId: string) => db.photos.filter((p) => p.teamId === teamId),
    chat: (teamId: string) => db.chat.filter((m) => m.teamId === teamId),
    pendingHelp: (teamId: string) => db.helpRequests.find((h) => h.teamId === teamId && !h.attendedAt),
    initiative: (teamId: string) => db.initiatives.find((i) => i.teamId === teamId),
    isDemo: (teamId: string) => db.demoTeamIds.includes(teamId),
    lastSaveFailed: () => saveError,
  }
}

// Escritura · equipos ---------------------------------------------------------

function progressOf(teamId: string): TeamProgress {
  let p = state.progress.find((x) => x.teamId === teamId)
  if (!p) {
    p = { teamId, current: 0, started: {}, done: {} }
    state.progress.push(p)
  }
  return p
}

/** Fase de la metodología según la dinámica en la que va el equipo */
function syncPhases(teamId: string) {
  const team = state.teams.find((t) => t.id === teamId)
  const p = state.progress.find((x) => x.teamId === teamId)
  if (!team || !p) return
  const phases: PhaseId[] = ['foresight', 'research', 'ideation', 'pitch']
  const currentPhase = TEAM_DYNAMICS[Math.min(p.current, TEAM_DYNAMICS.length - 1)].phase
  const finished = p.current >= TEAM_DYNAMICS.length
  for (const ph of phases) {
    const idx = phases.indexOf(ph)
    const cur = phases.indexOf(currentPhase)
    team.phases[ph] = finished || idx < cur ? 'done' : idx === cur ? 'active' : 'locked'
  }
}

export function saveSetup(teamId: string, members: string[], digitalOwner: string) {
  const clean = members.map((m) => m.trim()).filter(Boolean)
  const existing = state.setups.find((s) => s.teamId === teamId)
  if (existing) Object.assign(existing, { members: clean, digitalOwner })
  else state.setups.push({ teamId, members: clean, digitalOwner })
  progressOf(teamId)
  syncPhases(teamId)
}

/** Arranca el cronómetro de una dinámica la primera vez que el equipo la abre */
export function startDynamic(teamId: string, dynamicId: string) {
  const p = progressOf(teamId)
  if (!p.started[dynamicId]) p.started[dynamicId] = now()
}

export function addPhoto(teamId: string, dynamicId: string, kind: PhotoKind, url: string) {
  const id = uid()
  state.photos.push({ id, teamId, kind, dynamicId, url, createdAt: now() })
  const p = progressOf(teamId)
  p.done[dynamicId] = id
  return id
}

/** Pasa a la siguiente dinámica. Solo si la actual tiene su foto. */
export function nextDynamic(teamId: string) {
  const p = progressOf(teamId)
  const current = TEAM_DYNAMICS[p.current]
  if (!current || !p.done[current.id]) return
  p.current += 1
  syncPhases(teamId)
}

export function addChat(teamId: string, dynamicId: string, from: 'team' | 'coach', text: string) {
  state.chat.push({ id: uid(), teamId, dynamicId, from, text, createdAt: now() })
}

export function requestHelp(teamId: string, dynamicId: string) {
  if (state.helpRequests.some((h) => h.teamId === teamId && !h.attendedAt)) return
  state.helpRequests.push({ id: uid(), teamId, dynamicId, createdAt: now() })
}

// Escritura · equipo facilitador ---------------------------------------------

export function attendHelp(id: string) {
  const h = state.helpRequests.find((x) => x.id === id)
  if (h && !h.attendedAt) h.attendedAt = now()
}

export function setRoomStep(step: number) {
  state.room.step = step
  state.room.timerEndsAt = undefined
}

export function startRoomTimer(minutes: number) {
  state.room.timerEndsAt = new Date(Date.now() + minutes * 60_000).toISOString()
}

export function stopRoomTimer() {
  state.room.timerEndsAt = undefined
}

export function setPhase(teamId: string, phase: PhaseId, value: PhaseState) {
  const team = state.teams.find((t) => t.id === teamId)
  if (team) team.phases[phase] = value
}

export function revealAreas(revealed: boolean) {
  state.event.areasRevealed = revealed
}

/** Vuelve a los datos de ejemplo (equipo 07). Para desarrollar y probar. */
export function resetToSeed() {
  replaceState(createSeed())
}

/** Deja todo en blanco, como el día del evento. */
export function clearAll() {
  replaceState(createBlank())
}
