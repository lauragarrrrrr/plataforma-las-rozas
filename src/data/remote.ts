// ==========================================================
// Conexión con Supabase (solo la usa store.ts).
//
// Todo se guarda en UNA tabla, `registros`: cada fila es un elemento de una
// colección (un equipo, un mensaje del chat, una foto…) con sus datos en JSON.
// Las fotos van al almacenamiento `fotos`. Los cambios llegan en tiempo real.
// Sin las variables VITE_SUPABASE_*, la plataforma funciona solo en el navegador.
// ==========================================================
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
/** VITE_SUPABASE_OFF=1 obliga a trabajar solo en el navegador (para probar sin tocar los datos compartidos) */
const off = import.meta.env.VITE_SUPABASE_OFF === '1'

export const sb: SupabaseClient | null = url && key && !off ? createClient(url, key) : null

/** Colecciones con un solo elemento */
export const SINGLETONS = ['meta', 'event', 'room'] as const
/** Colecciones que son listas, y el campo que identifica cada elemento */
export const LISTS = {
  teams: 'id', setups: 'teamId', progress: 'teamId', chat: 'id', helpRequests: 'id', photos: 'id',
  covers: 'teamId', initiatives: 'teamId', headlines: 'teamId', signals: 'id', dossiers: 'teamId',
  ideas: 'id', alerts: 'id', voteCodes: 'code', votes: 'code', assessments: 'teamId',
} as const

export type ListName = keyof typeof LISTS
export type Collection = ListName | (typeof SINGLETONS)[number]

export interface Row { coleccion: string; id: string; datos: unknown }

const TABLE = 'registros'
const BUCKET = 'fotos'

/** Convierte toda la base de datos en filas */
export function toRows(db: Database): Row[] {
  const rows: Row[] = [
    { coleccion: 'meta', id: 'meta', datos: { version: db.version, demoTeamIds: db.demoTeamIds } },
    { coleccion: 'event', id: 'event', datos: db.event },
    { coleccion: 'room', id: 'room', datos: db.room },
  ]
  for (const [name, field] of Object.entries(LISTS) as [ListName, string][]) {
    for (const item of db[name] as unknown as Record<string, string>[]) {
      rows.push({ coleccion: name, id: String(item[field]), datos: item })
    }
  }
  return rows
}

export async function fetchAll(): Promise<Row[]> {
  const { data, error } = await sb!.from(TABLE).select('coleccion,id,datos').range(0, 19999)
  if (error) throw error
  return data as Row[]
}

export async function upsertRows(rows: Row[]) {
  if (!rows.length) return
  const { error } = await sb!.from(TABLE).upsert(rows.map((r) => ({ ...r, actualizado: new Date().toISOString() })))
  if (error) throw error
}

export async function deleteAll() {
  const { error } = await sb!.from(TABLE).delete().neq('coleccion', '')
  if (error) throw error
}

/** Escucha los cambios que hacen otros dispositivos */
export function subscribe(onChange: (row: Row, deleted: boolean) => void) {
  return sb!
    .channel('registros')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, (payload) => {
      if (payload.eventType === 'DELETE') onChange(payload.old as Row, true)
      else onChange(payload.new as Row, false)
    })
    .subscribe()
}

/** Sube una foto (data URL) y devuelve su dirección pública */
export async function uploadPhoto(path: string, dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob()
  const { error } = await sb!.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: true })
  if (error) throw error
  return sb!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
