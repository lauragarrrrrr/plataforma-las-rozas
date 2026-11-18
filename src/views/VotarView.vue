<script setup lang="ts">
// /votar?equipo=X · Votación desde el móvil, como la «Pieza 08 · Votación en sala» de la metodología.
// 0. ¿Quién eres? (equipo del QR + nombre, para que cada persona vote una sola vez)
// 1. ★ Favorita 1, 2 y 3 (3, 2 y 1 puntos), nunca su propio equipo; en cada opción, el titular
//    del equipo (lo escribe el equipo facilitador). Sin pantalla previa de titulares (17/11/2026).
// 3. «¡Voto recibido!»
// El voto se guarda con el equipo y la posición de la persona, nunca con su nombre.
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { castVote, recallOnDevice, useStore } from '../data/store'
import { SIMULATED_ROSTER } from '../data/roster'
import ResultadosPodio from '../components/ResultadosPodio.vue'

const route = useRoute()
const store = useStore()

const equipo = ref(typeof route.query.equipo === 'string' ? route.query.equipo.toUpperCase() : '')
const persona = ref<number | null>(null)
const favoritas = ref<string[]>(['', '', ''])
const enviando = ref(false)
const aviso = ref('')
const hecho = ref(false)

const miEquipo = computed(() => store.team(equipo.value))

// Si este móvil ya dijo por la mañana quién era (en /participa), se le propone directamente
const yo = ref(recallOnDevice<{ name: string; teamId: string }>('lr2040-participante'))
const yoIndice = computed(() => {
  if (!yo.value) return -1
  const lista = store.setup(yo.value.teamId)?.members ?? SIMULATED_ROSTER[yo.value.teamId] ?? []
  return lista.indexOf(yo.value.name)
})
const proponerYo = computed(() => !!yo.value && yoIndice.value >= 0 && !equipo.value && persona.value === null && !store.hasVoted(yo.value.teamId, yoIndice.value))
function soyYo() {
  if (!yo.value) return
  equipo.value = yo.value.teamId
  persona.value = yoIndice.value
}
const nombres = computed(() => store.setup(equipo.value)?.members ?? SIMULATED_ROSTER[equipo.value] ?? [])

/** Opciones de cada puesto: nunca su equipo ni las ya elegidas en otro puesto */
function opciones(puesto: number) {
  return store.db.teams.filter(
    (t) => t.id !== equipo.value && !favoritas.value.some((f, k) => k !== puesto && f === t.id),
  )
}

async function enviar() {
  aviso.value = ''
  if (favoritas.value.some((f) => !f)) {
    aviso.value = 'Elige tres iniciativas distintas, una por puesto.'
    return
  }
  enviando.value = true
  aviso.value = await castVote(equipo.value, persona.value!, favoritas.value)
  enviando.value = false
  if (!aviso.value) hecho.value = true
}
</script>

