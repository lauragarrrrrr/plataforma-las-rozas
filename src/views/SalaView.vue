<script setup lang="ts">
// /sala · Presentación de la sala (parte del equipo facilitador)
// Se pasa como una presentación: flechas del teclado o botones de abajo.
// Las diapositivas de apertura, recorrido y Juanjo, y el vídeo, se añadirán cuando los subáis.
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { AGENDA } from '../data/agenda'
import { AREAS, TEAM_AREAS } from '../data/config'
import { revealAreas, setRoomStep, startRoomTimer, stopRoomTimer, useStore } from '../data/store'
import { formatClock, useNow } from '../composables/useNow'
import type { AreaId } from '../data/types'

const store = useStore()
const now = useNow()

const index = computed(() => Math.min(store.db.room.step, AGENDA.length - 1))
const step = computed(() => AGENDA[index.value])
const timerLeft = computed(() => (store.db.room.timerEndsAt ? new Date(store.db.room.timerEndsAt).getTime() - now.value : null))

const ambitos = computed(() =>
  (Object.keys(AREAS) as AreaId[]).map((a) => ({
    id: a,
    name: AREAS[a],
    teams: TEAM_AREAS.map((x, i) => (x === a ? String(i + 1).padStart(2, '0') : null)).filter(Boolean),
  })),
)

function go(delta: number) {
  const next = index.value + delta
  if (next >= 0 && next < AGENDA.length) setRoomStep(next)
}
function fullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen?.()
}
function onKey(e: KeyboardEvent) {
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1) }
  if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1) }
  if (e.key.toLowerCase() === 'f') fullscreen()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <main class="sala" :class="`sala--${step.kind}`">
    <!-- Primera diapositiva: dinámica, con Las Rozas 2040 -->
    <section v-if="step.kind === 'welcome'" class="diapo bienvenida">
      <div class="burbujas" aria-hidden="true"><i></i><i></i><i></i></div>
      <span class="sala__kicker">Hackathon · Sábado 21/11/2026</span>
      <h1><span class="nombre">Las Rozas</span> <span class="anio">2040</span></h1>
      <p class="lema">El futuro no se espera. Se construye juntos.</p>
      <div class="logos">
        <img src="/logos/ayuntamiento-las-rozas.png" alt="Ayuntamiento de Las Rozas" />
        <img src="/logos/las-rozas-innova.png" alt="Las Rozas Innova" />
      </div>
    </section>

    <!-- Revelación de los ámbitos -->
    <section v-else-if="step.kind === 'reveal'" class="diapo">
      <span class="sala__kicker">{{ step.time }} · {{ step.who }}</span>
      <h1 class="titulo">{{ step.title }}</h1>
      <p class="desc">{{ step.description }}</p>
      <ul v-if="store.db.event.areasRevealed" class="ambitos">
        <li v-for="a in ambitos" :key="a.id">
          <strong>{{ a.name }}</strong>
          <span>Equipos {{ a.teams.join(' y ') }}</span>
        </li>
      </ul>
      <button v-else class="sala__boton" type="button" @click="revealAreas(true)">Revelar los ámbitos</button>
    </section>

    <!-- Diapositivas, vídeo, dinámicas, descanso y resto -->
    <section v-else class="diapo">
      <span class="sala__kicker">{{ step.time }} · {{ step.who }}</span>
      <h1 class="titulo">{{ step.title }}</h1>
      <p class="desc">{{ step.description }}</p>

      <div v-if="step.pending" class="hueco">
        <strong>{{ step.kind === 'video' ? 'Vídeo' : 'Diapositivas' }} pendientes de subir</strong>
        <span>{{ step.pending }}</span>
      </div>

      <div v-if="step.kind === 'dynamic' || step.kind === 'break' || step.kind === 'info'" class="crono">
        <template v-if="timerLeft !== null">
          <strong class="crono__cifra" :class="{ 'crono__cifra--fin': timerLeft <= 0 }">{{ formatClock(timerLeft) }}</strong>
          <button class="sala__boton sala__boton--sec" type="button" @click="stopRoomTimer()">Parar</button>
        </template>
        <button v-else class="sala__boton" type="button" @click="startRoomTimer(step.minutes)">Iniciar cronómetro · {{ step.minutes }} min</button>
      </div>
    </section>

    <!-- Controles del equipo facilitador -->
    <nav class="controles" aria-label="Controles de la presentación">
      <RouterLink class="ctrl" to="/facilitacion">Salir</RouterLink>
      <button class="ctrl" type="button" :disabled="index === 0" @click="go(-1)">← Anterior</button>
      <span class="ctrl__paso">{{ index + 1 }} / {{ AGENDA.length }} · {{ step.time }}</span>
      <button class="ctrl" type="button" :disabled="index === AGENDA.length - 1" @click="go(1)">Siguiente →</button>
      <button class="ctrl" type="button" @click="fullscreen">Pantalla completa</button>
    </nav>
  </main>
</template>

