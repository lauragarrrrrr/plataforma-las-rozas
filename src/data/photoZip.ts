// ==========================================================
// DESCARGAR TODAS LAS FOTOS EN UN ZIP, por carpetas de equipo.
// «Equipo A/01 Titular positivo.jpg», «Equipo A/00 Fichas individuales 1.jpg»…
// Sin librerías: las fotos ya van comprimidas (JPG), así que el ZIP solo las guarda.
// ==========================================================
import { ALL_DYNAMICS } from './dynamics'
import type { Photo, Team } from './types'

// --- ZIP mínimo (sin compresión) -------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(data: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function dosTime(d: Date) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2)
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
  return { time, date }
}

interface ZipEntry { name: string; data: Uint8Array; date: Date }

function buildZip(entries: ZipEntry[]): Blob {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  for (const e of entries) {
    const name = enc.encode(e.name)
    const crc = crc32(e.data)
    const { time, date } = dosTime(e.date)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // nombres en UTF-8 (tildes)
    local.setUint16(8, 0, true) // sin compresión
    local.setUint16(10, time, true)
    local.setUint16(12, date, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, e.data.length, true)
    local.setUint32(22, e.data.length, true)
    local.setUint16(26, name.length, true)
    parts.push(new Uint8Array(local.buffer), name, e.data)

    const cen = new DataView(new ArrayBuffer(46))
    cen.setUint32(0, 0x02014b50, true)
    cen.setUint16(4, 20, true)
    cen.setUint16(6, 20, true)
    cen.setUint16(8, 0x0800, true)
    cen.setUint16(10, 0, true)
    cen.setUint16(12, time, true)
    cen.setUint16(14, date, true)
    cen.setUint32(16, crc, true)
    cen.setUint32(20, e.data.length, true)
    cen.setUint32(24, e.data.length, true)
    cen.setUint16(28, name.length, true)
    cen.setUint32(42, offset, true)
    central.push(new Uint8Array(cen.buffer), name)
    offset += 30 + name.length + e.data.length
  }
  const centralSize = central.reduce((n, p) => n + p.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, entries.length, true)
  end.setUint16(10, entries.length, true)
  end.setUint32(12, centralSize, true)
  end.setUint32(16, offset, true)
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)] as BlobPart[], { type: 'application/zip' })
}

// --- Fotos de la plataforma --------------------------------------------------------
/** Quita lo que no puede ir en un nombre de archivo (/ \ : * ? « » …) */
const clean = (s: string) => s.replace(/[\\/:*?"<>|«»¿?…]/g, '').replace(/\s+/g, ' ').replace(/[ .]+$/, '').trim()

function extension(blob: Blob) {
  if (blob.type.includes('png')) return 'png'
  if (blob.type.includes('webp')) return 'webp'
  return 'jpg'
}

/**
 * Descarga todas las fotos y prepara el ZIP. `onProgress(hechas, total)` para enseñar el avance.
 * Devuelve el ZIP y las fotos que no se han podido descargar.
 */
export async function photosZip(
  photos: readonly Readonly<Photo>[],
  teams: readonly Readonly<Team>[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ zip: Blob; failed: number }> {
  const order = new Map(ALL_DYNAMICS.map((d, i) => [d.id, i]))
  const titleOf = (id?: string) => ALL_DYNAMICS.find((d) => d.id === id)?.title ?? 'Otras fotos'
  const teamName = (id: string) => teams.find((t) => t.id === id)?.name ?? `Equipo ${id}`

  // Cuántas fotos hay de cada equipo y dinámica, para numerarlas solo si hay varias
  const count = new Map<string, number>()
  for (const p of photos) count.set(`${p.teamId}|${p.dynamicId}`, (count.get(`${p.teamId}|${p.dynamicId}`) ?? 0) + 1)
  const seen = new Map<string, number>()

  const sorted = photos.slice().sort((a, b) =>
    a.teamId.localeCompare(b.teamId) ||
    (order.get(a.dynamicId ?? '') ?? 99) - (order.get(b.dynamicId ?? '') ?? 99) ||
    a.createdAt.localeCompare(b.createdAt))

  const entries: ZipEntry[] = []
  let failed = 0
  for (const [i, p] of sorted.entries()) {
    try {
      const blob = await (await fetch(p.url)).blob()
      const key = `${p.teamId}|${p.dynamicId}`
      const n = (seen.get(key) ?? 0) + 1
      seen.set(key, n)
      const num = String(order.get(p.dynamicId ?? '') ?? 99).padStart(2, '0')
      const suffix = (count.get(key) ?? 0) > 1 ? ` ${n}` : ''
      const name = `${clean(teamName(p.teamId))}/${num} ${clean(titleOf(p.dynamicId))}${suffix}.${extension(blob)}`
      entries.push({ name, data: new Uint8Array(await blob.arrayBuffer()), date: new Date(p.createdAt) })
    } catch {
      failed++
    }
    onProgress?.(i + 1, sorted.length)
  }
  return { zip: buildZip(entries), failed }
}

/** Guarda un archivo en el ordenador */
export function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
