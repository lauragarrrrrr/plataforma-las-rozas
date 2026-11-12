<script setup lang="ts">
// Panel · seguimiento de los equipos
// 1. Fotos recién subidas por todos los equipos (la más nueva primero).
// 2. Una tarjeta por equipo: dónde va, si ha subido la foto, sus fotos y el ritmo.
// 3. Ventana con todas las fotos de un equipo, agrupadas por dinámica.
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ALL_DYNAMICS, TEAM_DYNAMICS } from '../data/dynamics'
import { setTeamPace, useStore } from '../data/store'
import { useNow } from '../composables/useNow'
import type { Team } from '../data/types'

const store = useStore()
const now = useNow()

const titleOf = (id?: string) => ALL_DYNAMICS.find((d) => d.id === id)?.title ?? 'Otra'
const hace = (iso: string) => {
  const min = Math.max(0, Math.round((now.value - new Date(iso).getTime()) / 60_000))
  return min < 1 ? 'ahora mismo' : `hace ${min} min`
}

// --- 1. Fotos recién subidas ---
const recientes = computed(() => store.db.photos.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 14))

// --- 2. Tarjetas ---
const abierta = computed(() => store.openDynamic())
const tarjetas = computed(() =>
  store.db.teams.map((t) => {
    const p = store.progress(t.id)
    const s = store.setup(t.id)
    const i = p?.current ?? 0
    const din = TEAM_DYNAMICS[i]
    const terminado = i >= TEAM_DYNAMICS.length
    return {
      team: t,
      owner: s?.digitalOwner,
      empezado: !!s,
      i,
      terminado,
      din,
      fotoActual: !!(din && store.photoFor(t.id, din.id)),
      fotos: store.photos(t.id).length,
      ayuda: !!store.pendingHelp(t.id),
      excepcion: p?.limit === undefined ? '' : p.limit > abierta.value ? 'Adelantado' : 'Retenido',
    }
  }),
)

// --- 3. Fotos de un equipo ---
const viendo = ref<Team | null>(null)
const dialogo = ref<HTMLDialogElement>()
const fotosDe = computed(() => {
  if (!viendo.value) return []
  const fotos = store.photos(viendo.value.id)
  return ALL_DYNAMICS.map((d) => ({ d, fotos: fotos.filter((p) => p.dynamicId === d.id) })).filter((x) => x.fotos.length)
})
function verFotos(t: Team) {
  viendo.value = t
  dialogo.value?.showModal()
}
</script>

