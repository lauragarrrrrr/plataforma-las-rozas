<script setup lang="ts">
// Etiqueta con el estado de una fase: completada, en curso o bloqueada
import { PHASE_STATE_LABEL } from '../data/config'
import type { PhaseState } from '../data/types'

defineProps<{ state: PhaseState }>()
</script>

<template>
  <span class="estado" :class="`estado--${state}`">{{ PHASE_STATE_LABEL[state] }}</span>
</template>

<style scoped>
.estado{justify-self:start;display:inline-block;border-radius:99px;padding:.2em .75em;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
.estado--active{background:var(--c-innova);color:var(--c-ink)}
.estado--done{background:var(--c-green-deep);color:var(--c-white)}
.estado--locked{background:var(--c-white);color:var(--c-green-dark);box-shadow:inset 0 0 0 1.5px var(--c-gris-10)}
</style>
