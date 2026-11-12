<script setup lang="ts">
// Escaleta de la jornada en forma de línea de tiempo, para el panel.
// Marca lo hecho, dónde está la sala y qué dinámica tienen abierta los equipos.
// Al pulsar un momento, la presentación de la sala salta ahí.
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { AGENDA } from '../data/agenda'
import { TEAM_DYNAMICS } from '../data/dynamics'
import { setRoomStep, useStore } from '../data/store'

const store = useStore()
const actual = computed(() => store.db.room.step)
const pista = ref<HTMLElement>()

/** Dinámicas de equipo que corresponden a cada momento de la escaleta */
const DYNAMICS_OF_STEP: Record<string, string[]> = { 'a-quien': ['a-quien', 'como-podriamos'] }
const abierta = computed(() => TEAM_DYNAMICS[store.openDynamic()]?.id)
function abiertaEnEquipos(stepId: string) {
  const ids = DYNAMICS_OF_STEP[stepId] ?? [stepId]
  return !!abierta.value && ids.includes(abierta.value)
}

function ir(i: number) {
  if (i === actual.value) return
  if (confirm(`¿Llevar la presentación de la sala a «${AGENDA[i].title}» (${AGENDA[i].time})?`)) setRoomStep(i)
}

// Mantiene a la vista el momento actual (centrado en la línea, sin mover la página)
async function centrar(smooth = true) {
  await nextTick()
  const el = pista.value?.querySelector<HTMLElement>('.actual')
  if (!pista.value || !el) return
  const left = el.offsetLeft - pista.value.clientWidth / 2 + el.clientWidth / 2
  pista.value.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
}
onMounted(() => centrar(false))
watch(actual, () => centrar())
</script>

<template>
  <section class="card escaleta" aria-label="Escaleta de la jornada">
    <div class="escaleta__cab">
      <span class="kicker">Escaleta de la jornada</span>
      <span class="leyenda">
        <span><i class="p p--hecho"></i> Hecho</span>
        <span><i class="p p--actual"></i> En la sala</span>
        <span><i class="p p--equipos"></i> Abierta para los equipos</span>
      </span>
    </div>
    <ol ref="pista" class="pista">
      <li
        v-for="(s, i) in AGENDA"
        :key="s.id"
        :class="{ hecho: i < actual, actual: i === actual, equipos: abiertaEnEquipos(s.id), equipo: s.who === 'Equipo' }"
      >
        <button type="button" :title="s.description" @click="ir(i)">
          <span class="hora">{{ s.time }}</span>
          <span class="punto" aria-hidden="true"></span>
          <span class="titulo">{{ s.title }}</span>
          <span class="meta">{{ s.who }} · {{ s.minutes }} min</span>
          <span v-if="abiertaEnEquipos(s.id)" class="etq">Equipos aquí</span>
        </button>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.escaleta{gap:.8rem}
.escaleta__cab{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem 1rem;align-items:center}
.leyenda{display:flex;flex-wrap:wrap;gap:.3rem 1rem;font-size:.75rem}
.leyenda span{display:inline-flex;align-items:center;gap:.35rem}
.p{display:inline-block;width:.75rem;height:.75rem;border-radius:50%;border:2px solid var(--c-green-mid);background:var(--c-white)}
.p--hecho{background:var(--c-green-deep);border-color:var(--c-green-deep)}
.p--actual{background:var(--c-innova-dark);border-color:var(--c-innova-dark);box-shadow:0 0 0 3px var(--c-green-light)}
.p--equipos{background:var(--c-innova);border-color:var(--c-innova);border-radius:.2rem}

.pista{list-style:none;margin:0;padding:.2rem 0 .6rem;display:flex;overflow-x:auto;scrollbar-width:thin;position:relative}
.pista li{scroll-margin-inline:2rem}
.pista li{flex:none;width:9.5rem;position:relative}
/* línea que une los puntos */
.pista li::before{content:"";position:absolute;top:2.05rem;left:0;right:0;height:3px;background:var(--c-green-light)}
.pista li.hecho::before{background:var(--c-green-deep)}
.pista li:first-child::before{left:50%}
.pista li:last-child::before{right:50%}
.pista button{position:relative;display:grid;justify-items:center;gap:.25rem;width:100%;padding:.2rem .4rem;border:0;background:none;font:inherit;text-align:center;cursor:pointer;color:var(--c-green-dark);border-radius:1rem}
.pista button:hover{background:var(--c-green-light)}
.hora{font-size:.75rem;font-weight:600;font-variant-numeric:tabular-nums;color:var(--c-innova-dark)}
.punto{width:1rem;height:1rem;border-radius:50%;background:var(--c-white);border:3px solid var(--c-green-mid);position:relative;z-index:1}
.titulo{font-size:.8rem;font-weight:500;line-height:1.25;color:var(--c-ink)}
.meta{font-size:.68rem}
.etq{font-size:.62rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:var(--c-innova);color:var(--c-ink);border-radius:99px;padding:.1em .6em}

.hecho .punto{background:var(--c-green-deep);border-color:var(--c-green-deep)}
.hecho .titulo,.hecho .meta{opacity:.6}
.equipo .punto{border-radius:.25rem}
.equipos .punto{background:var(--c-innova);border-color:var(--c-innova)}
.actual button{background:var(--c-green-light)}
.actual .punto{width:1.3rem;height:1.3rem;margin-block:-.15rem;background:var(--c-innova-dark);border-color:var(--c-white);box-shadow:0 0 0 3px var(--c-innova-dark)}
.actual .titulo{font-weight:700}
@media(prefers-reduced-motion:no-preference){.actual .punto{animation:pulso 2s ease-in-out infinite}}
@keyframes pulso{50%{box-shadow:0 0 0 6px color-mix(in srgb,var(--c-innova-dark) 25%,transparent)}}
</style>
