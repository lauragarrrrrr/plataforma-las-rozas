<script setup lang="ts">
// Panel · Cronómetro de la dinámica abierta para todos (el mismo que ven los equipos)
// Fijo arriba del panel, con cuántos equipos ya han subido su foto.
import { computed } from 'vue'
import { TEAM_DYNAMICS } from '../data/dynamics'
import { useStore } from '../data/store'
import { useNow } from '../composables/useNow'
import DynamicTimer from './DynamicTimer.vue'

const store = useStore()
const now = useNow()

const i = computed(() => store.openDynamic())
const din = computed(() => (i.value >= 0 ? TEAM_DYNAMICS[i.value] : undefined))
const desde = computed(() => (din.value ? store.db.event.openedAt?.[din.value.id] : undefined))
const quedan = computed(() => {
  if (!din.value) return 0
  if (!desde.value) return din.value.minutes * 60_000
  return Date.parse(desde.value) + din.value.minutes * 60_000 - now.value
})
/** Equipos que ya han entrado y cuántos tienen la foto de esta dinámica */
const empezados = computed(() => store.db.teams.filter((t) => store.setup(t.id)?.digitalOwner))
const conFoto = computed(() => (din.value ? empezados.value.filter((t) => store.photoFor(t.id, din.value!.id)).length : 0))
</script>

<template>
  <div class="reloj-panel">
    <template v-if="din">
      <div class="reloj-panel__txt">
        <span class="kicker">Abierta para los equipos · {{ i + 1 }} de {{ TEAM_DYNAMICS.length }}</span>
        <strong>{{ din.title }}</strong>
        <small>{{ conFoto }} de {{ empezados.length }} equipos con la foto subida</small>
      </div>
      <DynamicTimer :remaining="quedan" :minutes="din.minutes" compact />
    </template>
    <p v-else class="reloj-panel__nada">Todavía no hay ninguna dinámica abierta para los equipos.</p>
  </div>
</template>

<style scoped>
.reloj-panel{position:sticky;top:0;z-index:30;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.8rem 1.5rem;padding:.8rem 1.2rem;border-radius:1.4rem;background:var(--c-white);box-shadow:0 6px 18px -12px color-mix(in srgb,var(--c-green-deep) 60%,transparent)}
.reloj-panel__txt{display:grid;gap:.1rem}
.reloj-panel__txt strong{font-size:1.25rem;font-weight:600;letter-spacing:-.02em;color:var(--c-ink);line-height:1.2}
.reloj-panel__txt small{font-size:.85rem}
.reloj-panel__nada{margin:0;font-size:.95rem}
</style>
