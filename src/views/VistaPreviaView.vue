<script setup lang="ts">
// /vista-previa · Para el equipo facilitador: recorrer todas las pantallas que verán
// los equipos, una a una, sin cronómetros, sin fotos y SIN GUARDAR NADA.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { backToRoomAfter, PREMORTEM, TEAM_DYNAMICS, photoOf, type TeamDynamic } from '../data/dynamics'
import { formatClock, useNow } from '../composables/useNow'
import PhotoQr from '../components/PhotoQr.vue'
import CoachChat from '../components/CoachChat.vue'

/** Pasos: el reto del digital owner, las pantallas previas (el sobre) y las 8 dinámicas */
type Paso = { tipo: 'reto' | 'intro' | 'dinamica'; d: TeamDynamic; etiqueta: string }
const pasos: Paso[] = [
  { tipo: 'reto', d: PREMORTEM, etiqueta: '★' },
  ...TEAM_DYNAMICS.flatMap((d, n) => [
    ...(d.intro ? [{ tipo: 'intro' as const, d, etiqueta: '✉' }] : []),
    { tipo: 'dinamica' as const, d, etiqueta: String(n + 1) },
  ]),
]
const numDinamica = computed(() => TEAM_DYNAMICS.findIndex((x) => x.id === d.value.id) + 1)
const i = ref(0)
const paso = computed(() => pasos[i.value])
const d = computed(() => paso.value.d)

// Cronómetro de muestra: empieza de nuevo cada vez que se entra en una dinámica
const ahora = useNow()
const inicio = ref(Date.now())
const restante = computed(() => inicio.value + d.value.minutes * 60_000 - ahora.value)
const transcurrido = computed(() => Math.min(100, 100 - (restante.value / (d.value.minutes * 60_000)) * 100))

