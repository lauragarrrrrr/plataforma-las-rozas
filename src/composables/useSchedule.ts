// ==========================================================
// HORARIO · qué toca en cada momento según la escaleta y la hora.
// · El día del evento (EVENT_DATE) usa la hora real.
// · Para probar otro día: «Probar como si fueran las…» en el panel (solo en ese ordenador).
// No abre nada para los equipos: eso lo hace siempre el equipo facilitador.
// ==========================================================
import { computed, ref } from 'vue'
import { AGENDA } from '../data/agenda'
import { EVENT_DATE } from '../data/config'
import { useNow } from './useNow'

const KEY = 'lr2040-hora-prueba'
interface Prueba { hhmm: string; desde: number }
function leer(): Prueba | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') } catch { return null }
}
/** Hora de prueba («10:55», puesta en un momento dado) o null para usar la hora real */
const prueba = ref<Prueba | null>(leer())
export const horaPrueba = computed(() => prueba.value?.hhmm ?? '')
export function setHoraPrueba(hhmm: string) {
  prueba.value = hhmm ? { hhmm, desde: Date.now() } : null
  try {
    if (prueba.value) localStorage.setItem(KEY, JSON.stringify(prueba.value))
    else localStorage.removeItem(KEY)
  } catch { /* sin almacenamiento: solo dura esta visita */ }
}

/** «09:45» → minutos desde medianoche */
export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function useSchedule() {
  const now = useNow()

  /** Minutos desde medianoche según el horario; null si hoy no es el día del evento y no hay hora de prueba */
  const minutos = computed<number | null>(() => {
    if (prueba.value) {
      // La hora de prueba avanza con el reloj desde que se puso (así se ve pasar el tiempo)
      return toMinutes(prueba.value.hhmm) + Math.max(0, now.value - prueba.value.desde) / 60_000
    }
    const d = new Date(now.value)
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return hoy === EVENT_DATE ? d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60 : null
  })

  const activo = computed(() => minutos.value !== null)

  /** Momento de la escaleta que toca ahora (el último que ya ha empezado); -1 antes de empezar */
  const indice = computed(() => {
    if (minutos.value === null) return -1
    let i = -1
    AGENDA.forEach((s, n) => { if (toMinutes(s.time) <= minutos.value!) i = n })
    return i
  })

  /** Hora que se muestra («11:03») */
  const reloj = computed(() => {
    if (minutos.value === null) return ''
    const m = Math.floor(minutos.value)
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  })

  /** Cuántos minutos hace que empezó el momento que toca */
  const desde = computed(() => (indice.value >= 0 && minutos.value !== null ? Math.floor(minutos.value - toMinutes(AGENDA[indice.value].time)) : 0))

  return { activo, indice, reloj, desde, minutos }
}
