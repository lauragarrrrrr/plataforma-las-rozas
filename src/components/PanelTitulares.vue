<script setup lang="ts">
// Panel · Titulares para la votación.
// El equipo facilitador escribe el titular de la portada de cada equipo mirando su foto.
// En la votación se ve el titular (no la foto). Se guarda al salir de la casilla o con Intro.
import { computed, reactive, watch } from 'vue'
import { openPhoto } from '../composables/usePhotoViewer'
import { setCoverHeadline, useStore } from '../data/store'

const store = useStore()
const borradores = reactive<Record<string, string>>({})
/** Casillas que alguien está escribiendo ahora (no se pisan con lo que llega) */
const editando: Record<string, true> = {}

// Rellena las casillas con lo guardado (y lo que escriba otra persona del equipo facilitador)
watch(
  () => store.db.teams.map((t) => store.coverHeadline(t.id)),
  () => { for (const t of store.db.teams) if (!(t.id in editando)) borradores[t.id] = store.coverHeadline(t.id) },
  { immediate: true },
)

function guardar(teamId: string) {
  delete editando[teamId]
  const v = (borradores[teamId] ?? '').trim()
  if (v !== store.coverHeadline(teamId)) setCoverHeadline(teamId, v)
}

const portada = (teamId: string) => store.photoFor(teamId, 'portada')?.url
const hechos = computed(() => store.db.teams.filter((t) => store.coverHeadline(t.id)).length)
</script>

<template>
  <section class="card titulares">
    <div class="cab">
      <span class="kicker">Titulares para la votación</span>
      <small>{{ hechos }} de {{ store.db.teams.length }} escritos</small>
    </div>
    <p class="nota">Escribid el titular de la portada de cada equipo, mirando su foto. En la votación se ve este titular.</p>
    <ul class="lista">
      <li v-for="t in store.db.teams" :key="t.id" class="fila">
        <span class="letra">{{ t.id }}</span>
        <input
          v-model="borradores[t.id]"
          type="text"
          maxlength="140"
          :placeholder="`Titular del equipo ${t.id}`"
          @focus="editando[t.id] = true"
          @blur="guardar(t.id)"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
        <button v-if="portada(t.id)" type="button" class="ver" @click="openPhoto(portada(t.id)!, `Portada del equipo ${t.id}`)">Ver portada</button>
        <span v-else class="sin">Sin foto</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.titulares{display:grid;gap:.8rem}
.cab{display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
.cab small{font-size:.85rem}
.nota{margin:0;font-size:.85rem}
.lista{list-style:none;margin:0;padding:0;display:grid;gap:.45rem}
.fila{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.6rem}
.letra{display:grid;place-items:center;width:2rem;height:2rem;border-radius:50%;background:var(--c-innova-dark);color:var(--c-white);font-weight:600}
.fila input{font-family:var(--font-paper);font-size:1rem;color:var(--c-ink);background:var(--c-white);border:1.5px solid var(--c-paper-line);border-radius:.8rem;padding:.5em .8em;min-width:0}
.fila input:focus{outline:none;border-color:var(--c-innova)}
.ver{border:0;border-radius:99px;padding:.4em .9em;background:var(--c-green-light);color:var(--c-ink);font:inherit;font-size:.8rem;font-weight:600;cursor:pointer;white-space:nowrap}
.sin{font-size:.75rem;color:var(--c-green-dark);white-space:nowrap}
</style>
