<script setup lang="ts">
// /panel · Seguimiento del equipo facilitador
// Peticiones de ayuda arriba; debajo, por dónde va cada equipo.
// ⚠️ La contraseña del panel llega más adelante.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { AGENDA } from '../data/agenda'
import { TEAM_DYNAMICS } from '../data/dynamics'
import { attendHelp, clearAll, resetToSeed, useStore } from '../data/store'
import { useNow } from '../composables/useNow'

const store = useStore()
const now = useNow()

const titleOf = (id: string) => TEAM_DYNAMICS.find((d) => d.id === id)?.title ?? 'En la sala'
const minutesAgo = (iso: string) => Math.max(0, Math.round((now.value - new Date(iso).getTime()) / 60_000))
const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

const pendientes = computed(() => store.db.helpRequests.filter((h) => !h.attendedAt).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
const atendidas = computed(() => store.db.helpRequests.filter((h) => h.attendedAt).slice(-8).reverse())
const paso = computed(() => AGENDA[store.db.room.step] ?? AGENDA[0])

const filas = computed(() =>
  store.db.teams.map((t) => {
    const p = store.progress(t.id)
    const s = store.setup(t.id)
    const i = p?.current ?? 0
    return {
      team: t,
      owner: s?.digitalOwner,
      paso: !s ? 'Sin empezar' : i >= TEAM_DYNAMICS.length ? 'Terminado' : `${i + 1}/${TEAM_DYNAMICS.length} · ${TEAM_DYNAMICS[i].title}`,
      fotos: store.photos(t.id).length,
      ayuda: !!store.pendingHelp(t.id),
    }
  }),
)

// Borrar afecta a TODOS los dispositivos: se pide escribir BORRAR para evitar sustos
function confirmar(texto: string) {
  return prompt(`${texto}\n\nAfecta a todos los equipos y dispositivos. Escribid BORRAR para confirmar.`)?.trim().toUpperCase() === 'BORRAR'
}
async function vaciar() {
  if (confirmar('Se borrará todo lo registrado por los equipos, también el ejemplo del equipo 07.')) await clearAll()
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
            <tr><th>Equipo</th><th>Ámbito</th><th>Digital owner</th><th>Dinámica</th><th>Fotos</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="f in filas" :key="f.team.id" :class="{ 'fila--ayuda': f.ayuda }">
              <td><RouterLink :to="`/equipo/${f.team.id}`">{{ f.team.name }}</RouterLink><span v-if="store.isDemo(f.team.id)" class="demo"> · ejemplo</span></td>
              <td>{{ store.areaName(f.team.area) }}</td>
              <td>{{ f.owner ?? '—' }}</td>
              <td>{{ f.paso }}</td>
              <td>{{ f.fotos }}</td>
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
.boton--sec{background:var(--c-white);box-shadow:inset 0 0 0 1.5px var(--c-ink)}
</style>