function ir(n: number) {
  if (n < 0 || n >= pasos.length) return
  i.value = n
  inicio.value = Date.now()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') ir(i.value + 1)
  if (e.key === 'ArrowLeft') ir(i.value - 1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

</script>

<template>
  <main class="vista">
    <!-- Barra de la vista previa -->
    <div class="barra">
      <div class="wrap barra__in">
        <span class="kicker">Vista previa para el equipo facilitador · no se guarda nada</span>
        <div class="barra__nav">
          <button class="nav" type="button" :disabled="i === 0" @click="ir(i - 1)">‹ Anterior</button>
          <ol class="pasos">
            <li v-for="(p, n) in pasos" :key="`${p.tipo}-${p.d.id}`">
              <button type="button" :class="{ actual: n === i, hecho: n < i }" :title="p.tipo === 'intro' ? p.d.intro?.title : p.d.title" @click="ir(n)">{{ p.etiqueta }}</button>
            </li>
          </ol>
          <button class="nav" type="button" :disabled="i === pasos.length - 1" @click="ir(i + 1)">Siguiente ›</button>
          <RouterLink class="salir" to="/facilitacion">Salir</RouterLink>
        </div>
      </div>
    </div>

    <!-- Reto del digital owner -->
    <section v-if="paso.tipo === 'reto'" class="wrap pantalla">
      <span class="kicker">Equipo A · Primer reto</span>
      <h1 class="titular">¡Lucía, digital owner!</h1>
      <p class="lema">Te ponemos un reto:</p>
      <p class="intro">Sube las fichas individuales de <strong>«{{ PREMORTEM.title }}»</strong> que ha rellenado cada persona de tu equipo. Una foto por ficha, una detrás de otra.</p>
      <div class="grid2">
        <div class="card">
          <span class="kicker">Con el móvil</span>
          <!-- QR real, pero de un equipo que no existe: si se escanea, no guarda nada -->
          <PhotoQr team-id="vista-previa" :dynamic-id="PREMORTEM.id" multi />
        </div>
        <div class="card">
          <span class="kicker">Fichas subidas</span>
          <strong class="cifra">0</strong>
          <p class="nota">Cuando hayas subido las fichas que tengáis, sigue.</p>
          <button class="boton" type="button">Seguir →</button>
        </div>
      </div>
    </section>

    <!-- Pantalla previa (el sobre de las cartas) -->
    <section v-else-if="paso.tipo === 'intro' && d.intro" class="wrap intro-din">
      <span class="kicker">{{ d.title }}</span>
      <span class="intro-din__icono" aria-hidden="true">✉</span>
      <h1 class="intro-din__titulo">{{ d.intro.title }}</h1>
      <p class="intro-din__texto">{{ d.intro.text }}</p>
      <button class="boton intro-din__boton" type="button" @click="ir(i + 1)">{{ d.intro.button }}</button>
    </section>

    <!-- Dinámica -->
    <section v-else class="wrap dinamica" :class="{ 'dinamica--sin-chat': d.noChat }">
      <div class="izq">
        <div class="card">
          <span class="kicker">Dinámica {{ numDinamica }} de {{ TEAM_DYNAMICS.length }} · {{ d.minutes }} min</span>
          <h1 class="titulo">{{ d.title }}</h1>
          <p class="que">{{ d.what }}</p>
          <dl class="qpco">
            <div><dt>Para qué</dt><dd>{{ d.why }}</dd></div>
            <div><dt>Cómo</dt><dd><ol class="como"><li v-for="h in d.how" :key="h">{{ h }}</li></ol></dd></div>
            <div><dt>¿Qué tendríais que obtener?</dt><dd>{{ d.output }}</dd></div>
          </dl>
        </div>
        <div class="card reloj">
          <span class="kicker">Tiempo</span>
          <strong class="reloj__cifra">{{ formatClock(restante) }}</strong>
          <div class="reloj__barra"><span :style="{ width: `${transcurrido}%` }"></span></div>
        </div>
        <div class="card">
          <span class="kicker">Al terminar</span>
          <p>Subid una foto {{ photoOf(d) }}. Sin la foto no podéis pasar a la siguiente dinámica.</p>
          <PhotoQr team-id="vista-previa" :dynamic-id="d.id" />
          <p v-if="backToRoomAfter(d)" class="aviso-sala">Después de la foto les sale: <strong>«¡Volved a la sala principal!»</strong></p>
        </div>
      </div>

      <!-- El mismo chat que los equipos: responded para ver la siguiente pregunta (no se guarda) -->
      <CoachChat v-if="!d.noChat" class="chat-demo" team-id="vista-previa" :dynamic="d" demo />
    </section>
  </main>
</template>

<style scoped>
.vista{background:var(--c-green-light);min-height:80vh;padding-bottom:3rem}
.barra{background:var(--gradient-dark);color:var(--c-white);position:sticky;top:0;z-index:20}
.barra__in{display:grid;gap:.5rem;padding-block:.8rem}
.barra .kicker{color:var(--c-green-mid)}
.barra__nav{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.nav,.salir{border:0;border-radius:99px;padding:.45em 1em;background:color-mix(in srgb,var(--c-white) 15%,transparent);color:var(--c-white);font:inherit;font-size:.85rem;cursor:pointer;text-decoration:none}
.nav:disabled{opacity:.35;cursor:default}
.salir{margin-left:auto}
.pasos{list-style:none;margin:0;padding:0;display:flex;gap:.3rem;flex-wrap:wrap}
.pasos button{width:2rem;height:2rem;border-radius:50%;border:0;font:inherit;font-size:.8rem;font-weight:700;cursor:pointer;background:var(--c-white);color:var(--c-green-dark)}
.pasos .hecho{background:var(--c-green-mid);color:var(--c-green-deep)}
.pasos .actual{background:var(--c-innova);color:var(--c-ink);box-shadow:0 0 0 3px var(--c-white)}

.pantalla{display:grid;gap:1rem;padding-block:2rem}
.lema{font-size:clamp(1.3rem,2.6vw,2rem);font-weight:500;color:var(--c-innova-dark)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
@media(max-width:800px){.grid2{grid-template-columns:1fr}}
.cifra{font-size:3rem;font-weight:600;line-height:1;color:var(--c-ink)}
.nota{font-size:.85rem;font-style:italic}

.dinamica{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:1.25rem;padding-block:1.5rem;align-items:start}
.dinamica--sin-chat{grid-template-columns:1fr}
@media(max-width:960px){.dinamica{grid-template-columns:1fr}}
.izq{display:grid;gap:1.25rem}
.titulo{font-size:clamp(1.8rem,3.4vw,2.8rem);font-weight:500;letter-spacing:-.04em;line-height:1.05}
.que{font-size:1.1rem;color:var(--c-ink)}
.qpco{margin:.4rem 0 0;display:grid;border-top:1px solid var(--c-gris-10)}
.qpco > div{display:grid;grid-template-columns:9rem 1fr;gap:.8rem;padding:.6rem 0;border-bottom:1px solid var(--c-gris-10)}
.qpco dt{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--c-innova-dark);padding-top:.2rem}
.qpco dd{margin:0}
.como{margin:0;padding-left:1.1rem;display:grid;gap:.25rem}
.reloj__cifra{font-size:3rem;font-weight:600;color:var(--c-ink);font-variant-numeric:tabular-nums;line-height:1}
.reloj__barra{height:.6rem;border-radius:99px;background:var(--c-green-light);overflow:hidden}
.reloj__barra span{display:block;height:100%;background:var(--gradient-verde);transition:width 1s linear}
.chat-demo{position:sticky;top:7rem}
.intro-din{min-height:60vh;display:grid;justify-items:center;align-content:center;gap:1rem;text-align:center;padding-block:3rem}
.intro-din__icono{display:grid;place-items:center;width:6rem;height:6rem;border-radius:50%;background:var(--c-white);color:var(--c-innova-dark);font-size:3rem;box-shadow:0 0 0 6px var(--c-green-mid);animation:latido 2s ease-in-out infinite}
@keyframes latido{50%{transform:scale(1.06)}}
.intro-din__titulo{font-size:clamp(2.2rem,6vw,4rem);font-weight:500;letter-spacing:-.04em;line-height:1}
.intro-din__texto{font-size:clamp(1.2rem,2.4vw,1.7rem);color:var(--c-ink);max-width:30ch}
.intro-din__boton{justify-self:center;font-size:1.1rem;padding:.9em 1.8em}
.aviso-sala{background:var(--c-rubi);color:var(--c-white);border-radius:1rem;padding:.7rem 1rem}
.aviso-sala strong{color:var(--c-white)}
</style>
