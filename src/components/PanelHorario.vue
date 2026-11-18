<script setup lang="ts">
// Panel · Horario: qué toca según la hora y la escaleta.
// SOLO AVISA: no mueve nada solo (decidido el 18/11/2026). El equipo facilitador pasa cada momento.
// · Si según la hora toca un momento posterior a «Ahora», sale el botón para marcarlo.
// · Si toca una dinámica de equipo que no está abierta, sale el botón para abrirla.
// · «Probar como si fueran las…»: para probar antes del evento (solo en este ordenador).
import { computed } from 'vue'
import { AGENDA } from '../data/agenda'
import { TEAM_DYNAMICS } from '../data/dynamics'
import { setRoomStep, useStore } from '../data/store'
import { horaPrueba, setHoraPrueba, useSchedule } from '../composables/useSchedule'

const emit = defineEmits<{ abrir: [] }>()
const store = useStore()
const { activo, indice, reloj, desde } = useSchedule()

const toca = computed(() => (indice.value >= 0 ? AGENDA[indice.value] : null))
/** Según la hora ya tocaría un momento posterior al que está marcado como «Ahora» */
const vaTarde = computed(() => indice.value > store.db.room.step)

/** Dinámica de equipo que corresponde al momento que toca (si es una dinámica) */
const DINAMICAS_DEL_MOMENTO: Record<string, string> = { 'a-quien': 'a-quien' }
const dinamicaQueToca = computed(() => {
  if (!toca.value) return null
  const id = DINAMICAS_DEL_MOMENTO[toca.value.id] ?? toca.value.id
  const i = TEAM_DYNAMICS.findIndex((d) => d.id === id)
  return i >= 0 ? { i, d: TEAM_DYNAMICS[i] } : null
})
const abierta = computed(() => store.openDynamic())
/** Toca abrir una dinámica que todavía no está abierta para los equipos */
const faltaAbrir = computed(() => !!dinamicaQueToca.value && abierta.value < dinamicaQueToca.value.i)
const siguiente = computed(() => TEAM_DYNAMICS[abierta.value + 1])

function cambiarPrueba(e: Event) {
  setHoraPrueba((e.target as HTMLInputElement).value)
}
</script>

<template>
  <section class="card horario" :class="{ 'horario--abrir': faltaAbrir }">
    <div class="horario__cab">
      <span class="kicker">Según el horario<template v-if="activo"> · {{ reloj }}</template></span>

    </div>

    <template v-if="!activo">
      <p class="nada">El sábado 21/11 la escaleta seguirá la hora sola. Para probarlo hoy, poned una hora de prueba aquí abajo.</p>
    </template>
    <template v-else-if="!toca">
      <p class="nada">Todavía no ha empezado la jornada (primer momento: {{ AGENDA[0].time }}).</p>
    </template>
    <template v-else>
      <p class="toca">Toca: <strong>{{ toca.title }}</strong> <span>({{ toca.time }} · {{ toca.minutes }} min · hace {{ desde }} min)</span></p>
      <div v-if="faltaAbrir" class="abrir">
        <p>⏰ Los equipos todavía no tienen abierta <strong>«{{ dinamicaQueToca!.d.title }}»</strong>.</p>
        <button v-if="siguiente" class="boton" type="button" @click="emit('abrir')">Abrir para todos: {{ siguiente.title }} →</button>
      </div>
      <div v-if="vaTarde" class="tarde">
        <p>En la escaleta, «Ahora» sigue en <strong>{{ AGENDA[store.db.room.step]?.title }}</strong>.</p>
        <button class="boton boton--sec" type="button" @click="setRoomStep(indice)">Marcar «{{ toca.title }}» como ahora</button>
      </div>
    </template>

    <label class="prueba">
      <span>Probar como si fueran las</span>
      <input type="time" :value="horaPrueba" @change="cambiarPrueba" />
      <button v-if="horaPrueba" class="enlace" type="button" @click="setHoraPrueba('')">Quitar (usar la hora real)</button>
      <small>Solo en este ordenador. El sábado no hace nada: manda la hora real.</small>
    </label>
  </section>
</template>

<style scoped>
.horario{display:grid;gap:.6rem}
.horario--abrir{box-shadow:inset 0 0 0 3px var(--c-rubi)}
.horario__cab{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.6rem}
.interruptor{display:flex;align-items:center;gap:.4rem;font-size:.9rem;font-weight:600;color:var(--c-ink);cursor:pointer}
.interruptor input{width:1.1rem;height:1.1rem;accent-color:var(--c-innova)}
.nada{margin:0;font-size:.9rem}
.toca{margin:0;font-size:1.15rem;color:var(--c-ink)}
.toca span{font-size:.85rem;color:var(--c-green-dark)}
.abrir{display:grid;gap:.5rem;justify-items:start;padding:.8rem 1rem;border-radius:1rem;background:color-mix(in srgb,var(--c-rubi) 10%,var(--c-white))}
.abrir p{margin:0;color:var(--c-ink)}
.tarde{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem}
.tarde p{margin:0;font-size:.9rem}
.boton--sec{background:var(--c-green-light)}
.prueba{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;font-size:.8rem;border-top:1px solid var(--c-gris-10);padding-top:.6rem}
.prueba input{font:inherit;padding:.2em .4em;border:1px solid var(--c-paper-line);border-radius:.5rem}
.prueba small{width:100%;color:var(--c-green-dark)}
.enlace{border:0;background:none;padding:0;font:inherit;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}
</style>
