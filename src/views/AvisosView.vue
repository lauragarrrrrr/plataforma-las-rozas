<script setup lang="ts">
// /avisos · Móvil de cada persona del equipo facilitador (Andrea, Juanjo, Irene…)
// 1. ¿Quién eres? y ¿qué equipos llevas? (se recuerda en este móvil)
// 2. Las peticiones de ayuda de tus equipos: «Voy yo» (los demás ven «Va Andrea») y «Atendida».
//    Suena y vibra cuando llega una nueva (hay que activarlo una vez: el navegador lo pide).
// 3. Cómo va cada uno de tus equipos. Las de otros equipos, aparte, por si nadie las coge.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { FACILITATORS } from '../data/config'
import { ALL_DYNAMICS, TEAM_DYNAMICS } from '../data/dynamics'
import { attendHelp, takeHelp, useStore } from '../data/store'
import { useNow } from '../composables/useNow'
import type { HelpRequest } from '../data/types'

const store = useStore()
const now = useNow()

// --- Quién soy y qué equipos llevo (solo en este móvil) ---
const KEY = 'lr2040-avisos'
interface Yo { name: string; teams: string[] }
function leer(): Yo | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') } catch { return null }
}
const yo = ref<Yo | null>(leer())
const eligiendo = ref(!yo.value)
const borrador = ref<Yo>({ name: yo.value?.name ?? '', teams: [...(yo.value?.teams ?? [])] })
const otroNombre = ref('')
const LETRAS = computed(() => store.db.teams.map((t) => t.id))
function alternar(id: string) {
  const t = borrador.value.teams
  borrador.value.teams = t.includes(id) ? t.filter((x) => x !== id) : [...t, id].sort()
}
function guardar() {
  const name = (otroNombre.value.trim() || borrador.value.name).trim()
  if (!name) return
  yo.value = { name, teams: borrador.value.teams.length ? borrador.value.teams : [...LETRAS.value] }
  try { localStorage.setItem(KEY, JSON.stringify(yo.value)) } catch { /* solo esta visita */ }
  eligiendo.value = false
}
function cambiar() {
  borrador.value = { name: yo.value?.name ?? '', teams: [...(yo.value?.teams ?? [])] }
  otroNombre.value = FACILITATORS.includes(borrador.value.name) ? '' : borrador.value.name
  eligiendo.value = true
}

// --- Peticiones de ayuda ---
const pendientes = computed(() => store.db.helpRequests.filter((h) => !h.attendedAt).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
const mias = computed(() => pendientes.value.filter((h) => yo.value?.teams.includes(h.teamId)))
const otras = computed(() => pendientes.value.filter((h) => !yo.value?.teams.includes(h.teamId)))
const titleOf = (id: string) => ALL_DYNAMICS.find((d) => d.id === id)?.title ?? id
const hace = (iso: string) => Math.max(0, Math.floor((now.value - new Date(iso).getTime()) / 60_000))
const equipo = (id: string) => store.team(id)?.name ?? `Equipo ${id}`
function voy(h: HelpRequest) { if (yo.value) takeHelp(h.id, yo.value.name) }

// --- Sonido, vibración y pantalla encendida (hay que activarlo con un toque) ---
const activado = ref(false)
let audio: AudioContext | null = null
let wakeLock: { release: () => Promise<void> } | null = null
async function activar() {
  try {
    audio = new AudioContext()
    await audio.resume()
  } catch { audio = null }
  try {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }
    wakeLock = (await nav.wakeLock?.request('screen')) ?? null
  } catch { wakeLock = null }
  activado.value = true
  sonar()
}
function sonar() {
  try { navigator.vibrate?.([250, 120, 250]) } catch { /* sin vibración */ }
  if (!audio) return
  const t = audio.currentTime
  for (const [i, f] of [880, 1175].entries()) {
    const o = audio.createOscillator()
    const g = audio.createGain()
    o.frequency.value = f
    g.gain.setValueAtTime(0.0001, t + i * 0.18)
    g.gain.exponentialRampToValueAtTime(0.4, t + i * 0.18 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 0.16)
    o.connect(g).connect(audio.destination)
    o.start(t + i * 0.18)
    o.stop(t + i * 0.18 + 0.18)
  }
}
onBeforeUnmount(() => { wakeLock?.release().catch(() => {}); audio?.close().catch(() => {}) })

// Avisa cuando llega una petición nueva de uno de mis equipos
const vistas = new Set(mias.value.map((h) => h.id))
watch(mias, (lista) => {
  const nuevas = lista.filter((h) => !vistas.has(h.id))
  lista.forEach((h) => vistas.add(h.id))
  if (nuevas.length && activado.value) sonar()
})

