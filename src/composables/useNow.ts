// Hora actual que se actualiza cada segundo (para los cronómetros)
import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useNow() {
  const now = ref(Date.now())
  let timer: number | undefined
  onMounted(() => { timer = window.setInterval(() => (now.value = Date.now()), 1000) })
  onBeforeUnmount(() => window.clearInterval(timer))
  return now
}

/** «07:45» a partir de milisegundos */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
