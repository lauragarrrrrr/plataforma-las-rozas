<script setup lang="ts">
// Cronómetro de una dinámica, arriba del todo y en grande.
// «Quedan 18:32 de 20 min» y una barra que se VACÍA según pasa el tiempo.
// En los últimos 2 minutos pasa a rubí (aviso) y la cifra late suave.
import { computed } from 'vue'
import { formatClock } from '../composables/useNow'

const props = defineProps<{ remaining: number; minutes: number; photoDone?: boolean }>()

const total = computed(() => props.minutes * 60_000)
const left = computed(() => Math.min(total.value, Math.max(0, props.remaining)))
const pct = computed(() => Math.max(0, Math.min(100, (left.value / total.value) * 100)))
const ended = computed(() => props.remaining <= 0)
const hurry = computed(() => !ended.value && props.remaining <= 2 * 60_000)
const label = computed(() => {
  if (ended.value) return props.photoDone ? '¡Tiempo terminado, esperad!' : 'Tiempo terminado'
  if (props.photoDone) return 'Foto subida ✓ · Quedan'
  return hurry.value ? '¡Último esfuerzo! Quedan' : 'Quedan'
})
</script>

<template>
  <div class="card reloj" :class="{ 'reloj--prisa': hurry && !photoDone, 'reloj--fin': ended }" role="timer" aria-live="off">
    <div class="reloj__cabecera">
      <span class="kicker">{{ label }}</span>
      <span class="reloj__total">de {{ minutes }} min</span>
    </div>
    <strong class="reloj__cifra">{{ formatClock(left) }}</strong>
    <div class="reloj__barra" aria-hidden="true"><span :style="{ width: `${pct}%` }"></span></div>
  </div>
</template>

<style scoped>
.reloj{display:grid;gap:.7rem}
.reloj__cabecera{display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
.reloj__total{font-size:.85rem;color:var(--c-green-dark)}
.reloj__cifra{font-size:clamp(3.6rem,8vw,5.5rem);font-weight:600;letter-spacing:-.05em;color:var(--c-ink);font-variant-numeric:tabular-nums;line-height:.95}
.reloj__barra{height:1rem;border-radius:99px;background:var(--c-green-light);overflow:hidden}
.reloj__barra span{display:block;height:100%;border-radius:99px;background:var(--gradient-verde);transition:width 1s linear}

.reloj--prisa .kicker,.reloj--fin .kicker{color:var(--c-rubi)}
.reloj--prisa .reloj__cifra{color:var(--c-rubi);animation:latir-reloj 1.6s ease-in-out infinite}
.reloj--prisa .reloj__barra span{background:var(--c-rubi)}
.reloj--fin .reloj__cifra{color:var(--c-rubi)}
@keyframes latir-reloj{50%{opacity:.55}}
@media (prefers-reduced-motion: reduce){.reloj--prisa .reloj__cifra{animation:none}}
</style>
