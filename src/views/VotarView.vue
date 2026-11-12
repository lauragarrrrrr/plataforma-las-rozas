<script setup lang="ts">
// /votar?equipo=X · Votación desde el móvil (llega con el QR del final de la app del equipo).
// 1. La persona elige su nombre  2. Elige 3 iniciativas, nunca la de su equipo  3. Confirmación.
// El voto se guarda con el equipo y la posición de la persona, nunca con su nombre.
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { castVote, useStore } from '../data/store'
import { SIMULATED_ROSTER } from '../data/roster'

const route = useRoute()
const store = useStore()

const equipo = ref(typeof route.query.equipo === 'string' ? route.query.equipo.toUpperCase() : '')
const persona = ref<number | null>(null)
const elegidos = ref<string[]>([])
const enviando = ref(false)
const error = ref('')
const hecho = ref(false)

const miEquipo = computed(() => store.team(equipo.value))
const nombres = computed(() => store.setup(equipo.value)?.members ?? SIMULATED_ROSTER[equipo.value] ?? [])
const otros = computed(() => store.db.teams.filter((t) => t.id !== equipo.value))

function alternar(id: string) {
  const i = elegidos.value.indexOf(id)
  if (i >= 0) elegidos.value.splice(i, 1)
  else if (elegidos.value.length < 3) elegidos.value.push(id)
}

async function votar() {
  if (persona.value === null) return
  enviando.value = true
  error.value = await castVote(equipo.value, persona.value, elegidos.value)
  enviando.value = false
  if (!error.value) hecho.value = true
}
</script>

<template>
  <main class="votar">
    <div class="wrap votar__in">
      <!-- Cerrada -->
      <template v-if="!store.votingOpen() && !hecho">
        <span class="candado" aria-hidden="true">🔒</span>
        <h1 class="titulo">La votación todavía no está abierta</h1>
        <p>Se abrirá al terminar el speed pitch. Vuelve a escanear el código entonces.</p>
      </template>

      <!-- Hecho -->
      <template v-else-if="hecho">
        <span class="ok" aria-hidden="true">✓</span>
        <h1 class="titulo">¡Gracias por votar!</h1>
        <p>Tu voto se ha guardado. Los resultados se verán en la pantalla de la sala.</p>
      </template>

      <!-- 0 · Equipo (si se llega sin el QR del equipo) -->
      <template v-else-if="!miEquipo">
        <span class="kicker">Votación</span>
        <h1 class="titulo">¿De qué equipo eres?</h1>
        <div class="letras">
          <button v-for="t in store.db.teams" :key="t.id" class="letra" type="button" @click="equipo = t.id">{{ t.id }}</button>
        </div>
      </template>

      <!-- 1 · ¿Quién eres? -->
      <template v-else-if="persona === null">
        <span class="kicker">Votación · {{ miEquipo.name }}</span>
        <h1 class="titulo">¿Quién eres?</h1>
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

      <!-- 2 · Elegir 3 iniciativas -->
      <template v-else>
        <span class="kicker">Votación · {{ nombres[persona] }}</span>
        <h1 class="titulo">¿Qué ideas te gustaría ver avanzar?</h1>
        <p>Elige <strong>tres</strong>. No puedes votar a tu propio equipo.</p>
        <div class="iniciativas">
          <button
            v-for="t in otros" :key="t.id" type="button" class="ini"
            :class="{ 'ini--on': elegidos.includes(t.id) }"
            :aria-pressed="elegidos.includes(t.id)" @click="alternar(t.id)"
          >
            <img v-if="store.photoFor(t.id, 'portada')" :src="store.photoFor(t.id, 'portada')!.url" alt="" />
            <span v-else class="ini__sin">Las Rozas Times 2040</span>
            <span class="ini__pie">
              <strong>Equipo {{ t.id }}</strong>
              <small>{{ store.areaName(t.area) }}</small>
            </span>
            <span v-if="elegidos.includes(t.id)" class="ini__marca">{{ elegidos.indexOf(t.id) + 1 }}</span>
          </button>
        </div>
        <p v-if="error" class="alerta">{{ error }}</p>
        <div class="enviar">
          <button class="boton" type="button" :disabled="elegidos.length !== 3 || enviando" @click="votar">
            {{ enviando ? 'Guardando…' : `Votar (${elegidos.length}/3)` }}
          </button>
          <button class="enlace" type="button" @click="persona = null; elegidos = []">No soy {{ nombres[persona] }}</button>
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
.letras{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem}
.letra{aspect-ratio:1;border:0;border-radius:1rem;background:var(--c-white);font:inherit;font-size:1.8rem;font-weight:600;color:var(--c-ink);cursor:pointer}
.nombres{display:grid;gap:.5rem}
.nombre{border:0;border-radius:1rem;background:var(--c-white);padding:1rem 1.2rem;font:inherit;font-size:1.15rem;font-weight:500;color:var(--c-ink);text-align:left;cursor:pointer}
.nombre:disabled{opacity:.5;cursor:default}
.nombre small{font-size:.8rem;color:var(--c-green-dark)}
.iniciativas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}
.ini{position:relative;display:grid;gap:0;border:0;border-radius:1rem;overflow:hidden;background:var(--c-white);padding:0;font:inherit;text-align:left;cursor:pointer;box-shadow:inset 0 0 0 2px transparent;transition:box-shadow .2s}
.ini img,.ini__sin{aspect-ratio:3/4;width:100%;object-fit:cover}
.ini__sin{display:grid;place-items:center;background:var(--c-paper);font-family:var(--font-paper);font-weight:700;color:var(--c-ink);text-align:center;padding:.5rem}
.ini__pie{display:grid;padding:.5rem .7rem}
.ini__pie strong{color:var(--c-ink)}
.ini__pie small{font-size:.72rem}
.ini--on{box-shadow:inset 0 0 0 4px var(--c-innova)}
.ini__marca{position:absolute;top:.5rem;right:.5rem;display:grid;place-items:center;width:2rem;height:2rem;border-radius:50%;background:var(--c-innova);color:var(--c-ink);font-weight:700}
.enviar{position:fixed;left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:1rem;padding:.9rem 16px;background:var(--c-white);box-shadow:0 -8px 24px -16px var(--c-green-deep)}
.enlace{border:0;background:none;padding:0;font:inherit;font-size:.85rem;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}
.boton:disabled{opacity:.45;cursor:default;transform:none}
</style>
