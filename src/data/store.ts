// ==========================================================
// ALMACÉN DE DATOS · única puerta de entrada a los datos (CLAUDE.md, apartado 3)
//
// Las pantallas NUNCA hablan con localStorage ni con Supabase: usan este módulo.
// Fase 1 (ahora): datos en el navegador (localStorage) y sincronización entre
// pestañas con BroadcastChannel. Fase 2 (hito 8): se cambia solo este archivo.
// ==========================================================
import { reactive, readonly, watch } from 'vue'
import { AREAS } from './config'
import { createBlank, createSeed, DB_VERSION } from './seed'
import type { AreaId, Database, PhaseId, PhaseState } from './types'

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
// `lastSynced` evita reenviar a otras pestañas un cambio que acaba de llegar de ellas.
let lastSynced = JSON.stringify(state)
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
    try { localStorage.setItem(STORAGE_KEY, json) } catch { /* sin almacenamiento: seguimos en memoria */ }
    channel?.postMessage(json)
  },
  { deep: true },
)

channel?.addEventListener('message', (e: MessageEvent<string>) => {
  if (e.data === lastSynced) return
  lastSynced = e.data
  replaceState(JSON.parse(e.data) as Database)
})

// Lectura ------------------------------------------------------------------
const db = readonly(state)

export function useStore() {
  return {
    db,
    areaName: (area: AreaId) => AREAS[area],
    team: (teamId: string) => db.teams.find((t) => t.id === teamId),
    headline: (teamId: string) => db.headlines.find((h) => h.teamId === teamId),
    signals: (teamId: string) => db.signals.filter((s) => s.teamId === teamId),
    dossier: (teamId: string) => db.dossiers.find((d) => d.teamId === teamId),
    ideas: (teamId: string) => db.ideas.filter((i) => i.teamId === teamId),
    initiative: (teamId: string) => db.initiatives.find((i) => i.teamId === teamId),
    cover: (teamId: string) => db.covers.find((c) => c.teamId === teamId),
    photos: (teamId: string) => db.photos.filter((p) => p.teamId === teamId),
    isDemo: (teamId: string) => db.demoTeamIds.includes(teamId),
  }
}

// Escritura ----------------------------------------------------------------
// Cada hito añade aquí las acciones que necesita su pantalla.

export function setPhase(teamId: string, phase: PhaseId, value: PhaseState) {
  const team = state.teams.find((t) => t.id === teamId)
  if (team) team.phases[phase] = value
}

export function revealAreas(revealed: boolean) {
  state.event.areasRevealed = revealed
}

/** Vuelve a los datos de ejemplo (equipo 07 completo). Para desarrollar y probar. */
export function resetToSeed() {
  replaceState(createSeed())
}

/** Deja todo en blanco, como el día del evento. Borra también el ejemplo del 07. */
export function clearAll() {
  replaceState(createBlank())
}
