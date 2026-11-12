<script setup lang="ts">
// /votar?equipo=X · Votación desde el móvil, como la «Pieza 08 · Votación en sala» de la metodología.
// 0. ¿Quién eres? (equipo del QR + nombre, para que cada persona vote una sola vez)
// 1. Paso 1 de 2: las 12 portadas de 2040 → «Ir a votar»
// 2. Paso 2 de 2: ★ Favorita 1, 2 y 3 (3, 2 y 1 puntos), nunca su propio equipo
// 3. «¡Voto recibido!»
// El voto se guarda con el equipo y la posición de la persona, nunca con su nombre.
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { castVote, useStore } from '../data/store'
import { SIMULATED_ROSTER } from '../data/roster'
import type { Team } from '../data/types'

const route = useRoute()
const store = useStore()

const equipo = ref(typeof route.query.equipo === 'string' ? route.query.equipo.toUpperCase() : '')
const persona = ref<number | null>(null)
const paso = ref<1 | 2>(1)
const favoritas = ref<string[]>(['', '', ''])
const enviando = ref(false)
const aviso = ref('')
const hecho = ref(false)

const miEquipo = computed(() => store.team(equipo.value))
const nombres = computed(() => store.setup(equipo.value)?.members ?? SIMULATED_ROSTER[equipo.value] ?? [])
const portada = (t: Team) => store.photoFor(t.id, 'portada')?.url

/** Opciones de cada puesto: nunca su equipo ni las ya elegidas en otro puesto */
function opciones(puesto: number) {
  return store.db.teams.filter(
    (t) => t.id !== equipo.value && !favoritas.value.some((f, k) => k !== puesto && f === t.id),
  )
}
const elegida = (puesto: number) => store.team(favoritas.value[puesto])

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

      <!-- Cerrada -->
      <template v-if="!store.votingOpen() && !hecho">
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

      <!-- 0 · ¿De qué equipo eres? (si se llega sin el QR del equipo) -->
      <template v-else-if="!miEquipo">
        <h1 class="titulo">¿De qué equipo eres?</h1>
        <select class="selector" :value="equipo" @change="equipo = ($event.target as HTMLSelectElement).value">
          <option value="">Elige tu equipo</option>
          <option v-for="t in store.db.teams" :key="t.id" :value="t.id">Equipo {{ t.id }}</option>
        </select>
      </template>

      <!-- 0 · ¿Quién eres? -->
      <template v-else-if="persona === null">
        <h1 class="titulo">¿Quién eres?</h1>
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

      <!-- Paso 1 de 2 · Las 12 portadas -->
      <template v-else-if="paso === 1">
        <span class="paso">Paso 1 de 2</span>
        <h1 class="titulo">Las 12 portadas de 2040</h1>
        <p>Repasa todas las iniciativas antes de votar.</p>
        <div class="portadas">
          <figure v-for="t in store.db.teams" :key="t.id" class="portada" :class="{ 'portada--mia': t.id === equipo }">
            <img v-if="portada(t)" :src="portada(t)" :alt="`Portada del equipo ${t.id}`" loading="lazy" />
            <span v-else class="portada__sin">Las Rozas Times 2040</span>
            <figcaption>
              <small>Las Rozas Times · Eq. {{ t.id }}</small>
              <span>{{ store.areaName(t.area) }}</span>
              <em v-if="t.id === equipo">Tu equipo</em>
            </figcaption>
          </figure>
        </div>
        <div class="barra-inferior">
          <button class="boton" type="button" @click="paso = 2">Ir a votar →</button>
        </div>
      </template>

      <!-- Paso 2 de 2 · Las tres favoritas -->
      <template v-else>
        <button class="enlace" type="button" @click="paso = 1">← Ver las portadas</button>
        <span class="paso">Paso 2 de 2</span>
        <h1 class="titulo">¿Qué ideas te gustaría ver avanzar?</h1>
        <p>Selecciona tus tres iniciativas favoritas. No puedes votar a tu propio equipo.</p>

        <div v-for="k in [0, 1, 2]" :key="k" class="favorita">
          <label :for="`fav-${k}`"><span class="estrella">★</span> Favorita {{ k + 1 }} <small>· {{ 3 - k }} {{ k === 2 ? 'punto' : 'puntos' }}</small></label>
          <select :id="`fav-${k}`" v-model="favoritas[k]" class="selector">
            <option value="">Seleccionar</option>
            <option v-for="t in opciones(k)" :key="t.id" :value="t.id">Equipo {{ t.id }} · {{ store.areaName(t.area) }}</option>
          </select>
          <div v-if="elegida(k)" class="favorita__info">
            <img v-if="portada(elegida(k)!)" :src="portada(elegida(k)!)" alt="" />
            <span><b>Equipo {{ elegida(k)!.id }}</b> · {{ store.areaName(elegida(k)!.area) }}</span>
          </div>
        </div>

        <p v-if="aviso" class="alerta" role="alert">{{ aviso }}</p>
        <div class="barra-inferior">
          <button class="boton" type="button" :disabled="enviando" @click="enviar">
            {{ enviando ? 'Enviando…' : 'Enviar mis preferencias →' }}
          </button>
          <button class="enlace" type="button" @click="persona = null; favoritas = ['', '', '']; paso = 1">No soy {{ nombres[persona] }}</button>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.votar{min-height:calc(100vh - 4.5rem);background:var(--c-green-light)}
