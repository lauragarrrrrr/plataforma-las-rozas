<script setup lang="ts">
// Podio final: 1.º, 2.º y 3.º con su letra, ámbito y titular.
// Se usa en la página de resultados (grande, para proyectar), en el móvil y en la app del equipo.
import { computed } from 'vue'
import { useStore } from '../data/store'

const props = defineProps<{ grande?: boolean; miEquipo?: string }>()
const store = useStore()

const PUESTOS = ['1.º', '2.º', '3.º']
const podio = computed(() =>
  store.podium().map((id, i) => {
    const t = store.team(id)
    return { id, puesto: PUESTOS[i], ambito: t ? store.areaName(t.area) : '', titular: store.coverHeadline(id) }
  }).filter((p) => p.id),
)
</script>

<template>
  <ol class="podio" :class="{ 'podio--grande': props.grande }">
    <li v-for="(p, i) in podio" :key="p.id" class="puesto" :class="[`puesto--${i + 1}`, { 'puesto--mio': p.id === miEquipo }]">
      <span class="puesto__num">{{ p.puesto }}</span>
      <span class="puesto__letra">{{ p.id }}</span>
      <div class="puesto__txt">
        <small class="puesto__cab">Las Rozas Times · Equipo {{ p.id }} · {{ p.ambito }}</small>
        <strong v-if="p.titular" class="puesto__titular">{{ p.titular }}</strong>
        <em v-if="p.id === miEquipo" class="puesto__mio">¡Vuestro equipo!</em>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.podio{list-style:none;margin:0;padding:0;display:grid;gap:.7rem}
.puesto{display:grid;grid-template-columns:auto auto 1fr;align-items:center;gap:.9rem;padding:1rem 1.2rem;border-radius:var(--radius-card);background:var(--c-white);color:var(--c-ink)}
.puesto--1{background:var(--gradient-dark);color:var(--c-white)}
.puesto__num{font-size:1.1rem;font-weight:700;color:var(--c-innova-dark);min-width:2.2rem}
.puesto--1 .puesto__num{color:var(--c-green-mid)}
.puesto__letra{display:grid;place-items:center;width:3rem;height:3rem;border-radius:50%;background:var(--gradient-anio);color:var(--c-white);font-size:1.5rem;font-weight:700}
.puesto__txt{display:grid;gap:.2rem;min-width:0}
.puesto__cab{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;color:var(--c-innova-dark)}
.puesto--1 .puesto__cab{color:var(--c-green-mid)}
.puesto__titular{font-family:var(--font-paper);font-size:1.15rem;line-height:1.2}
.puesto__mio{font-style:normal;font-weight:700;font-size:.85rem;color:var(--c-innova-dark)}
.puesto--1 .puesto__mio{color:var(--c-green-mid)}

/* Grande: para proyectar en la sala */
.podio--grande{gap:1.2rem}
.podio--grande .puesto{padding:1.6rem 2rem;gap:1.6rem}
.podio--grande .puesto__num{font-size:2.4rem;min-width:4rem}
.podio--grande .puesto__letra{width:5.5rem;height:5.5rem;font-size:3rem}
.podio--grande .puesto__cab{font-size:1rem}
.podio--grande .puesto__titular{font-size:clamp(1.6rem,2.6vw,2.6rem)}
.podio--grande .puesto--1 .puesto__titular{font-size:clamp(2rem,3.2vw,3.2rem)}
/* Sobre el fondo oscuro de la sala, el 1.º destaca en verde claro */
.podio--grande .puesto--1{background:var(--gradient-verde);color:var(--c-ink)}
.podio--grande .puesto--1 .puesto__num,.podio--grande .puesto--1 .puesto__cab{color:var(--c-green-deep)}
</style>