<template>
  <!-- 1 · Fotos recién subidas -->
  <section class="card recientes">
    <div class="cab">
      <span class="kicker">Fotos recién subidas</span>
      <small>{{ store.db.photos.length }} en total · al pulsar se abren en grande</small>
    </div>
    <p v-if="!recientes.length" class="vacio">Todavía no ha llegado ninguna foto.</p>
    <ol v-else class="tira">
      <li v-for="p in recientes" :key="p.id">
        <a :href="p.url" target="_blank" rel="noopener">
          <img :src="p.url" :alt="`${store.team(p.teamId)?.name} · ${titleOf(p.dynamicId)}`" loading="lazy" />
          <span class="tira__txt"><strong>{{ store.team(p.teamId)?.name }}</strong> {{ titleOf(p.dynamicId) }}</span>
          <span class="tira__hora">{{ hace(p.createdAt) }}</span>
        </a>
      </li>
    </ol>
  </section>

  <!-- 2 · Equipos -->
  <section class="equipos" aria-label="Equipos">
    <article
      v-for="c in tarjetas"
      :key="c.team.id"
      class="equipo"
      :class="{ 'equipo--ayuda': c.ayuda, 'equipo--vacio': !c.empezado }"
    >
      <header class="equipo__cab">
        <span class="letra">{{ c.team.id }}</span>
        <div>
          <strong>{{ store.areaName(c.team.area) }}</strong>
          <small>{{ c.owner ? `Digital owner: ${c.owner}` : 'Todavía no ha entrado' }}<template v-if="store.isDemo(c.team.id)"> · ejemplo</template></small>
        </div>
        <span v-if="c.ayuda" class="pide">Pide ayuda</span>
      </header>

      <template v-if="c.empezado">
        <div class="progreso" :aria-label="`Dinámica ${Math.min(c.i + 1, TEAM_DYNAMICS.length)} de ${TEAM_DYNAMICS.length}`">
          <span v-for="(d, n) in TEAM_DYNAMICS" :key="d.id" :class="{ hecho: n < c.i, actual: n === c.i }" :title="d.title"></span>
        </div>
        <p class="equipo__din">
          <template v-if="c.terminado">Ha terminado todas las dinámicas</template>
          <template v-else>{{ c.i + 1 }}/{{ TEAM_DYNAMICS.length }} · <strong>{{ c.din.title }}</strong></template>
        </p>
        <p v-if="!c.terminado" class="estado" :class="c.fotoActual ? 'estado--si' : 'estado--no'">
          {{ c.fotoActual ? '✓ Foto subida: esperando la siguiente' : 'Trabajando · sin foto todavía' }}
        </p>
      </template>

      <div class="equipo__pie">
        <button class="ver" type="button" :disabled="!c.fotos" @click="verFotos(c.team)">
          Ver fotos ({{ c.fotos }})
        </button>
        <RouterLink class="abrir" :to="`/equipo/${c.team.id}`">Abrir su pantalla</RouterLink>
      </div>

      <details v-if="c.empezado" class="ritmo">
        <summary>Ritmo<span v-if="c.excepcion" class="excepcion"> · {{ c.excepcion }}</span></summary>
        <div class="ritmo__botones">
          <button type="button" title="Se queda en su dinámica aunque el grupo avance" @click="setTeamPace(c.team.id, 'hold')">Retener</button>
          <button type="button" title="Puede pasar ya a la siguiente dinámica" @click="setTeamPace(c.team.id, 'pass')">Dejar pasar</button>
          <button v-if="c.excepcion" type="button" title="Vuelve a ir al ritmo del grupo" @click="setTeamPace(c.team.id, 'group')">Con el grupo</button>
        </div>
      </details>
    </article>
  </section>

  <!-- 3 · Fotos de un equipo -->
  <dialog ref="dialogo" class="visor" @close="viendo = null">
    <header class="visor__cab">
      <div>
        <span class="kicker">Fotos del equipo</span>
        <strong>{{ viendo?.name }} · {{ viendo ? store.areaName(viendo.area) : '' }}</strong>
      </div>
      <button class="cerrar" type="button" aria-label="Cerrar" @click="dialogo?.close()">✕</button>
    </header>
    <div class="visor__cuerpo">
      <section v-for="x in fotosDe" :key="x.d.id" class="visor__bloque">
        <h3>{{ x.d.title }} <small>· {{ x.fotos.length }} {{ x.fotos.length === 1 ? 'foto' : 'fotos' }}</small></h3>
        <div class="visor__grid">
          <a v-for="p in x.fotos" :key="p.id" :href="p.url" target="_blank" rel="noopener">
            <img :src="p.url" :alt="x.d.title" loading="lazy" />
            <span>{{ new Date(p.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }}</span>
          </a>
        </div>
      </section>
      <p class="nota">Para guardar una foto: ábrela y usa «Guardar imagen como…».</p>
    </div>
  </dialog>
</template>

<style scoped>
.cab{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.3rem 1rem;align-items:baseline}
.cab small{font-size:.8rem}
.vacio{font-style:italic}
.tira{list-style:none;margin:0;padding:0 0 .5rem;display:flex;gap:.7rem;overflow-x:auto;scrollbar-width:thin}
.tira li{flex:none;width:10rem}
.tira a{display:grid;gap:.25rem;text-decoration:none;color:var(--c-green-dark)}
.tira img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:.8rem;background:var(--c-green-light)}
.tira__txt{font-size:.78rem;line-height:1.3}
.tira__txt strong{color:var(--c-ink)}
.tira__hora{font-size:.7rem;color:var(--c-innova-dark);font-weight:600}

