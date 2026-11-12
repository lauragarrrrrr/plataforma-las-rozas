// ==========================================================
// ALMACÉN DE DATOS · única puerta de entrada a los datos (CLAUDE.md, apartado 3)
//
// Las pantallas NUNCA hablan con localStorage ni con Supabase: usan este módulo.
// · Con Supabase configurado (VITE_SUPABASE_*): datos compartidos entre todos los
//   dispositivos y en tiempo real. Las fotos van al almacenamiento de Supabase.
// · Sin configurar: datos en el navegador (localStorage), sincronizados entre pestañas.
// ==========================================================
import { reactive, readonly, ref, watch } from 'vue'
import { AREAS } from './config'
import { TEAM_DYNAMICS } from './dynamics'
import { createBlank, createSeed, DB_VERSION } from './seed'
import {
  deleteAll, fetchAll, LISTS, sb, SINGLETONS, subscribe, toRows, upsertRows, uploadPhoto,
  type Collection, type ListName, type Row,
} from './remote'
import type { AreaId, Database, PhaseId, PhaseState, Photo, PhotoKind, TeamProgress } from './types'

export const isRemote = !!sb

const STORAGE_KEY = 'lr2040:db'
const CHANNEL_NAME = 'lr2040'

const state = reactive<Database>(isRemote ? createBlank() : loadLocal())
const ready = ref(!isRemote)
const connError = ref('')
let saveError = false

const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x))

function replaceState(next: Database) {
  for (const key of Object.keys(state) as (keyof Database)[]) {
    if (!(key in next)) delete (state as Partial<Database>)[key]
  }
  Object.assign(state, next)
}

