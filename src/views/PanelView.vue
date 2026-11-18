<script setup lang="ts">
// /panel · Seguimiento del equipo facilitador
// Peticiones de ayuda arriba; debajo, por dónde va cada equipo.
import { askChoice, askConfirm } from '../composables/useConfirm'
import { computed, ref } from 'vue'
import { photosZip, saveFile } from '../data/photoZip'
import { AGENDA } from '../data/agenda'
import { PHASES } from '../data/config'
import { TEAM_DYNAMICS } from '../data/dynamics'
import { attendHelp, clearAll, closeLastDynamic, openNextDynamic, resetToSeed, setTeamPace, useStore } from '../data/store'
import { formatClock, useNow } from '../composables/useNow'
import EscaletaTimeline from '../components/EscaletaTimeline.vue'
import PanelEquipos from '../components/PanelEquipos.vue'
import PanelVotacion from '../components/PanelVotacion.vue'
import PanelTitulares from '../components/PanelTitulares.vue'
import PanelAvisos from '../components/PanelAvisos.vue'
import PanelReloj from '../components/PanelReloj.vue'

const store = useStore()
const now = useNow()

const titleOf = (id: string) => TEAM_DYNAMICS.find((d) => d.id === id)?.title ?? 'En la sala'
const minutesAgo = (iso: string) => Math.max(0, Math.round((now.value - new Date(iso).getTime()) / 60_000))
const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

