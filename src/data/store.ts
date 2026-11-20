// ==========================================================
// ALMACÉN DE DATOS · única puerta de entrada a los datos (CLAUDE.md, apartado 3)
//
// Las pantallas NUNCA hablan con localStorage ni con Supabase: usan este módulo.
// · Con Supabase configurado (VITE_SUPABASE_*): datos compartidos entre todos los
//   dispositivos y en tiempo real. Las fotos van al almacenamiento de Supabase.
// · Sin configurar: datos en el navegador (localStorage), sincronizados entre pestañas.
// ==========================================================
import { reactive, readonly, ref, watch } from 'vue'
import { AGENDA } from './agenda'
import { AREAS, TEAM_AREAS } from './config'
import { backToRoomAfter, TEAM_DYNAMICS } from './dynamics'
import { createBlank, createSeed, DB_VERSION } from './seed'
import { ROSTER } from './roster'
import {
  deleteAll, deleteRow, fetchAll, LISTS, sb, SINGLETONS, subscribe, toRows, upsertRows, uploadPhoto,
  type Collection, type ListName, type Row,
} from './remote'
import type { AreaId, Database, PhaseId, PhaseState, Photo, PhotoKind, TeamProgress } from './types'

export const isRemote = !!sb

const STORAGE_KEY = 'lr2040:db'
const CHANNEL_NAME = 'lr2040'

const state = reactive<Database>(withConfigAreas(isRemote ? createBlank() : loadLocal()))
const ready = ref(!isRemote)
const connError = ref('')
let saveError = false

const uid = () => Math.random().toString(36).slice(2, 10)
// Hora siempre creciente: dos mensajes seguidos nunca tienen la misma, así no se desordenan al recargar
let lastTs = 0
const now = () => {
  lastTs = Math.max(Date.now(), lastTs + 1)
  return new Date(lastTs).toISOString()
}
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x))

/** El ámbito de cada equipo sale siempre de config.ts (así se cambia sin borrar datos) */
function withConfigAreas<T extends { teams: Database['teams'] }>(db: T): T {
  for (const t of db.teams) t.area = TEAM_AREAS[t.number - 1] ?? t.area
  return db
}

