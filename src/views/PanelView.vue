<script setup lang="ts">
// /panel · Seguimiento del equipo facilitador
// Peticiones de ayuda arriba; debajo, por dónde va cada equipo.
// ⚠️ La contraseña del panel llega más adelante.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { AGENDA } from '../data/agenda'
import { TEAM_DYNAMICS } from '../data/dynamics'
import { attendHelp, clearAll, closeLastDynamic, openNextDynamic, resetToSeed, setTeamPace, useStore } from '../data/store'
import { formatClock, useNow } from '../composables/useNow'
import EscaletaTimeline from '../components/EscaletaTimeline.vue'

const store = useStore()
const now = useNow()

const titleOf = (id: string) => TEAM_DYNAMICS.find((d) => d.id === id)?.title ?? 'En la sala'
const minutesAgo = (iso: string) => Math.max(0, Math.round((now.value - new Date(iso).getTime()) / 60_000))
const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

const pendientes = computed(() => store.db.helpRequests.filter((h) => !h.attendedAt).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
const atendidas = computed(() => store.db.helpRequests.filter((h) => h.attendedAt).slice(-8).reverse())
const paso = computed(() => AGENDA[store.db.room.step] ?? AGENDA[0])

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

function abrirSiguiente() {
  const r = restante.value
  const texto = dinSiguiente.value ? `«${dinSiguiente.value.title}»` : 'el final de las dinámicas de equipo'
  const aviso = r !== null && r > 0 ? `Todavía quedan ${formatClock(r)} de la dinámica actual. ` : ''
  if (confirm(`${aviso}¿Abrir ${texto} para todos los equipos?`)) openNextDynamic()
}
function volver() {
  if (confirm('¿Volver a la dinámica anterior para todos? Los equipos que ya hayan pasado se quedan donde están.')) closeLastDynamic()
}

const filas = computed(() =>
  store.db.teams.map((t) => {
    const p = store.progress(t.id)
    const s = store.setup(t.id)
    const i = p?.current ?? 0
    const din = TEAM_DYNAMICS[i]
    return {
      team: t,
      owner: s?.digitalOwner,
      paso: !s ? 'Sin empezar' : i >= TEAM_DYNAMICS.length ? 'Terminado' : `${i + 1}/${TEAM_DYNAMICS.length} · ${din.title}`,
      foto: !!(din && store.photoFor(t.id, din.id)),
      fotos: store.photos(t.id).length,
      ayuda: !!store.pendingHelp(t.id),
      // Excepción respecto al grupo: va por delante o se ha quedado retenido
      excepcion: p?.limit === undefined ? '' : p.limit > abierta.value ? 'Adelantado' : 'Retenido',
    }
  }),
)

// Borrar afecta a TODOS los dispositivos: se pide escribir BORRAR para evitar sustos
function confirmar(texto: string) {
  return prompt(`${texto}\n\nAfecta a todos los equipos y dispositivos. Escribid BORRAR para confirmar.`)?.trim().toUpperCase() === 'BORRAR'
}
async function vaciar() {
  if (confirmar('Se borrará todo lo registrado por los equipos, también el ejemplo del equipo G.')) await clearAll()
}
async function restaurar() {
  if (confirmar('Se sustituirán todos los datos por los datos de ejemplo.')) await resetToSeed()
}
</script>

<template>
  <main class="section s-claro">
    <div class="wrap">
      <div class="cabeza">
        <span class="kicker">Equipo facilitador</span>
        <h1 class="titular">Panel</h1>
        <p>
          Ahora en la sala: <strong>{{ paso.title }}</strong> ({{ paso.time }}) ·
          <RouterLink to="/sala">Abrir la presentación</RouterLink> ·
          Ámbitos {{ store.db.event.areasRevealed ? 'revelados' : 'sin revelar' }}
        </p>
      </div>

      <EscaletaTimeline />

      <section class="card ritmo">
        <span class="kicker">Dinámica abierta para todos los equipos</span>
        <template v-if="abierta < 0">
          <p>Todavía ninguna. La primera («{{ TEAM_DYNAMICS[0].title }}») se abre al <strong>revelar los ámbitos</strong> en la presentación, o con este botón.</p>
        </template>
        <template v-else-if="dinAbierta">
          <div class="ritmo__actual">
            <strong>{{ abierta + 1 }}/{{ TEAM_DYNAMICS.length }} · {{ dinAbierta.title }}</strong>
            <span v-if="restante !== null" class="ritmo__reloj" :class="{ 'ritmo__reloj--fin': restante <= 0 }">
              {{ restante > 0 ? formatClock(restante) : 'Tiempo terminado' }}
            </span>
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

      <div class="tabla-scroll">
        <table>
          <thead>
            <tr><th>Equipo</th><th>Ámbito</th><th>Digital owner</th><th>Dinámica</th><th>Foto</th><th>Ritmo</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="f in filas" :key="f.team.id" :class="{ 'fila--ayuda': f.ayuda }">
              <td><RouterLink :to="`/equipo/${f.team.id}`">{{ f.team.name }}</RouterLink><span v-if="store.isDemo(f.team.id)" class="demo"> · ejemplo</span></td>
              <td>{{ store.areaName(f.team.area) }}</td>
              <td>{{ f.owner ?? '—' }}</td>
              <td>{{ f.paso }}</td>
              <td><span :class="f.foto ? 'si' : 'no'">{{ f.foto ? '✓' : '—' }}</span> <small>({{ f.fotos }})</small></td>
              <td class="ritmo-equipo">
                <span v-if="f.excepcion" class="excepcion">{{ f.excepcion }}</span>
                <button class="mini" type="button" title="Se queda en su dinámica aunque el grupo avance" @click="setTeamPace(f.team.id, 'hold')">Retener</button>
                <button class="mini" type="button" title="Puede pasar ya a la siguiente dinámica" @click="setTeamPace(f.team.id, 'pass')">Dejar pasar</button>
                <button v-if="f.excepcion" class="mini" type="button" title="Vuelve a ir al ritmo del grupo" @click="setTeamPace(f.team.id, 'group')">Con el grupo</button>
              </td>
              <td><span v-if="f.ayuda" class="pide">Pide ayuda</span></td>
            </tr>
          </tbody>
        </table>
      </div>

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
.cabeza{display:grid;gap:.8rem}
.ayudas--activa{box-shadow:inset 0 0 0 3px var(--c-rubi)}
.ayudas__lista{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
.ayuda{display:flex;justify-content:space-between;align-items:center;gap:1rem;background:color-mix(in srgb,var(--c-rubi) 10%,var(--c-white));border-radius:1rem;padding:.8rem 1rem}
.ayuda div{display:grid}
.ayuda strong{color:var(--c-rubi);font-size:1.1rem}
.ayuda span{font-size:.85rem}
.vacio{font-style:italic}
.atendidas{margin:.4rem 0 0;padding-left:1.1rem;font-size:.85rem}
.tabla-scroll{overflow-x:auto;background:var(--c-white);border-radius:var(--radius-card);padding:1rem}
table{width:100%;border-collapse:collapse;font-size:.9rem;min-width:48rem}
th{text-align:left;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--c-innova-dark);padding:.5rem;border-bottom:1px solid var(--c-gris-10)}
td{padding:.55rem .5rem;border-bottom:1px solid var(--c-gris-10);color:var(--c-ink);white-space:nowrap}
.fila--ayuda td{background:color-mix(in srgb,var(--c-rubi) 8%,var(--c-white))}
.pide{background:var(--c-rubi);color:var(--c-white);border-radius:99px;padding:.15em .7em;font-size:.72rem;font-weight:700}
.demo{font-size:.75rem;color:var(--c-green-dark)}
.botones{display:flex;flex-wrap:wrap;gap:.6rem}
.ritmo{box-shadow:inset 0 0 0 3px var(--c-innova)}
.ritmo__actual{display:flex;flex-wrap:wrap;align-items:baseline;gap:.4rem 1.2rem}
.ritmo__actual strong{font-size:clamp(1.2rem,2.2vw,1.6rem);font-weight:500;color:var(--c-ink);letter-spacing:-.02em}
.ritmo__reloj{font-size:1.4rem;font-weight:600;color:var(--c-innova-dark);font-variant-numeric:tabular-nums}
.ritmo__reloj--fin{color:var(--c-rubi);font-size:1rem}
.si{color:var(--c-green-deep);font-weight:700}
.no{color:var(--c-gris-10)}
.ritmo-equipo{display:flex;gap:.3rem;align-items:center}
.mini{border:0;border-radius:99px;padding:.25em .7em;background:var(--c-green-light);color:var(--c-ink);font:inherit;font-size:.75rem;cursor:pointer}
.mini:hover{background:var(--c-innova)}
.excepcion{font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c-innova-dark);margin-right:.2rem}
.boton--sec{background:var(--c-white);box-shadow:inset 0 0 0 1.5px var(--c-ink)}
</style>