const pendientes = computed(() => store.db.helpRequests.filter((h) => !h.attendedAt).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
const atendidas = computed(() => store.db.helpRequests.filter((h) => h.attendedAt).slice(-8).reverse())
const paso = computed(() => AGENDA[store.db.room.step] ?? AGENDA[0])
/** Desde el momento de la votación, la votación sube arriba del todo (con su botón de abrirla) */
const MOMENTOS_VOTACION = ['votacion', 'valoracion', 'resultados', 'cierre', 'comida']
const votacionArriba = computed(() => MOMENTOS_VOTACION.includes(paso.value.id))
/** Durante el traslado y el speed pitch se escriben los titulares: también suben arriba */
const titularesArriba = computed(() => votacionArriba.value || ['traslado', 'pitch'].includes(paso.value.id))

// --- Descargar todas las fotos en un ZIP, por equipos (para guardarlas en un Drive) ---
const zipProgreso = ref('')
const zipAviso = ref('')
async function descargarFotos() {
  const fotos = store.db.photos
  if (!fotos.length || zipProgreso.value) return
  zipAviso.value = ''
  zipProgreso.value = `Preparando 0 de ${fotos.length}…`
  try {
    const { zip, failed } = await photosZip(fotos, store.db.teams, (n, total) => (zipProgreso.value = `Preparando ${n} de ${total}…`))
    const d = new Date()
    const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
    saveFile(zip, `Las Rozas 2040 · Fotos ${stamp}.zip`)
    zipAviso.value = failed ? `Descargado, pero ${failed} ${failed === 1 ? 'foto no se ha' : 'fotos no se han'} podido incluir. Probad otra vez.` : '¡Descargado! Ahora podéis subir el ZIP a vuestro Drive.'
  } catch {
    zipAviso.value = 'No se ha podido preparar el ZIP. Comprobad la conexión y probad otra vez.'
  } finally {
    zipProgreso.value = ''
  }
}

// --- Ritmo: qué dinámica está abierta para todos ---
const abierta = computed(() => store.openDynamic())
const dinAbierta = computed(() => TEAM_DYNAMICS[abierta.value])
const dinSiguiente = computed(() => TEAM_DYNAMICS[abierta.value + 1])
const restante = computed(() => {
  const d = dinAbierta.value
  const at = d && store.db.event.openedAt?.[d.id]
  return d && at ? new Date(at).getTime() + d.minutes * 60_000 - now.value : null
})
const conFoto = computed(() =>
  dinAbierta.value ? store.db.teams.filter((t) => store.photoFor(t.id, dinAbierta.value!.id)).length : 0,
)

async function abrirSiguiente() {
  const r = restante.value
  const texto = dinSiguiente.value ? `«${dinSiguiente.value.title}»` : 'el final de las dinámicas de equipo'
  const aviso = r !== null && r > 0 ? `Todavía quedan ${formatClock(r)} de la dinámica actual. ` : ''
  // Abrir la primera dinámica de una fase nueva: quien aún no tenga la foto ya no vuelve a la sala
  const actual = dinAbierta.value
  const siguiente = dinSiguiente.value
  const faseNueva = !!actual && !!siguiente && actual.phase !== siguiente.phase
  const sinFoto = store.db.teams.length - conFoto.value
  const avisoFase = faseNueva
    ? `⚠️ Vais a abrir la fase de ${PHASES.find((p) => p.id === siguiente!.phase)?.name ?? 'la siguiente fase'}.` +
      (sinFoto > 0
        ? ` ${sinFoto} ${sinFoto === 1 ? 'equipo todavía no ha' : 'equipos todavía no han'} subido la foto de «${actual!.title}»: cuando la suban, pasarán directamente sin volver a la sala principal.`
        : '') + '\n\n'
    : ''
  // Equipos retenidos («Retener» en su tarjeta): no pasan aunque se abra para todos
  const retenidos = store.db.teams.filter((t) => {
    const lim = store.progress(t.id)?.limit
    return lim !== undefined && lim <= abierta.value
  })
  const pregunta = `${avisoFase}${aviso}¿Abrir ${texto} para todos los equipos?`
  if (!retenidos.length) {
    if (await askConfirm(pregunta, '', 'Sí, abrir')) openNextDynamic()
    return
  }
  const lista = retenidos.map((t) => t.id).join(', ').replace(/, ([^,]*)$/, ' y $1')
  const uno = retenidos.length === 1
  const avisoRetenidos = `⚠️ Todos pasarán salvo ${uno ? `el equipo ${lista}, que está retenido` : `los equipos ${lista}, que están retenidos`}.`
  const n = await askChoice(`${pregunta}\n\n${avisoRetenidos}`, [
    uno ? `Que pase también el ${lista}` : 'Que pasen también los retenidos',
    `Abrir, ${uno ? `el ${lista} sigue retenido` : 'siguen retenidos'}`,
  ])
  if (n < 0) return
  if (n === 0) for (const t of retenidos) setTeamPace(t.id, 'group')
  openNextDynamic()
}
async function volver() {
  if (await askConfirm('¿Volver a la dinámica anterior para todos? Los equipos que ya hayan pasado también vuelven, y su cronómetro empieza de nuevo.')) closeLastDynamic()
}

// Borrar afecta a TODOS los dispositivos: se pide escribir BORRAR para evitar sustos
function confirmar(texto: string) {
  return askConfirm(`${texto}\n\nAfecta a todos los equipos y dispositivos.`, 'BORRAR', 'Borrar')
}
async function vaciar() {
  if (await confirmar('Se borrará todo lo registrado por los equipos, también el ejemplo del equipo E.')) await clearAll()
}
async function restaurar() {
  if (await confirmar('Se sustituirán todos los datos por los datos de ejemplo.')) await resetToSeed()
}
</script>

<template>
  <main class="section s-claro panel">
    <div class="wrap">
      <div class="cabeza">
        <span class="kicker">Equipo facilitador</span>
        <h1 class="titular">Panel</h1>
        <p>
          Ahora en la jornada: <strong>{{ paso.title }}</strong> ({{ paso.time }})
        </p>
      </div>

      <PanelReloj />

      <EscaletaTimeline />

      <PanelTitulares v-if="titularesArriba" class="votacion-arriba" />
      <PanelVotacion v-if="votacionArriba" class="votacion-arriba" />

      <section class="card ritmo">
        <span class="kicker">Dinámica abierta para todos los equipos</span>
        <template v-if="abierta < 0">
          <p>Todavía ninguna. La primera («{{ TEAM_DYNAMICS[0].title }}») se abre con este botón, que también <strong>revela los ámbitos</strong> a los participantes.</p>
        </template>
        <template v-else-if="dinAbierta">
          <div class="ritmo__actual">
            <strong>{{ abierta + 1 }}/{{ TEAM_DYNAMICS.length }} · {{ dinAbierta.title }}</strong>
            <span v-if="restante !== null" class="ritmo__reloj" :class="{ 'ritmo__reloj--fin': restante <= 0 }">
              {{ restante > 0 ? formatClock(restante) : 'Tiempo terminado' }}
            </span>
            <span class="ritmo__total">de {{ dinAbierta.minutes }} min</span>
          </div>
          <p>Han subido su foto <strong>{{ conFoto }} de {{ store.db.teams.length }}</strong> equipos. Los equipos no pasan a la siguiente hasta que la abráis.</p>
        </template>
        <p v-else>Todas las dinámicas de equipo están cerradas.</p>
        <div class="botones">
          <button v-if="abierta < TEAM_DYNAMICS.length" class="boton" type="button" @click="abrirSiguiente">
            {{ dinSiguiente ? `Abrir para todos: ${dinSiguiente.title} →` : 'Terminar las dinámicas de equipo' }}
          </button>
          <button v-if="abierta > 0" class="boton boton--sec" type="button" @click="volver">← Volver a la anterior</button>
        </div>
      </section>

      <section class="card ayudas" :class="{ 'ayudas--activa': pendientes.length }">
        <span class="kicker">Peticiones de ayuda</span>
        <p v-if="!pendientes.length" class="vacio">Ningún equipo pide ayuda ahora mismo.</p>
        <ul v-else class="ayudas__lista">
          <li v-for="h in pendientes" :key="h.id" class="ayuda">
            <div>
              <strong>{{ store.team(h.teamId)?.name }}</strong>
              <span>{{ titleOf(h.dynamicId) }} · hace {{ minutesAgo(h.createdAt) }} min · {{ store.setup(h.teamId)?.digitalOwner }}</span>
              <span v-if="h.takenBy" class="ayuda__va">Va {{ h.takenBy }}</span>
            </div>
            <button class="boton" type="button" @click="attendHelp(h.id)">Atendida</button>
          </li>
        </ul>
        <details v-if="atendidas.length">
          <summary>Atendidas ({{ atendidas.length }})</summary>
          <ul class="atendidas">
            <li v-for="h in atendidas" :key="h.id">{{ store.team(h.teamId)?.name }} · {{ titleOf(h.dynamicId) }} · {{ hora(h.createdAt) }}</li>
          </ul>
        </details>
      </section>

      <PanelAvisos />

      <PanelEquipos />

      <PanelTitulares v-if="!titularesArriba" />
      <PanelVotacion v-if="!votacionArriba" />

      <section class="card">
        <span class="kicker">Copia de las fotos</span>
        <p>Descarga todas las fotos en un ZIP, ordenadas en una carpeta por equipo. Después, subidlo a vuestro Drive. Podéis hacerlo varias veces durante el día.</p>
        <div class="botones">
          <button class="boton" type="button" :disabled="!store.db.photos.length || !!zipProgreso" @click="descargarFotos">
            {{ zipProgreso || `Descargar todas las fotos (${store.db.photos.length})` }}
          </button>
        </div>
        <p v-if="zipAviso" class="zip-aviso">{{ zipAviso }}</p>
      </section>

      <section class="card">
        <span class="kicker">Datos</span>
        <p>Antes del evento hay que dejar todo en blanco. Mientras preparamos, podéis volver a los datos de ejemplo.</p>
        <div class="botones">
          <button class="boton" type="button" @click="restaurar">Restaurar datos de ejemplo</button>
          <button class="boton boton--sec" type="button" @click="vaciar">Dejar todo en blanco</button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.ayuda__va{justify-self:start;display:inline-block;margin-top:.2rem;background:var(--c-green-light);color:var(--c-ink);border-radius:99px;padding:.1em .7em;font-size:.8rem;font-weight:600}
.zip-aviso{margin:0;font-weight:600;color:var(--c-innova-dark)}
.boton:disabled{opacity:.6;cursor:progress;transform:none}
.panel{padding-block:1.2rem 4rem}
.cabeza{display:flex;flex-wrap:wrap;align-items:baseline;gap:.2rem 1.2rem}
.cabeza .kicker{width:100%}
.cabeza .titular{font-size:clamp(1.8rem,3vw,2.4rem);line-height:1.1;margin:0}
.cabeza p{margin:0}
.ayudas--activa{box-shadow:inset 0 0 0 3px var(--c-rubi)}
.ayudas__lista{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
.ayuda{display:flex;justify-content:space-between;align-items:center;gap:1rem;background:color-mix(in srgb,var(--c-rubi) 10%,var(--c-white));border-radius:1rem;padding:.8rem 1rem}
.ayuda div{display:grid}
.ayuda strong{color:var(--c-rubi);font-size:1.1rem}
.ayuda span{font-size:.85rem}
.vacio{font-style:italic}
.atendidas{margin:.4rem 0 0;padding-left:1.1rem;font-size:.85rem}
.botones{display:flex;flex-wrap:wrap;gap:.6rem}
.ritmo{box-shadow:inset 0 0 0 3px var(--c-innova)}
.ritmo__actual{display:flex;flex-wrap:wrap;align-items:baseline;gap:.4rem 1.2rem}
.ritmo__actual strong{font-size:clamp(1.2rem,2.2vw,1.6rem);font-weight:500;color:var(--c-ink);letter-spacing:-.02em}
.ritmo__reloj{font-size:1.4rem;font-weight:600;color:var(--c-innova-dark);font-variant-numeric:tabular-nums}
.ritmo__reloj--fin{color:var(--c-rubi);font-size:1rem}
.votacion-arriba{box-shadow:inset 0 0 0 3px var(--c-innova)}
.ritmo__total{font-size:.9rem;color:var(--c-green-dark)}
.boton--sec{background:var(--c-white);box-shadow:inset 0 0 0 1.5px var(--c-ink)}
</style>
