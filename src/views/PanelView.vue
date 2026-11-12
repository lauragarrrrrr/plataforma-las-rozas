<script setup lang="ts">
// /panel · Equipo facilitador (hito 1: seguimiento de equipos; control completo en el hito 4)
// ⚠️ La contraseña del panel llega en el hito 4.
import { RouterLink } from 'vue-router'
import { PHASES } from '../data/config'
import { clearAll, resetToSeed, useStore } from '../data/store'
import PhaseStateTag from '../components/PhaseStateTag.vue'

const store = useStore()

function vaciar() {
  if (confirm('Se borrará todo lo registrado por los equipos, también el ejemplo del equipo 07. ¿Seguro?')) clearAll()
}
function restaurar() {
  if (confirm('Se sustituirán los datos actuales por los datos de ejemplo. ¿Seguro?')) resetToSeed()
}
</script>

<template>
  <main class="section s-claro">
    <div class="wrap">
      <div class="cabeza">
        <span class="kicker">Equipo facilitador</span>
        <h1 class="titular">Panel</h1>
        <p class="intro">Seguimiento de los 12 equipos. Ámbitos {{ store.db.event.areasRevealed ? 'revelados' : 'todavía sin revelar' }}.</p>
      </div>

      <div class="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Ámbito</th>
              <th v-for="f in PHASES" :key="f.id">{{ f.number }} · {{ f.name }}</th>
              <th>Fotos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in store.db.teams" :key="t.id">
              <td><RouterLink :to="`/equipo/${t.id}`">{{ t.name }}</RouterLink><span v-if="store.isDemo(t.id)" class="demo"> · ejemplo</span></td>
              <td>{{ store.areaName(t.area) }}</td>
              <td v-for="f in PHASES" :key="f.id"><PhaseStateTag :state="t.phases[f.id]" /></td>
              <td>{{ store.photos(t.id).length }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section class="card datos">
        <span class="kicker">Datos</span>
        <p>Antes del evento hay que dejar todo en blanco. Mientras construimos, podéis volver a los datos de ejemplo.</p>
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
.tabla-scroll{overflow-x:auto;background:var(--c-white);border-radius:var(--radius-card);padding:1rem}
table{width:100%;border-collapse:collapse;font-size:.9rem;min-width:52rem}
th{text-align:left;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--c-innova-dark);padding:.5rem;border-bottom:1px solid var(--c-gris-10)}
td{padding:.55rem .5rem;border-bottom:1px solid var(--c-gris-10);color:var(--c-ink);white-space:nowrap}
.demo{font-size:.75rem;color:var(--c-green-dark)}
.botones{display:flex;flex-wrap:wrap;gap:.6rem}
.boton--sec{background:var(--c-white);box-shadow:inset 0 0 0 1.5px var(--c-ink)}
</style>