<style scoped>
.sala{min-height:100vh;background:var(--gradient-dark);color:var(--c-green-light);display:grid;grid-template-rows:1fr auto;overflow:hidden}
.diapo{position:relative;display:grid;align-content:center;justify-items:center;text-align:center;gap:2.2vh;padding:6vh 6vw}
.sala__kicker{font-size:clamp(.9rem,1.4vw,1.6rem);letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:var(--c-green-mid)}
h1{color:var(--c-white)}
.titulo{font-size:clamp(2.4rem,5.5vw,6.5rem);font-weight:500;letter-spacing:-.045em;line-height:1;max-width:22ch}
.desc{font-size:clamp(1.1rem,2vw,2.2rem);line-height:1.35;max-width:46ch;color:var(--c-green-light)}

.bienvenida h1{font-size:clamp(3rem,11vw,14rem);line-height:.9;letter-spacing:-.05em;position:relative}
.nombre{font-weight:300}
.anio{font-weight:700;background:linear-gradient(100deg,var(--c-green-mid),var(--c-innova) 60%,var(--c-white));-webkit-background-clip:text;background-clip:text;color:transparent}
.lema{font-size:clamp(1.2rem,2.6vw,3rem);letter-spacing:-.02em;position:relative}
.logos{display:flex;gap:4vw;align-items:center;margin-top:3vh;position:relative}
.logos img{height:clamp(2rem,5vh,4rem);width:auto}
.burbujas i{position:absolute;border-radius:50%;filter:blur(40px);opacity:.45;animation:flota 14s ease-in-out infinite alternate}
.burbujas i:nth-child(1){width:38vw;height:38vw;left:-8vw;top:-10vh;background:var(--c-innova)}
.burbujas i:nth-child(2){width:30vw;height:30vw;right:-6vw;bottom:-8vh;background:var(--c-green-mid);animation-delay:-5s}
.burbujas i:nth-child(3){width:22vw;height:22vw;left:40vw;top:50vh;background:var(--c-blue);animation-delay:-9s}
@keyframes flota{to{transform:translate(6vw,-4vh) scale(1.15)}}

.hueco{display:grid;gap:.4rem;border:3px dashed var(--c-green-mid);border-radius:var(--radius-card);padding:4vh 4vw;min-width:min(60vw,52rem)}
.hueco strong{font-size:clamp(1.1rem,1.8vw,2rem);color:var(--c-white)}

.crono{display:flex;align-items:center;gap:2vw;margin-top:2vh}
.crono__cifra{font-size:clamp(4rem,14vw,16rem);font-weight:600;letter-spacing:-.04em;line-height:1;color:var(--c-white);font-variant-numeric:tabular-nums}
.crono__cifra--fin{color:var(--c-rubi)}

.ambitos{list-style:none;margin:2vh 0 0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.5vw;width:min(90vw,90rem)}
.ambitos li{display:grid;gap:.4rem;background:color-mix(in srgb,var(--c-white) 10%,transparent);border:1px solid color-mix(in srgb,var(--c-white) 25%,transparent);border-radius:var(--radius-card);padding:3vh 2vw;animation:entra .6s var(--ease-out) both}
.ambitos li:nth-child(2){animation-delay:.1s}.ambitos li:nth-child(3){animation-delay:.2s}.ambitos li:nth-child(4){animation-delay:.3s}.ambitos li:nth-child(5){animation-delay:.4s}.ambitos li:nth-child(6){animation-delay:.5s}
.ambitos strong{font-size:clamp(1.1rem,2vw,2.2rem);color:var(--c-white);font-weight:600;letter-spacing:-.02em}
.ambitos span{color:var(--c-green-mid);font-size:clamp(.9rem,1.3vw,1.4rem)}
@media(max-width:800px){.ambitos{grid-template-columns:1fr 1fr}}
@keyframes entra{from{opacity:0;transform:translateY(20px) scale(.97)}}

.sala__boton{border:0;border-radius:99px;padding:.8em 1.6em;background:var(--c-innova);color:var(--c-ink);font:inherit;font-size:clamp(1rem,1.4vw,1.4rem);font-weight:600;cursor:pointer}
.sala__boton--sec{background:transparent;color:var(--c-white);box-shadow:inset 0 0 0 2px var(--c-white)}

.controles{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.5rem;padding:.6rem 1rem;background:color-mix(in srgb,var(--c-ink) 35%,transparent);opacity:.35;transition:opacity .2s}
.controles:hover,.controles:focus-within{opacity:1}
.ctrl{border:0;border-radius:99px;padding:.45em 1em;background:color-mix(in srgb,var(--c-white) 15%,transparent);color:var(--c-white);font:inherit;font-size:.85rem;cursor:pointer;text-decoration:none}
.ctrl:disabled{opacity:.35;cursor:default}
.ctrl__paso{font-size:.85rem;color:var(--c-green-mid);font-variant-numeric:tabular-nums;padding-inline:.5rem}
@media(prefers-reduced-motion:reduce){.burbujas i,.ambitos li{animation:none}}
</style>