.equipos{display:grid;grid-template-columns:repeat(auto-fill,minmax(17rem,1fr));gap:1rem}
.equipo{background:var(--c-white);border-radius:var(--radius-card);padding:1.1rem 1.2rem;display:grid;gap:.7rem;align-content:start}
.equipo--ayuda{box-shadow:inset 0 0 0 3px var(--c-rubi)}
.equipo--vacio{opacity:.65}
.equipo__cab{display:grid;grid-template-columns:auto 1fr auto;gap:.7rem;align-items:center}
.equipo__cab div{display:grid;line-height:1.25;min-width:0}
.equipo__cab strong{color:var(--c-ink);font-size:.95rem}
.equipo__cab small{font-size:.78rem}
.letra{display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;background:var(--c-innova-dark);color:var(--c-white);font-size:1.3rem;font-weight:600}
.pide{background:var(--c-rubi);color:var(--c-white);border-radius:99px;padding:.15em .7em;font-size:.7rem;font-weight:700;white-space:nowrap}
.progreso{display:grid;grid-template-columns:repeat(8,1fr);gap:.25rem}
.progreso span{height:.45rem;border-radius:99px;background:var(--c-green-light)}
.progreso .hecho{background:var(--c-green-deep)}
.progreso .actual{background:var(--c-innova)}
.equipo__din{font-size:.9rem}
.equipo__din strong{color:var(--c-ink)}
.estado{font-size:.8rem;font-weight:600;border-radius:.8rem;padding:.35rem .7rem}
.estado--si{background:var(--c-green-light);color:var(--c-green-deep)}
.estado--no{background:color-mix(in srgb,var(--c-gris-10) 50%,var(--c-white));color:var(--c-green-dark)}
.equipo__pie{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:space-between}
.ver{border:0;border-radius:99px;padding:.45em 1em;background:var(--c-innova);color:var(--c-ink);font:inherit;font-size:.85rem;font-weight:600;cursor:pointer}
.ver:disabled{background:var(--c-green-light);color:var(--c-green-dark);cursor:default;font-weight:400}
.abrir{font-size:.8rem}
.ritmo{font-size:.8rem;border-top:1px solid var(--c-gris-10);padding-top:.5rem}
.ritmo summary{cursor:pointer;color:var(--c-green-dark)}
.excepcion{font-weight:700;color:var(--c-innova-dark);text-transform:uppercase;letter-spacing:.05em}
.ritmo__botones{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.5rem}
.ritmo__botones button{border:0;border-radius:99px;padding:.3em .8em;background:var(--c-green-light);color:var(--c-ink);font:inherit;font-size:.78rem;cursor:pointer}
.ritmo__botones button:hover{background:var(--c-innova)}

.visor{border:0;padding:0;border-radius:var(--radius-card);width:min(62rem,calc(100vw - 2rem));max-height:calc(100vh - 2rem);background:var(--c-green-light);color:var(--c-green-dark)}
.visor::backdrop{background:color-mix(in srgb,var(--c-green-deep) 70%,transparent)}
.visor__cab{position:sticky;top:0;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem 1.3rem;background:var(--c-white);border-bottom:1px solid var(--c-gris-10)}
.visor__cab div{display:grid}
.visor__cab strong{color:var(--c-ink);font-size:1.1rem}
.cerrar{width:2.4rem;height:2.4rem;border-radius:50%;border:0;background:var(--c-ink);color:var(--c-white);font-size:1rem;cursor:pointer}
.visor__cuerpo{padding:1.2rem 1.3rem;display:grid;gap:1rem}
.visor__bloque{background:var(--c-white);border-radius:1.2rem;padding:1rem;display:grid;gap:.6rem}
.visor__bloque h3{font-size:1rem;font-weight:600;color:var(--c-ink)}
.visor__bloque small{font-weight:400;color:var(--c-green-dark)}
.visor__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(10rem,1fr));gap:.6rem}
.visor__grid a{display:grid;gap:.2rem;text-decoration:none;font-size:.72rem;color:var(--c-innova-dark)}
.visor__grid img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:.7rem}
.nota{font-size:.82rem;font-style:italic}
</style>