function replaceState(next: Database) {
  withConfigAreas(next)
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
/** Aplica una fila de Supabase a la base de datos indicada (la viva o una copia) */
function applyRowTo(target: Database, row: Row, deleted: boolean) {
  const coll = row.coleccion as Collection
  if ((SINGLETONS as readonly string[]).includes(coll)) {
    if (deleted) return
    if (coll === 'meta') {
      const m = row.datos as { version: number; demoTeamIds: string[] }
      target.version = m.version
      target.demoTeamIds = m.demoTeamIds
    } else if (coll === 'event') {
      // Se sustituye entero: así un campo que desaparece (p. ej. openDynamic) también desaparece aquí
      target.event = { ...(row.datos as Database['event']) }
    } else {
      target.room = { ...(row.datos as Database['room']) }
    }
    return
  }
  const field = LISTS[coll as ListName]
  if (!field) return
  const list = target[coll as ListName] as unknown as Record<string, unknown>[]
  const i = list.findIndex((x) => String(x[field]) === row.id)
  if (deleted) {
    if (i >= 0) list.splice(i, 1)
  } else if (i >= 0) {
    list.splice(i, 1, row.datos as Record<string, unknown>)
  } else {
    list.push(row.datos as Record<string, unknown>)
  }
  // Supabase devuelve las filas en cualquier orden: equipos de la A a la L,
  // y chat, fotos y ayudas por orden de llegada
  if (coll === 'teams') withConfigAreas(target).teams.sort((a, b) => a.number - b.number)
  if (coll === 'chat' || coll === 'photos' || coll === 'helpRequests') {
    ;(target[coll] as { createdAt: string }[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }
}

/** Cambio que llega de otro dispositivo. Si aquí hay uno pendiente de guardar del mismo elemento, manda el de aquí. */
const applyRow = (row: Row, deleted: boolean) => {
  if (pending.has(keyOf(row))) return
  applyRowTo(state, row, deleted)
}

/**
 * Monta la base de datos completa a partir de las filas y la cambia de golpe,
 * sin pasar por un momento «en blanco» que confundiría a las pantallas.
 */
function fromRows(rows: Row[]) {
  const db = createBlank()
  for (const name of Object.keys(LISTS) as ListName[]) (db[name] as unknown[]) = []
  for (const r of rows) applyRowTo(db, r, false)
  // Lo que aún no se ha podido guardar desde aquí se queda como está
  for (const r of pending.values()) applyRowTo(db, r, false)
  replaceState(db)
}

/** Vuelve a leer todo de Supabase (al volver a la pestaña, tras un corte y cada 20 s) */
let resyncing = false
async function resync() {
  if (!isRemote || !ready.value || resyncing) return
  resyncing = true
  try {
    fromRows(await fetchAll())
    connError.value = ''
    flush()
  } catch {
    connError.value = 'Sin conexión con la base de datos. Reintentando…'
  } finally {
    resyncing = false
  }
}

async function initRemote() {
  try {
    let rows = await fetchAll()
    const meta = rows.find((r) => r.coleccion === 'meta')?.datos as { version?: number } | undefined
    // Base VACÍA (sin equipos): solo entonces se rellena, y solo desde una pantalla del equipo facilitador.
    // Si ya hay datos, NUNCA se borran solos al publicar una versión nueva (aunque cambie DB_VERSION):
    // así se pueden hacer cambios el mismo día sin perder nada. Borrar es solo con los botones del panel.
    const empty = !rows.some((r) => r.coleccion === 'teams')
    if (empty && isFacilitatorPage()) {
      rows = toRows(createSeed())
      await upsertRows(rows)
    } else if (meta?.version !== DB_VERSION && isFacilitatorPage()) {
      await upsertRows([{ coleccion: 'meta', id: 'meta', datos: { ...(meta ?? {}), version: DB_VERSION } }])
    }
    if (!rows.some((r) => r.coleccion === 'teams')) rows = [...rows, ...toRows(createBlank()).filter((r) => r.coleccion === 'teams')]
    fromRows(rows)
    restorePending()
    subscribe(applyRow, () => { window.setTimeout(resync, 3500) })
    ready.value = true
    // Mantener todas las pestañas y dispositivos a la par
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') resync() })
    window.addEventListener('focus', resync)
    window.addEventListener('online', resync)
    window.setInterval(resync, 20_000)
  } catch (e) {
    connError.value = 'No se ha podido conectar con la base de datos. Comprobad la conexión a internet y recargad la página.'
    console.error(e)
  }
}

// ---------------------------------------------------------------------------
// Equipo facilitador: sin contraseña (decidido por Laura el 16/11/2026)
// ---------------------------------------------------------------------------
/** ¿Se ha abierto la web desde una pantalla del equipo facilitador? */
function isFacilitatorPage() {
  return /^\/(panel|sala|facilitacion|vista-previa)(\/|$)/.test(window.location.pathname)
}


function rowOf(coll: Collection, item?: Record<string, unknown> | object): Row {
  if (coll === 'meta') return { coleccion: 'meta', id: 'meta', datos: { version: state.version, demoTeamIds: clone(state.demoTeamIds) } }
  if (coll === 'event' || coll === 'room') return { coleccion: coll, id: coll, datos: clone(state[coll]) }
  return { coleccion: coll, id: String((item as Record<string, unknown>)[LISTS[coll]]), datos: clone(item) }
}

/**
 * Guarda en Supabase y ESPERA a que se guarde (fotos y votos: la pantalla dice si ha fallado).
 * En modo navegador no hace nada.
 */
function save(coll: Collection, item?: Record<string, unknown> | object): Promise<void> {
  if (!isRemote) return Promise.resolve()
  return upsertRows([rowOf(coll, item)]).catch((e) => {
    connError.value = 'No se ha podido guardar el último cambio. Comprobad la conexión a internet.'
    console.error(e)
    throw e
  })
}

// ---------------------------------------------------------------------------
// Cola de cambios pendientes (para la wifi mala)
// Todo lo demás se guarda a través de esta cola: si falla, se queda aquí (también en
// el navegador, por si se recarga la página) y se reintenta solo cada pocos segundos.
// Mientras esté pendiente, lo que llega de Supabase no lo pisa.
// ---------------------------------------------------------------------------
const PENDING_KEY = 'lr2040:pendientes'
/** Los pendientes guardados en el navegador valen como mucho 3 horas */
const PENDING_MAX_AGE = 3 * 60 * 60_000
const pending = new Map<string, Row>()
const keyOf = (r: { coleccion: string; id: string }) => `${r.coleccion}:${r.id}`
/** Aviso para la pantalla cuando hay cambios sin guardar */
const unsaved = ref('')
let flushing = false
let flushAgain = false
let retryTimer = 0

function persistPending() {
  try {
    if (pending.size) localStorage.setItem(PENDING_KEY, JSON.stringify({ jornada: state.event.jornada ?? '', at: Date.now(), rows: [...pending.values()] }))
    else localStorage.removeItem(PENDING_KEY)
  } catch { /* sin almacenamiento: siguen en memoria */ }
}

async function flush() {
  if (!isRemote || !pending.size) return
  if (flushing) { flushAgain = true; return }
  flushing = true
  window.clearTimeout(retryTimer)
  const batch = [...pending.values()]
  try {
    await upsertRows(batch)
    // Solo se quitan los que no han vuelto a cambiar mientras se enviaban
    for (const r of batch) if (pending.get(keyOf(r)) === r) pending.delete(keyOf(r))
    persistPending()
    if (!pending.size) unsaved.value = ''
  } catch (e) {
    console.error(e)
    const n = pending.size
    unsaved.value = `Sin conexión: ${n} ${n === 1 ? 'cambio está' : 'cambios están'} sin guardar. Se guardarán solos al volver la conexión. No cerréis esta página.`
    retryTimer = window.setTimeout(flush, 4000)
  } finally {
    flushing = false
    if (flushAgain) { flushAgain = false; if (pending.size) flush() }
  }
}

/** Guarda sin esperar: si no hay conexión, se queda en la cola y se reintenta solo */
const saveQuiet = (coll: Collection, item?: object) => {
  if (!isRemote) return
  const row = rowOf(coll, item)
  pending.set(keyOf(row), row)
  persistPending()
  flush()
}

/** Al arrancar: recupera lo que no se llegó a guardar antes de recargar la página */
function restorePending() {
  try {
    const raw = JSON.parse(localStorage.getItem(PENDING_KEY) ?? 'null') as { jornada?: string; at?: number; rows?: Row[] } | null
    if (!raw?.rows?.length || raw.jornada !== (state.event.jornada ?? '') || Date.now() - (raw.at ?? 0) > PENDING_MAX_AGE) {
      localStorage.removeItem(PENDING_KEY)
      return
    }
    for (const r of raw.rows) {
      pending.set(keyOf(r), r)
      applyRowTo(state, r, false)
    }
    flush()
  } catch { /* nada que recuperar */ }
}

if (isRemote) {
  window.addEventListener('online', () => { flush() })
  // Si quedan cambios sin guardar, el navegador pregunta antes de cerrar la página
  window.addEventListener('beforeunload', (e) => {
    if (!pending.size) return
    e.preventDefault()
    e.returnValue = ''
  })
}

// ---------------------------------------------------------------------------
// Ritmo de la jornada: qué dinámica está abierta
// ---------------------------------------------------------------------------
/** Dinámica abierta para todos. Ninguna hasta que el equipo facilitador abre la primera (el Titular). */
function groupOpen(): number {
  return state.event.openDynamic ?? -1
}

function allowedFor(teamId: string): number {
  const p = state.progress.find((x) => x.teamId === teamId)
  return p?.limit ?? groupOpen()
}

/**
 * Cuándo empezó el cronómetro de una dinámica para un equipo.
 * En cuanto el grupo la abre, todos van con el mismo reloj que el panel (también el
 * equipo que iba adelantado, que gana ese tiempo extra). Antes de eso, el equipo
 * adelantado usa su propia hora. Decidido por Laura el 17/11/2026.
 */
function openedAtFor(teamId: string, dynamicId: string): string | undefined {
  // Todos los equipos van con el reloj del grupo (decidido el 18/11/2026): nadie tiene tiempo extra
  // salvo que el equipo facilitador lo dé a mano. Solo si el grupo no la ha abierto, cuenta la del equipo.
  const p = state.progress.find((x) => x.teamId === teamId)
  return state.event.openedAt?.[dynamicId] ?? p?.openedAt?.[dynamicId] ?? p?.started[dynamicId]
}

// ---------------------------------------------------------------------------
// Lectura
// ---------------------------------------------------------------------------
const db = readonly(state)

export function useStore() {
  return {
    db,
    ready,
    connError,
    unsaved,
    areaName: (area: AreaId) => AREAS[area],
    team: (teamId: string) => db.teams.find((t) => t.id === teamId),
    setup: (teamId: string) => db.setups.find((s) => s.teamId === teamId),
    progress: (teamId: string) => db.progress.find((p) => p.teamId === teamId),
    photos: (teamId: string) => db.photos.filter((p) => p.teamId === teamId),
    /** Última foto de una dinámica (la dinámica está hecha si existe) */
    /**
     * La foto principal de una dinámica: la última que no sea «otra» (post-its, borradores…).
     * Las fotos de más nunca cuentan para pasar a la siguiente.
     */
    photoFor: (teamId: string, dynamicId: string) =>
      db.photos.filter((p) => p.teamId === teamId && p.dynamicId === dynamicId && p.kind !== 'other').slice(-1)[0],
    chat: (teamId: string) => db.chat.filter((m) => m.teamId === teamId),
    pendingHelp: (teamId: string) => db.helpRequests.find((h) => h.teamId === teamId && !h.attendedAt),
    /** Titular de la portada del equipo (lo escribe el equipo facilitador en el panel) */
    coverHeadline: (teamId: string) => db.covers.find((c) => c.teamId === teamId)?.headline?.trim() ?? '',
    /** Avisos del panel para este equipo que todavía no ha leído (el más antiguo primero) */
    unseenAlerts: (teamId: string) => {
      const seen = db.progress.find((p) => p.teamId === teamId)?.alertsSeen ?? []
      return db.alerts
        .filter((a) => a.launchedAt && (a.target === 'all' || a.target === teamId) && !seen.includes(a.id))
        .slice()
        .sort((a, b) => (a.launchedAt ?? '').localeCompare(b.launchedAt ?? ''))
    },
    /** Qué equipos han leído un aviso */
    alertSeenBy: (alertId: string) => db.progress.filter((p) => p.alertsSeen?.includes(alertId)).map((p) => p.teamId),
    initiative: (teamId: string) => db.initiatives.find((i) => i.teamId === teamId),
    isDemo: (teamId: string) => db.demoTeamIds.includes(teamId),
    /** Dinámica abierta para todos (-1 si todavía ninguna) */
    openDynamic: () => groupOpen(),
    /** Hasta qué dinámica puede llegar este equipo: la del grupo o su excepción */
    allowed: (teamId: string) => allowedFor(teamId),
    /** Cuándo empezó a contar el tiempo de una dinámica para este equipo */
    openedAt: (teamId: string, dynamicId: string) => openedAtFor(teamId, dynamicId),
    lastSaveFailed: () => saveError,
    /** Personas de cada equipo: las cargadas en el panel (Supabase) o, si no hay, las del archivo */
    roster: (): Record<string, string[]> => (db.event.roster && Object.keys(db.event.roster).length ? (db.event.roster as Record<string, string[]>) : ROSTER),
    // --- Votación ---
    votingOpen: () => !!db.event.votingOpen,
    /** ¿Ya ha votado esta persona? (se identifica por equipo y posición, sin guardar su nombre) */
    hasVoted: (teamId: string, memberIndex: number) => db.votes.some((v) => v.code === voterCode(teamId, memberIndex)),
    /**
     * Recuento para el equipo facilitador, de más a menos puntos.
     * Favorita 1 = 3 puntos, favorita 2 = 2 y favorita 3 = 1. `votes`: en cuántos votos aparece.
     */
    voteCounts: () => countVotes(db),
    /**
     * Podio final (1.º, 2.º y 3.º): los puestos que haya fijado el equipo facilitador
     * y, en los que no, los más votados que no estén ya en el podio.
     */
    podium: (): string[] => {
      const fijado = (db.event.podium ?? []).slice(0, 3)
      const libres = countVotes(db).map((r) => r.teamId).filter((t) => !fijado.includes(t))
      return [0, 1, 2].map((i) => fijado[i] || libres.shift() || '')
    },
    resultsPublished: () => !!db.event.resultsPublished,
  }
}

/** Recuento por puntos (favorita 1 = 3, 2 = 2, 3 = 1), de más a menos */
function countVotes(db: { votes: readonly { teamIds: readonly string[] }[]; teams: readonly { id: string }[] }) {
  const points: Record<string, number> = {}
  const votes: Record<string, number> = {}
  for (const v of db.votes) {
    v.teamIds.forEach((t, i) => {
      points[t] = (points[t] ?? 0) + VOTE_POINTS[i]
      votes[t] = (votes[t] ?? 0) + 1
    })
  }
  return db.teams
    .map((t) => ({ teamId: t.id, points: points[t.id] ?? 0, votes: votes[t.id] ?? 0 }))
    .sort((a, b) => b.points - a.points || b.votes - a.votes)
}

/** Puntos de cada puesto: favorita 1, 2 y 3 (decidido por Laura) */
export const VOTE_POINTS = [3, 2, 1] as const

/** Identificador del voto: equipo y posición de la persona en su equipo. Nunca el nombre. */
function voterCode(teamId: string, memberIndex: number) {
  return `${teamId}-${memberIndex}`
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

/** El digital owner da por terminado el reto de las fichas individuales */
export function finishPremortem(teamId: string) {
  const s = state.setups.find((x) => x.teamId === teamId)
  if (!s) return
  s.premortemDone = true
  saveQuiet('setups', s)
}

/** El equipo ha pasado la pantalla previa de una dinámica (el sobre de las cartas) */
export function markIntroSeen(teamId: string, dynamicId: string) {
  const p = progressOf(teamId)
  p.introSeen = { ...(p.introSeen ?? {}), [dynamicId]: true }
  saveQuiet('progress', p)
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

/** Panel: cambia la imagen de una foto ya subida (se queda en la misma dinámica y con el mismo tipo) */
export async function replacePhoto(photoId: string, dataUrl: string) {
  const p = state.photos.find((x) => x.id === photoId)
  if (!p) return
  p.url = isRemote ? await uploadPhoto(`${p.teamId}/${p.dynamicId}-${uid()}.jpg`, dataUrl) : dataUrl
  await save('photos', p)
}

/** Panel: quita una foto del expediente del equipo */
export async function removePhoto(photoId: string) {
  const i = state.photos.findIndex((x) => x.id === photoId)
  if (i < 0) return
  state.photos.splice(i, 1)
  if (isRemote) await deleteRow('photos', photoId)
}

/**
 * Pasa a la siguiente dinámica. Solo si la actual tiene su foto
 * y el equipo facilitador ya ha abierto la siguiente.
 */
export function nextDynamic(teamId: string) {
  const p = progressOf(teamId)
  const current = TEAM_DYNAMICS[p.current]
  if (!current || !state.photos.some((x) => x.teamId === teamId && x.dynamicId === current.id && x.kind !== 'other')) return
  if (p.current >= allowedFor(teamId)) return
  p.current += 1
  saveQuiet('progress', p)
  syncPhases(teamId)
}

/**
 * Hace avanzar a un equipo que ya tiene la foto aunque no tenga su pantalla abierta
 * (por ejemplo, si el equipo facilitador ha subido la foto por él desde el panel).
 * Mismas reglas que en su pantalla: solo si el equipo facilitador ya ha abierto la siguiente.
 * `porElPanel`: la foto la ha subido el equipo facilitador; el aviso «Volved a la sala» ya no hace falta.
 */
export function advanceIfReady(teamId: string, porElPanel = false) {
  const p = state.progress.find((x) => x.teamId === teamId)
  if (!p) return
  const current = TEAM_DYNAMICS[p.current]
  if (!current) return
  if (!state.photos.some((x) => x.teamId === teamId && x.dynamicId === current.id && x.kind !== 'other')) return
  const salaKey = `sala-${current.id}`
  if (porElPanel && backToRoomAfter(current) && !p.introSeen?.[salaKey]) {
    // La foto la ha subido el equipo facilitador: el aviso «Volved a la sala» ya no hace falta
    p.introSeen = { ...(p.introSeen ?? {}), [salaKey]: true }
    saveQuiet('progress', p)
  }
  if (p.current >= allowedFor(teamId)) return
  if (backToRoomAfter(current) && !p.introSeen?.[salaKey]) return // lo verá en su pantalla y pulsará «Seguir»
  nextDynamic(teamId)
}

/**
 * ¿Puede el equipo pasar solo a la siguiente dinámica cuando se le acabe el tiempo?
 * Sí, salvo al final de una fase (vuelven a la sala principal) o si el equipo
 * facilitador lo ha retenido (en el panel sale «Retenido»). Decidido por Laura el 16/11/2026.
 */
export function canAutoAdvance(teamId: string): boolean {
  const p = state.progress.find((x) => x.teamId === teamId)
  const current = TEAM_DYNAMICS[p?.current ?? 0]
  const held = p?.limit !== undefined && p.limit <= groupOpen()
  return !!current && !backToRoomAfter(current) && !held
}

/** Tiempo terminado y foto subida: pasa solo a la siguiente, con su cronómetro empezando ahora */
export function autoAdvance(teamId: string) {
  if (!canAutoAdvance(teamId)) return
  const p = progressOf(teamId)
  const current = TEAM_DYNAMICS[p.current]
  const next = TEAM_DYNAMICS[p.current + 1]
  if (!current || !next) return
  if (!state.photos.some((x) => x.teamId === teamId && x.dynamicId === current.id && x.kind !== 'other')) return
  const opened = openedAtFor(teamId, current.id)
  if (!opened || new Date(opened).getTime() + current.minutes * 60_000 > Date.now()) return
  p.current += 1
  // Si el grupo aún no la ha abierto, su cronómetro empieza ahora para este equipo
  if (!state.event.openedAt?.[next.id]) p.openedAt = { ...(p.openedAt ?? {}), [next.id]: now() }
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

/** El equipo ha leído un aviso del panel («¡Entendido!») */
export function ackAlert(teamId: string, alertId: string) {
  const p = progressOf(teamId)
  if (p.alertsSeen?.includes(alertId)) return
  p.alertsSeen = [...(p.alertsSeen ?? []), alertId]
  saveQuiet('progress', p)
}

// ---------------------------------------------------------------------------
// Escritura · equipo facilitador

/** Guarda el titular de la portada de un equipo (para la votación) */
export function setCoverHeadline(teamId: string, headline: string) {
  let c = state.covers.find((x) => x.teamId === teamId)
  if (c) c.headline = headline.trim()
  else {
    state.covers.push({ teamId, headline: headline.trim(), whatChanged: '', howItStarted: '' })
    c = state.covers[state.covers.length - 1]
  }
  saveQuiet('covers', c)
}

/** Lanza un aviso a todos los equipos o a uno (target = 'all' o la letra del equipo) */
export function launchAlert(target: string, title: string, body = '') {
  const a = { id: uid(), target, title: title.trim(), body: body.trim(), launchedAt: now() }
  state.alerts.push(a)
  saveQuiet('alerts', a)
}
// ---------------------------------------------------------------------------
/** «Voy yo»: una persona del equipo facilitador va a atender la petición */
export function takeHelp(id: string, name: string) {
  const h = state.helpRequests.find((x) => x.id === id)
  if (!h || h.attendedAt) return
  h.takenBy = name
  saveQuiet('helpRequests', h)
}

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

/** Guarda las personas de cada equipo para todos los dispositivos (panel · «Personas de cada equipo») */
export function saveRoster(roster: Record<string, string[]>) {
  const limpio: Record<string, string[]> = {}
  for (const [k, v] of Object.entries(roster)) {
    const nombres = v.map((n) => n.trim()).filter(Boolean)
    if (nombres.length) limpio[k] = nombres
  }
  state.event.roster = limpio
  saveQuiet('event')
}

/** Revelar los ámbitos en la sala. Ya NO abre el Titular: eso se hace siempre con «Abrir para todos». */
export function revealAreas(revealed: boolean) {
  state.event.areasRevealed = revealed
  saveQuiet('event')
}

/**
 * Abre la siguiente dinámica para TODOS los equipos y arranca su cronómetro.
 * Abrir más allá de la última da la jornada de equipo por terminada.
 */
export function openNextDynamic() {
  const next = Math.min(groupOpen() + 1, TEAM_DYNAMICS.length)
  state.event.openDynamic = next
  if (next === 0) state.event.areasRevealed = true
  const dyn = TEAM_DYNAMICS[next]
  if (dyn) state.event.openedAt = { ...(state.event.openedAt ?? {}), [dyn.id]: now() }
  saveQuiet('event')
  // Los equipos que ya tienen la foto pasan, aunque no tengan su pantalla abierta
  for (const t of state.teams) advanceIfReady(t.id)
  // La sala acompaña: salta al momento de la escaleta de esa dinámica (solo hacia delante).
  if (dyn) advanceRoomTo(ROOM_STEP_OF_DYNAMIC[dyn.id] ?? dyn.id)
}

/** Momento de la escaleta (AGENDA) de cada dinámica de equipo, cuando no se llama igual */
const ROOM_STEP_OF_DYNAMIC: Record<string, string> = {}

function advanceRoomTo(stepId: string) {
  const i = AGENDA.findIndex((s) => s.id === stepId)
  if (i > state.room.step) setRoomStep(i)
}

/**
 * Lleva a TODOS a la dinámica j (decidido por Laura el 18/11/2026):
 * · Hacia atrás: los equipos que iban por delante vuelven también a esa dinámica.
 * · Hacia delante: se abre para todos (los equipos pasan al subir la foto, como siempre).
 * El cronómetro de esa dinámica empieza de nuevo y la sala salta a ese momento.
 */
export function goToDynamic(j: number) {
  const k = Math.max(0, Math.min(j, TEAM_DYNAMICS.length - 1))
  const dyn = TEAM_DYNAMICS[k]
  state.event.openDynamic = k
  state.event.openedAt = { ...(state.event.openedAt ?? {}), [dyn.id]: now() }
  saveQuiet('event')
  for (const p of state.progress) {
    if (p.current <= k) continue
    p.current = k
    p.limit = undefined
    // Que vuelvan a ver los avisos de esa parte («Volved a la sala», cambio de pantalla…)
    if (p.introSeen) for (const d of TEAM_DYNAMICS.slice(k)) delete p.introSeen[`sala-${d.id}`]
    saveQuiet('progress', p)
  }
  const i = AGENDA.findIndex((s) => s.id === (ROOM_STEP_OF_DYNAMIC[dyn.id] ?? dyn.id))
  if (i >= 0) setRoomStep(i)
}

/** Vuelve a la dinámica anterior para todos: los equipos que iban por delante también vuelven */
export function closeLastDynamic() {
  goToDynamic(groupOpen() - 1)
}

/**
 * Excepción para un equipo:
 * · 'hold'   → se queda donde está aunque el grupo avance
 * · 'pass'   → puede pasar ya a la siguiente, aunque el grupo no
 * · 'group'  → vuelve a seguir al grupo
 */
export function setTeamPace(teamId: string, mode: 'hold' | 'pass' | 'group') {
  const p = progressOf(teamId)
  if (mode === 'group') {
    p.limit = undefined
  } else if (mode === 'hold') {
    p.limit = p.current
  } else {
    p.limit = Math.min(p.current + 1, TEAM_DYNAMICS.length)
    const dyn = TEAM_DYNAMICS[p.limit]
    if (dyn) p.openedAt = { ...(p.openedAt ?? {}), [dyn.id]: now() }
  }
  saveQuiet('progress', p)
}

// ---------------------------------------------------------------------------
// Votación
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Lo que recuerda cada dispositivo (quién es esta persona, quién entró en el ordenador)
// Va unido a la jornada: al dejar todo en blanco o restaurar, se olvida.
// ---------------------------------------------------------------------------
export function rememberOnDevice(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify({ jornada: state.event.jornada ?? '', value })) } catch { /* sin almacenamiento */ }
}
export function recallOnDevice<T>(key: string): T | null {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? 'null') as { jornada?: string; value?: T } | null
    if (!raw || raw.jornada === undefined || raw.jornada !== (state.event.jornada ?? '')) return null
    return raw.value ?? null
  } catch { return null }
}
export function forgetOnDevice(key: string) {
  try { localStorage.removeItem(key) } catch { /* nada */ }
}

export function setVotingOpen(open: boolean) {
  state.event.votingOpen = open
  saveQuiet('event')
}

/** «Seguir el horario»: el momento «Ahora» de la escaleta avanza solo con la hora */
export function setSeguirHorario(on: boolean) {
  state.event.seguirHorario = on
  saveQuiet('event')
}

/** Podio final que decide el equipo facilitador (letras de los equipos, de 1.º a 3.º) */
export function setPodium(teamIds: string[]) {
  state.event.podium = teamIds.slice(0, 3)
  saveQuiet('event')
}

/** Publica (o retira) los resultados para los participantes */
export function publishResults(published: boolean) {
  state.event.resultsPublished = published
  saveQuiet('event')
}

/**
 * Guarda el voto de una persona: 3 equipos distintos, ninguno el suyo, una sola vez.
 * Devuelve un mensaje de error para enseñar en pantalla, o '' si ha ido bien.
 */
export async function castVote(teamId: string, memberIndex: number, choices: string[]): Promise<string> {
  if (!state.event.votingOpen) return 'La votación está cerrada.'
  const code = voterCode(teamId, memberIndex)
  if (state.votes.some((v) => v.code === code)) return 'Ya has votado.'
  const unique = [...new Set(choices.filter(Boolean))]
  if (unique.length !== 3) return 'Elige tres iniciativas distintas, una por puesto.'
  if (unique.includes(teamId)) return 'No puedes votar a tu propio equipo.'
  const vote = { code, teamIds: unique as [string, string, string], createdAt: now() }
  try {
    await save('votes', vote)
  } catch {
    return 'No se ha podido guardar el voto. Comprueba la conexión y vuelve a intentarlo.'
  }
  if (!state.votes.some((v) => v.code === code)) state.votes.push(vote)
  return ''
}

/**
 * Panel: anula el voto de una persona (por ejemplo, si alguien votó con el nombre de otra).
 * Esa persona puede volver a votar.
 */
export async function removeVote(teamId: string, memberIndex: number) {
  const code = voterCode(teamId, memberIndex)
  pending.delete(keyOf({ coleccion: 'votes', id: code }))
  if (isRemote) await deleteRow('votes', code)
  const i = state.votes.findIndex((v) => v.code === code)
  if (i >= 0) state.votes.splice(i, 1)
}

async function replaceEverything(next: Database) {
  pending.clear()
  persistPending()
  unsaved.value = ''
  if (isRemote) {
    await deleteAll()
    await upsertRows(toRows(next))
  }
  replaceState(next)
}

/** Vuelve a los datos de ejemplo (equipo 07). Para preparar y probar. */
export const resetToSeed = () => replaceEverything(createSeed())

/**
 * Deja todo en blanco, como el día del evento.
 * Se queda la lista de personas de cada equipo (se cargó aparte y no es trabajo de los equipos).
 */
export const clearAll = () => {
  const next = createBlank()
  if (state.event.roster && Object.keys(state.event.roster).length) next.event.roster = clone(state.event.roster)
  return replaceEverything(next)
}

// ---------------------------------------------------------------------------
// Copia de seguridad: todo lo que hay ahora, en un archivo, y vuelta atrás desde ese archivo.
// Las fotos se guardan como su dirección (las imágenes siguen en el almacenamiento).
// ---------------------------------------------------------------------------
export function backupJson(): string {
  return JSON.stringify({ tipo: 'las-rozas-2040-copia', fecha: new Date().toISOString(), datos: clone(state) }, null, 1)
}

/** Devuelve un mensaje de error para la pantalla, o '' si se ha recuperado bien */
export async function restoreBackup(json: string): Promise<string> {
  let datos: Database
  try {
    const raw = JSON.parse(json) as { tipo?: string; datos?: Database }
    if (raw.tipo !== 'las-rozas-2040-copia' || !raw.datos || !Array.isArray(raw.datos.teams) || !raw.datos.teams.length) {
      return 'Este archivo no es una copia de seguridad de la plataforma.'
    }
    datos = raw.datos
  } catch {
    return 'No se ha podido leer el archivo.'
  }
  // Por si la copia es de una versión anterior: completar lo que falte
  const base = createBlank()
  for (const k of Object.keys(base) as (keyof Database)[]) {
    if (datos[k] === undefined) (datos as unknown as Record<string, unknown>)[k] = base[k]
  }
  datos.version = DB_VERSION
  try {
    await replaceEverything(datos)
  } catch {
    return 'No se ha podido recuperar la copia. Comprobad la conexión y probad otra vez.'
  }
  return ''
}

// Arranque: al final, cuando ya está declarado todo lo que usa (también la cola de pendientes)
if (isRemote) initRemote()