// ---------------------------------------------------------------------------
// Modo navegador (sin Supabase)
// ---------------------------------------------------------------------------
function loadLocal(): Database {
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

if (!isRemote) {
  let lastSynced = JSON.stringify(state)
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null
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
        saveError = true
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
}

// ---------------------------------------------------------------------------
// Modo Supabase
// ---------------------------------------------------------------------------
function applyRow(row: Row, deleted: boolean) {
  const coll = row.coleccion as Collection
  if ((SINGLETONS as readonly string[]).includes(coll)) {
    if (deleted) return
    if (coll === 'meta') {
      const m = row.datos as { version: number; demoTeamIds: string[] }
      state.version = m.version
      state.demoTeamIds = m.demoTeamIds
    } else {
      Object.assign(state[coll as 'event' | 'room'], row.datos)
      if (coll === 'room' && !(row.datos as { timerEndsAt?: string }).timerEndsAt) state.room.timerEndsAt = undefined
    }
    return
  }
  const field = LISTS[coll as ListName]
  if (!field) return
  const list = state[coll as ListName] as unknown as Record<string, unknown>[]
  const i = list.findIndex((x) => String(x[field]) === row.id)
  if (deleted) {
    if (i >= 0) list.splice(i, 1)
  } else if (i >= 0) {
    list.splice(i, 1, row.datos as Record<string, unknown>)
  } else {
    list.push(row.datos as Record<string, unknown>)
  }
}

function fromRows(rows: Row[]): Database {
  const db = createBlank()
  for (const name of Object.keys(LISTS) as ListName[]) (db[name] as unknown[]) = []
  replaceState(db)
  for (const r of rows) applyRow(r, false)
  return clone(state) as Database
}

async function initRemote() {
  try {
    let rows = await fetchAll()
    if (!rows.some((r) => r.coleccion === 'teams')) {
      rows = toRows(createSeed())
      await upsertRows(rows)
    }
    fromRows(rows)
    subscribe(applyRow)
    ready.value = true
  } catch (e) {
    connError.value = 'No se ha podido conectar con la base de datos. Comprobad la conexión a internet y recargad la página.'
    console.error(e)
  }
}
if (isRemote) initRemote()

/** Guarda en Supabase un elemento que acaba de cambiar. En modo navegador no hace nada. */
function save(coll: Collection, item?: Record<string, unknown> | object): Promise<void> {
  if (!isRemote) return Promise.resolve()
  let row: Row
  if (coll === 'meta') row = { coleccion: 'meta', id: 'meta', datos: { version: state.version, demoTeamIds: clone(state.demoTeamIds) } }
  else if (coll === 'event' || coll === 'room') row = { coleccion: coll, id: coll, datos: clone(state[coll]) }
  else row = { coleccion: coll, id: String((item as Record<string, unknown>)[LISTS[coll]]), datos: clone(item) }
  return upsertRows([row]).catch((e) => {
    connError.value = 'No se ha podido guardar el último cambio. Comprobad la conexión a internet.'
    console.error(e)
    throw e
  })
}
const saveQuiet = (coll: Collection, item?: object) => { save(coll, item).catch(() => {}) }

// ---------------------------------------------------------------------------
// Lectura
// ---------------------------------------------------------------------------
const db = readonly(state)

export function useStore() {
  return {
    db,
    ready,
    connError,
    areaName: (area: AreaId) => AREAS[area],
    team: (teamId: string) => db.teams.find((t) => t.id === teamId),
    setup: (teamId: string) => db.setups.find((s) => s.teamId === teamId),
    progress: (teamId: string) => db.progress.find((p) => p.teamId === teamId),
    photos: (teamId: string) => db.photos.filter((p) => p.teamId === teamId),
    /** Última foto de una dinámica (la dinámica está hecha si existe) */
    photoFor: (teamId: string, dynamicId: string) =>
      db.photos.filter((p) => p.teamId === teamId && p.dynamicId === dynamicId).slice(-1)[0],
    chat: (teamId: string) => db.chat.filter((m) => m.teamId === teamId),
    pendingHelp: (teamId: string) => db.helpRequests.find((h) => h.teamId === teamId && !h.attendedAt),
    initiative: (teamId: string) => db.initiatives.find((i) => i.teamId === teamId),
    isDemo: (teamId: string) => db.demoTeamIds.includes(teamId),
    lastSaveFailed: () => saveError,
  }
}

// ---------------------------------------------------------------------------
// Escritura · equipos
// ---------------------------------------------------------------------------
function progressOf(teamId: string): TeamProgress {
  let p = state.progress.find((x) => x.teamId === teamId)
  if (!p) {
    state.progress.push({ teamId, current: 0, started: {} })
    p = state.progress[state.progress.length - 1]
  }
  return p
}

/** Fase de la metodología según la dinámica en la que va el equipo */
function syncPhases(teamId: string) {
  const team = state.teams.find((t) => t.id === teamId)
  const p = state.progress.find((x) => x.teamId === teamId)
  if (!team || !p) return
  const phases: PhaseId[] = ['foresight', 'research', 'ideation', 'pitch']
  const cur = phases.indexOf(TEAM_DYNAMICS[Math.min(p.current, TEAM_DYNAMICS.length - 1)].phase)
  const finished = p.current >= TEAM_DYNAMICS.length
  phases.forEach((ph, idx) => {
    team.phases[ph] = finished || idx < cur ? 'done' : idx === cur ? 'active' : 'locked'
  })
  saveQuiet('teams', team)
}

export function saveSetup(teamId: string, members: string[], digitalOwner: string) {
  const clean = members.map((m) => m.trim()).filter(Boolean)
  let s = state.setups.find((x) => x.teamId === teamId)
  if (s) Object.assign(s, { members: clean, digitalOwner })
  else {
    state.setups.push({ teamId, members: clean, digitalOwner })
    s = state.setups[state.setups.length - 1]
  }
  saveQuiet('setups', s)
  saveQuiet('progress', progressOf(teamId))
  syncPhases(teamId)
}

/** Arranca el cronómetro de una dinámica la primera vez que el equipo la abre */
export function startDynamic(teamId: string, dynamicId: string) {
  const p = progressOf(teamId)
  if (p.started[dynamicId]) return
  p.started[dynamicId] = now()
  saveQuiet('progress', p)
}

/**
 * Guarda una foto. Con Supabase, la sube al almacenamiento y espera a que esté
 * guardada: si falla, lanza un error para que la pantalla lo diga.
 */
export async function addPhoto(teamId: string, dynamicId: string, kind: PhotoKind, dataUrl: string) {
  const id = uid()
  const url = isRemote ? await uploadPhoto(`${teamId}/${dynamicId}-${id}.jpg`, dataUrl) : dataUrl
  const photo: Photo = { id, teamId, kind, dynamicId, url, createdAt: now() }
  await save('photos', photo)
  if (!state.photos.some((p) => p.id === id)) state.photos.push(photo)
  return id
}

/** Pasa a la siguiente dinámica. Solo si la actual tiene su foto. */
export function nextDynamic(teamId: string) {
  const p = progressOf(teamId)
  const current = TEAM_DYNAMICS[p.current]
  if (!current || !state.photos.some((x) => x.teamId === teamId && x.dynamicId === current.id)) return
  p.current += 1
  saveQuiet('progress', p)
  syncPhases(teamId)
}

export function addChat(teamId: string, dynamicId: string, from: 'team' | 'coach', text: string) {
  const msg = { id: uid(), teamId, dynamicId, from, text, createdAt: now() }
  state.chat.push(msg)
  saveQuiet('chat', msg)
}

export function requestHelp(teamId: string, dynamicId: string) {
  if (state.helpRequests.some((h) => h.teamId === teamId && !h.attendedAt)) return
  const h = { id: uid(), teamId, dynamicId, createdAt: now() }
  state.helpRequests.push(h)
  saveQuiet('helpRequests', h)
}

// ---------------------------------------------------------------------------
// Escritura · equipo facilitador
// ---------------------------------------------------------------------------
export function attendHelp(id: string) {
  const h = state.helpRequests.find((x) => x.id === id)
  if (!h || h.attendedAt) return
  h.attendedAt = now()
  saveQuiet('helpRequests', h)
}

export function setRoomStep(step: number) {
  state.room.step = step
  state.room.timerEndsAt = undefined
  saveQuiet('room')
}

export function startRoomTimer(minutes: number) {
  state.room.timerEndsAt = new Date(Date.now() + minutes * 60_000).toISOString()
  saveQuiet('room')
}

export function stopRoomTimer() {
  state.room.timerEndsAt = undefined
  saveQuiet('room')
}

export function setPhase(teamId: string, phase: PhaseId, value: PhaseState) {
  const team = state.teams.find((t) => t.id === teamId)
  if (!team) return
  team.phases[phase] = value
  saveQuiet('teams', team)
}

export function revealAreas(revealed: boolean) {
  state.event.areasRevealed = revealed
  saveQuiet('event')
}

async function replaceEverything(next: Database) {
  if (isRemote) {
    await deleteAll()
    await upsertRows(toRows(next))
  }
  replaceState(next)
}

/** Vuelve a los datos de ejemplo (equipo 07). Para preparar y probar. */
export const resetToSeed = () => replaceEverything(createSeed())

/** Deja todo en blanco, como el día del evento. */
export const clearAll = () => replaceEverything(createBlank())