// Título de la pestaña: «(2) Avisos»
watch(() => mias.value.length, (n) => {
  document.title = `${n ? `(${n}) ` : ''}Avisos · Las Rozas 2040`
}, { immediate: true })

// --- Cómo van mis equipos ---
const estados = computed(() => (yo.value?.teams ?? []).map((id) => {
  const setup = store.setup(id)
  const p = store.progress(id)
  const i = p?.current ?? 0
  const terminado = i >= TEAM_DYNAMICS.length
  const din = TEAM_DYNAMICS[Math.min(i, TEAM_DYNAMICS.length - 1)]
  return {
    id,
    nombre: equipo(id),
    owner: setup?.digitalOwner ?? '',
    sinEmpezar: !setup?.digitalOwner,
    dinamica: terminado ? 'Han terminado las dinámicas' : din.title,
    foto: !terminado && !!store.photoFor(id, din.id),
    ayuda: !!store.pendingHelp(id),
  }
}))
</script>

<template>
  <main class="section s-claro avisos">
    <div class="wrap">
      <!-- 1 · ¿Quién eres? -->
      <div v-if="eligiendo" class="card elegir">
        <span class="kicker">Avisos del equipo facilitador</span>
        <h1 class="avisos__titulo">¿Quién eres?</h1>
        <div class="chips">
          <button v-for="n in FACILITATORS" :key="n" type="button" class="chip" :class="{ 'chip--on': borrador.name === n && !otroNombre }" @click="borrador.name = n; otroNombre = ''">{{ n }}</button>
        </div>
        <input v-model="otroNombre" class="campo" type="text" maxlength="20" autocomplete="off" placeholder="Otro nombre" />

        <h2 class="avisos__sub">¿Qué equipos llevas?</h2>
        <div class="chips chips--letras">
          <button v-for="l in LETRAS" :key="l" type="button" class="chip chip--letra" :class="{ 'chip--on': borrador.teams.includes(l) }" :aria-pressed="borrador.teams.includes(l)" @click="alternar(l)">{{ l }}</button>
        </div>
        <p class="nota">Si no marcas ninguno, recibirás los avisos de todos los equipos.</p>
        <button class="boton" type="button" :disabled="!(otroNombre.trim() || borrador.name)" @click="guardar">Empezar a recibir avisos</button>
      </div>

      <template v-else-if="yo">
        <header class="cab">
          <div>
            <span class="kicker">Avisos · {{ yo.name }}</span>
            <p class="cab__equipos">Tus equipos: <strong>{{ yo.teams.join(', ') }}</strong></p>
          </div>
          <button class="enlace" type="button" @click="cambiar">Cambiar</button>
        </header>

        <button v-if="!activado" class="boton activar" type="button" @click="activar">🔔 Activar sonido y vibración</button>

        <!-- 2 · Peticiones de ayuda de mis equipos -->
        <section class="bloque">
          <h1 class="avisos__titulo">{{ mias.length ? `${mias.length} ${mias.length === 1 ? 'equipo pide' : 'equipos piden'} ayuda` : 'Nadie pide ayuda' }}</h1>
          <p v-if="!mias.length" class="nota">Cuando uno de tus equipos pulse «Pedir ayuda», aparecerá aquí.</p>
          <article v-for="h in mias" :key="h.id" class="ayuda" :class="{ 'ayuda--cogida': h.takenBy }">
            <div class="ayuda__txt">
              <strong>{{ equipo(h.teamId) }}</strong>
              <span>{{ titleOf(h.dynamicId) }} · hace {{ hace(h.createdAt) }} min</span>
              <span v-if="h.takenBy" class="ayuda__va">{{ h.takenBy === yo.name ? 'Vas tú' : `Va ${h.takenBy}` }}</span>
            </div>
            <div class="ayuda__botones">
              <button v-if="h.takenBy !== yo.name" class="boton boton--sec" type="button" @click="voy(h)">Voy yo</button>
              <button class="boton" type="button" @click="attendHelp(h.id)">Atendida</button>
            </div>
          </article>
        </section>

        <!-- Otros equipos: por si nadie las coge -->
        <details v-if="otras.length" class="otras">
          <summary>Otros equipos piden ayuda ({{ otras.length }})</summary>
          <article v-for="h in otras" :key="h.id" class="ayuda ayuda--otra">
            <div class="ayuda__txt">
              <strong>{{ equipo(h.teamId) }}</strong>
              <span>{{ titleOf(h.dynamicId) }} · hace {{ hace(h.createdAt) }} min</span>
              <span v-if="h.takenBy" class="ayuda__va">Va {{ h.takenBy }}</span>
            </div>
            <div class="ayuda__botones">
              <button v-if="!h.takenBy" class="boton boton--sec" type="button" @click="voy(h)">Voy yo</button>
              <button class="boton" type="button" @click="attendHelp(h.id)">Atendida</button>
            </div>
          </article>
        </details>

        <!-- 3 · Cómo van mis equipos -->
        <section class="bloque">
          <span class="kicker">Cómo van tus equipos</span>
          <ul class="estados">
            <li v-for="e in estados" :key="e.id" class="estado" :class="{ 'estado--ayuda': e.ayuda }">
              <span class="estado__letra">{{ e.id }}</span>
              <div>
                <strong>{{ e.sinEmpezar ? 'Sin digital owner todavía' : e.dinamica }}</strong>
                <span v-if="!e.sinEmpezar">{{ e.owner }} · {{ e.foto ? 'Foto subida ✓' : 'Sin foto todavía' }}</span>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.avisos .wrap{display:grid;gap:1.2rem;max-width:36rem}