.votar__in{display:grid;gap:1rem;padding-block:2rem 7rem;max-width:40rem}
.titulo{font-size:clamp(1.8rem,7vw,2.6rem);font-weight:500;letter-spacing:-.04em;line-height:1.05}
.paso{justify-self:start;background:var(--c-innova-dark);color:var(--c-white);border-radius:99px;padding:.25em .9em;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.candado{font-size:2.5rem}
.ok{display:grid;place-items:center;width:4rem;height:4rem;border-radius:50%;background:var(--c-innova);color:var(--c-ink);font-size:2rem;font-weight:700}
.estrella{color:var(--c-innova-dark);font-weight:700}
.resumen{margin:0;padding:0;list-style:none;display:grid;gap:.4rem}
.resumen li{background:var(--c-white);border-radius:1rem;padding:.7rem 1rem;color:var(--c-ink)}

.selector{width:100%;font:inherit;font-size:1rem;padding:.8rem 1rem;border:1.5px solid var(--c-green-mid);border-radius:1rem;background:var(--c-white);color:var(--c-ink)}
.nombres{display:grid;gap:.5rem}
.nombre{border:0;border-radius:1rem;background:var(--c-white);padding:1rem 1.2rem;font:inherit;font-size:1.15rem;font-weight:500;color:var(--c-ink);text-align:left;cursor:pointer}
.nombre:disabled{opacity:.5;cursor:default}
.nombre small{font-size:.8rem;color:var(--c-green-dark)}

.portadas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}
.portada{margin:0;display:grid;border-radius:1rem;overflow:hidden;background:var(--c-white)}
.portada img,.portada__sin{aspect-ratio:3/4;width:100%;object-fit:cover}
.portada__sin{display:grid;place-items:center;background:var(--c-paper);font-family:var(--font-paper);font-weight:700;color:var(--c-ink);text-align:center;padding:.5rem}
.portada figcaption{display:grid;padding:.5rem .7rem;font-size:.78rem}
.portada figcaption small{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--c-innova-dark);font-weight:600}
.portada figcaption span{color:var(--c-ink)}
.portada figcaption em{font-style:normal;font-weight:700;color:var(--c-green-deep)}
.portada--mia{opacity:.6}

.favorita{display:grid;gap:.4rem;background:var(--c-white);border-radius:var(--radius-card);padding:1rem}
.favorita label{font-weight:600;color:var(--c-ink)}
.favorita label small{font-weight:400;color:var(--c-green-dark)}
.favorita__info{display:flex;gap:.7rem;align-items:center;font-size:.85rem}
.favorita__info img{width:3.5rem;height:4.5rem;object-fit:cover;border-radius:.5rem}

.barra-inferior{position:fixed;left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:1rem;padding:.9rem 16px;background:var(--c-white);box-shadow:0 -8px 24px -16px var(--c-green-deep);z-index:5}
.enlace{justify-self:start;border:0;background:none;padding:0;font:inherit;font-size:.85rem;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}
.boton:disabled{opacity:.45;cursor:default;transform:none}
</style>