<template>
  <main class="votar">
    <div class="wrap votar__in">
      <span class="kicker">Las Rozas 2040 · Votación</span>

      <!-- Resultados publicados por el equipo facilitador -->
      <template v-if="store.resultsPublished()">
        <h1 class="titulo">✦ ¡Ya tenemos ganadores!</h1>
        <p>Gracias por votar. Estos son los equipos ganadores de Las Rozas 2040.</p>
        <ResultadosPodio :mi-equipo="equipo" />
      </template>

      <!-- Cerrada -->
      <template v-else-if="!store.votingOpen() && !hecho">
        <span class="candado" aria-hidden="true">🔒</span>
        <h1 class="titulo">La votación todavía no está abierta</h1>
        <p>Se abrirá al terminar el speed pitch. Vuelve a escanear el código entonces.</p>
      </template>

      <!-- Voto recibido -->
      <template v-else-if="hecho">
        <span class="ok" aria-hidden="true">✓</span>
        <h1 class="titulo">¡Voto recibido! Gracias, {{ nombres[persona!] }}.</h1>
        <ol class="resumen">
          <li v-for="(f, k) in favoritas" :key="f"><span class="estrella">★ {{ k + 1 }}</span> Equipo {{ f }} · {{ store.areaName(store.team(f)!.area) }}</li>
        </ol>
        <p>Los resultados se verán en la pantalla de la sala.</p>
      </template>

      <!-- 0 · Este móvil ya sabe quién eres -->
      <template v-else-if="proponerYo">
        <h1 class="titulo">¿Eres {{ yo!.name }}?</h1>
        <p>Para hacer esta votación final necesitamos saber quién eres. Del equipo {{ yo!.teamId }} · {{ store.areaName(store.team(yo!.teamId)!.area) }}.</p>
        <button class="nombre nombre--yo" type="button" @click="soyYo">Sí, soy {{ yo!.name }}</button>
        <button class="enlace" type="button" @click="yo = null">No soy yo</button>
      </template>

      <!-- 0 · ¿A qué equipo perteneces? (si se llega sin el QR del equipo) -->
      <template v-else-if="!miEquipo">
        <h1 class="titulo">¿Quién eres?</h1>
        <p>Para hacer esta votación final necesitamos saber quién eres. Primero, <strong>¿a qué equipo perteneces?</strong></p>
        <div class="equipos">
          <button v-for="t in store.db.teams" :key="t.id" class="equipo-btn" type="button" @click="equipo = t.id">
            <span class="equipo-btn__letra">{{ t.id }}</span>
            <span class="equipo-btn__ambito">{{ store.areaName(t.area) }}</span>
          </button>
        </div>
      </template>

      <!-- 0 · ¿Quién eres? -->
      <template v-else-if="persona === null">
        <h1 class="titulo">¿Quién eres?</h1>
        <p>Para hacer esta votación final necesitamos saber quién eres. <strong>Selecciona tu nombre exacto.</strong></p>
        <p>{{ miEquipo.name }} · {{ store.areaName(miEquipo.area) }}</p>
        <div class="nombres">
          <button
            v-for="(n, i) in nombres" :key="n" class="nombre" type="button"
            :disabled="store.hasVoted(equipo, i)" @click="persona = i"
          >
            {{ n }}<small v-if="store.hasVoted(equipo, i)"> · ya ha votado</small>
          </button>
        </div>
        <button class="enlace" type="button" @click="equipo = ''">No es mi equipo</button>
      </template>

      <!-- Las tres favoritas (se ve el titular de cada equipo en el desplegable) -->
      <template v-else>
        <h1 class="titulo">¿Qué ideas te gustaría ver avanzar?</h1>
        <p class="quien">Votas como <strong>{{ nombres[persona!] }}</strong>, del <strong>equipo {{ equipo }}</strong>.</p>
        <p>Elige tus tres titulares favoritos. No puedes votar a tu propio equipo.</p>

        <div v-for="k in [0, 1, 2]" :key="k" class="favorita">
          <label :for="`fav-${k}`"><span class="estrella">★</span> Favorita {{ k + 1 }} <small>· {{ 3 - k }} {{ k === 2 ? 'punto' : 'puntos' }}</small></label>
          <select :id="`fav-${k}`" v-model="favoritas[k]" class="selector">
            <option value="">Seleccionar</option>
            <option v-for="t in opciones(k)" :key="t.id" :value="t.id">Equipo {{ t.id }} · {{ store.coverHeadline(t.id) || store.areaName(t.area) }}</option>
            <option disabled :value="`propio-${equipo}`">Equipo {{ equipo }} · es tu equipo (no se puede)</option>
          </select>
        </div>

        <p v-if="aviso" class="alerta" role="alert">{{ aviso }}</p>
        <div class="barra-inferior">
          <button class="boton" type="button" :disabled="enviando" @click="enviar">
            {{ enviando ? 'Enviando…' : 'Enviar mi votación →' }}
          </button>
          <button class="enlace" type="button" @click="persona = null; favoritas = ['', '', '']">No soy {{ nombres[persona] }}</button>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.votar{min-height:calc(100vh - 4.5rem);background:var(--c-green-light)}
.votar__in{display:grid;gap:1rem;padding-block:2rem 7rem;max-width:40rem}
.titulo{font-size:clamp(1.8rem,7vw,2.6rem);font-weight:500;letter-spacing:-.04em;line-height:1.05}
.candado{font-size:2.5rem}
.ok{display:grid;place-items:center;width:4rem;height:4rem;border-radius:50%;background:var(--c-innova);color:var(--c-ink);font-size:2rem;font-weight:700}
.estrella{color:var(--c-innova-dark);font-weight:700}
.resumen{margin:0;padding:0;list-style:none;display:grid;gap:.4rem}
.resumen li{background:var(--c-white);border-radius:1rem;padding:.7rem 1rem;color:var(--c-ink)}

.selector{width:100%;font:inherit;font-size:1rem;padding:.8rem 1rem;border:1.5px solid var(--c-green-mid);border-radius:1rem;background:var(--c-white);color:var(--c-ink)}
.quien{margin:0;padding:.6rem 1rem;border-radius:1rem;background:var(--c-white);color:var(--c-ink)}
.nombres{display:grid;gap:.5rem}
.nombre--yo{background:var(--c-innova);text-align:center}
.equipos{display:grid;grid-template-columns:repeat(auto-fill,minmax(9.5rem,1fr));gap:.5rem}
.equipo-btn{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:.7rem;border:0;border-radius:1rem;background:var(--c-white);padding:.7rem .9rem;font:inherit;text-align:left;cursor:pointer;color:var(--c-ink)}
.equipo-btn:hover{background:var(--c-green-mid)}
.equipo-btn__letra{display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:50%;background:var(--c-innova-dark);color:var(--c-white);font-size:1.2rem;font-weight:600}
.equipo-btn__ambito{font-size:.8rem;line-height:1.25;color:var(--c-green-dark)}
.nombre{border:0;border-radius:1rem;background:var(--c-white);padding:1rem 1.2rem;font:inherit;font-size:1.15rem;font-weight:500;color:var(--c-ink);text-align:left;cursor:pointer}
.nombre:disabled{opacity:.5;cursor:default}
.nombre small{font-size:.8rem;color:var(--c-green-dark)}


.favorita{display:grid;gap:.4rem;background:var(--c-white);border-radius:var(--radius-card);padding:1rem}
.favorita label{font-weight:600;color:var(--c-ink)}
.favorita label small{font-weight:400;color:var(--c-green-dark)}

.barra-inferior{position:fixed;left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:1rem;padding:.9rem 16px;background:var(--c-white);box-shadow:0 -8px 24px -16px var(--c-green-deep);z-index:5}
.enlace{justify-self:start;border:0;background:none;padding:0;font:inherit;font-size:.85rem;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}
.boton:disabled{opacity:.45;cursor:default;transform:none}
</style>