.avisos__titulo{margin:0;font-size:clamp(1.6rem,6vw,2.2rem);font-weight:600;letter-spacing:-.03em;line-height:1.15;color:var(--c-ink)}
.avisos__sub{margin:.6rem 0 0;font-size:1.2rem;font-weight:600;color:var(--c-ink)}
.elegir{display:grid;gap:.8rem}
.chips{display:flex;flex-wrap:wrap;gap:.5rem}
.chips--letras{display:grid;grid-template-columns:repeat(6,1fr)}
.chip{font:inherit;font-size:1.05rem;font-weight:500;color:var(--c-ink);background:var(--c-green-light);border:0;border-radius:99px;padding:.6em 1.1em;cursor:pointer}
.chip--letra{padding:.6em 0;font-weight:700}
.chip--on{background:var(--c-innova);color:var(--c-ink);box-shadow:inset 0 0 0 2px var(--c-innova-dark)}
.campo{font:inherit;font-size:1rem;color:var(--c-ink);border:2px solid var(--c-paper-line);border-radius:99px;padding:.6em 1.1em;width:100%;box-sizing:border-box}
.campo:focus{outline:none;border-color:var(--c-innova)}
.nota{margin:0;font-size:.9rem}
.boton:disabled{opacity:.45;cursor:not-allowed;transform:none}
.cab{display:flex;justify-content:space-between;align-items:center;gap:1rem}
.cab__equipos{margin:0;color:var(--c-ink)}
.enlace{border:0;background:none;padding:0;font:inherit;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}
.activar{justify-self:stretch;justify-content:center;font-size:1.05rem;padding:1em}
.bloque{display:grid;gap:.7rem}
.ayuda{display:grid;gap:.8rem;background:var(--c-white);border-radius:1.2rem;padding:1rem 1.1rem;box-shadow:inset 0 0 0 3px var(--c-rubi)}
.ayuda--cogida{box-shadow:inset 0 0 0 2px var(--c-green-mid)}
.ayuda--otra{box-shadow:inset 0 0 0 1px var(--c-gris-10);margin-top:.5rem}
.ayuda__txt{display:grid;gap:.15rem}
.ayuda__txt strong{font-size:1.4rem;color:var(--c-rubi);line-height:1.2}
.ayuda--cogida .ayuda__txt strong{color:var(--c-ink)}
.ayuda__txt span{font-size:.95rem}
.ayuda__va{justify-self:start;margin-top:.2rem;background:var(--c-green-light);color:var(--c-ink);border-radius:99px;padding:.15em .8em;font-weight:600}
.ayuda__botones{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.ayuda__botones .boton{justify-self:stretch;justify-content:center;font-size:1rem;padding:.8em .5em}
.ayuda__botones .boton:only-child{grid-column:1 / -1}
.boton--sec{background:var(--c-green-light)}
.otras summary{cursor:pointer;font-weight:600;color:var(--c-ink)}
.estados{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
.estado{display:grid;grid-template-columns:auto 1fr;gap:.8rem;align-items:center;background:var(--c-white);border-radius:1rem;padding:.7rem .9rem}
.estado--ayuda{box-shadow:inset 0 0 0 2px var(--c-rubi)}
.estado__letra{display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;background:var(--gradient-anio);color:var(--c-white);font-weight:700;font-size:1.3rem}
.estado div{display:grid}
.estado strong{color:var(--c-ink);font-weight:600}
.estado span{font-size:.85rem}
</style>
