<script setup lang="ts">
// Votación en el panel: abrirla o cerrarla y ver el recuento.
// El recuento solo lo ve el equipo facilitador.
import { askConfirm } from '../composables/useConfirm'
import { computed, ref } from 'vue'
import { publishResults, removeVote, setPodium, setVotingOpen, useStore, VOTE_POINTS } from '../data/store'
import { downloadCsv } from '../utils/csv'

const store = useStore()
const abierta = computed(() => store.votingOpen())
const recuento = computed(() => store.voteCounts())
const maximo = computed(() => Math.max(1, ...recuento.value.map((r) => r.points)))
const personas = computed(() => store.db.votes.length)
/** Personas de la lista (las que pueden votar) */
const totalPersonas = computed(() => Object.values(store.roster()).reduce((n, v) => n + v.length, 0))

// --- Quién ha votado (solo si ha votado, nunca a quién) y anular un voto ---
const porEquipo = computed(() => {
  const r = store.roster()
  return store.db.teams.map((t) => {
    const nombres = r[t.id] ?? []
    const gente = nombres.map((n, i) => ({ i, n, voto: store.hasVoted(t.id, i) }))
    return { id: t.id, gente, hechos: gente.filter((g) => g.voto).length }
  })
})
const anulando = ref('')
const avisoAnular = ref('')
async function anular(teamId: string, i: number, nombre: string) {
  if (!(await askConfirm(`¿Anular el voto de ${nombre} (equipo ${teamId})? Se borrará y podrá volver a votar desde su móvil.`, '', 'Sí, anular'))) return
  anulando.value = `${teamId}-${i}`
  avisoAnular.value = ''
  try {
    await removeVote(teamId, i)
    avisoAnular.value = `Voto de ${nombre} anulado. Ya puede volver a votar.`
  } catch {
    avisoAnular.value = 'No se ha podido anular. Comprobad la conexión y probad otra vez.'
  } finally {
    anulando.value = ''
  }
}

async function alternar() {
  const texto = abierta.value
    ? '¿Cerrar la votación? Nadie más podrá votar.'
    : '¿Abrir la votación? A los equipos les aparecerá el QR para votar desde el móvil.'
  if (await askConfirm(texto)) setVotingOpen(!abierta.value)
}

// --- Resultado final: el podio lo decide el equipo facilitador (por defecto, los más votados) ---
const PUESTOS = ['1.º', '2.º', '3.º']
const podio = computed(() => store.podium())
const publicado = computed(() => store.resultsPublished())
function cambiarPuesto(i: number, teamId: string) {
  const nuevo = [...podio.value]
  // Si el equipo ya estaba en otro puesto, se intercambian
  const j = nuevo.indexOf(teamId)
  if (j >= 0 && j !== i) nuevo[j] = nuevo[i]
  nuevo[i] = teamId
  setPodium(nuevo)
}
function porVotos() {
  setPodium([])
}
// --- Descargas para después (CSV para Excel) ---
const hora = (iso: string) => new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
function csvResultados() {
  const comoFavorita = (teamId: string, i: number) => store.db.votes.filter((v) => v.teamIds[i] === teamId).length
  const filas = recuento.value.map((r, n) => [
    n + 1,
    podio.value.includes(r.teamId) ? PUESTOS[podio.value.indexOf(r.teamId)] : '',
    `Equipo ${r.teamId}`,
    store.areaName(store.team(r.teamId)?.area ?? 'open'),
    store.coverHeadline(r.teamId) ?? '',
    r.points,
    r.votes,
    comoFavorita(r.teamId, 0),
    comoFavorita(r.teamId, 1),
    comoFavorita(r.teamId, 2),
  ])
  downloadCsv('Las Rozas 2040 · resultados.csv', ['Posición por puntos', 'Resultado final', 'Equipo', 'Ámbito', 'Titular de la portada', 'Puntos', 'Votos', 'Como favorita 1', 'Como favorita 2', 'Como favorita 3'], filas)
}
function csvVotos() {
  // Sin nombres: solo el equipo de quien vota
  const filas = store.db.votes.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((v) => [
    hora(v.createdAt),
    `Equipo ${v.code.split('-')[0]}`,
    ...v.teamIds.map((t, i) => `Equipo ${t} (${VOTE_POINTS[i]} pts)`),
  ])
  downloadCsv('Las Rozas 2040 · votos.csv', ['Hora', 'Equipo de quien vota', 'Favorita 1', 'Favorita 2', 'Favorita 3'], filas)
}

async function alternarPublicar() {
  const lineas = podio.value.map((t, i) => `${PUESTOS[i]} Equipo ${t}${store.coverHeadline(t) ? ` · ${store.coverHeadline(t)}` : ''}`)
  const texto = publicado.value
    ? '¿Retirar los resultados? Los participantes dejarán de verlos.'
    : ['¿Publicar los resultados? Los verán todos los participantes:', '', ...lineas].join('\n')
  if (await askConfirm(texto, '', publicado.value ? 'Sí, retirar' : 'Sí, publicar')) publishResults(!publicado.value)
}
</script>

<template>
  <section class="card votacion" :class="{ 'votacion--abierta': abierta }">
    <div class="votacion__cab">
      <div>
        <span class="kicker">Votación</span>
        <p v-if="abierta"><strong>Abierta.</strong> Han votado <strong class="cuenta">{{ personas }} de {{ totalPersonas }}</strong> personas.</p>
        <p v-else>Cerrada{{ personas ? ` · han votado ${personas} de ${totalPersonas} personas` : '' }}. Los equipos la ven bloqueada al final de su app. Abridla al terminar el speed pitch.</p>
      </div>
      <button class="boton" :class="{ 'boton--sec': abierta }" type="button" @click="alternar">
        {{ abierta ? 'Cerrar la votación' : 'Abrir la votación' }}
      </button>
    </div>

    <details v-if="personas" class="quien">
      <summary>Quién ha votado · anular un voto</summary>
      <p class="nota">Solo se ve si cada persona ha votado, nunca a quién. Si alguien dice que «ya ha votado» sin haberlo hecho, anulad su voto y podrá votar otra vez.</p>
      <ul class="quien__equipos">
        <li v-for="e in porEquipo" :key="e.id">
          <span class="quien__letra">{{ e.id }} <small>{{ e.hechos }}/{{ e.gente.length }}</small></span>
          <span class="quien__gente">
            <template v-for="g in e.gente" :key="g.i">
              <button v-if="g.voto" class="quien__si" type="button" :disabled="anulando === `${e.id}-${g.i}`" :title="`Anular el voto de ${g.n}`" @click="anular(e.id, g.i, g.n)">✓ {{ g.n }} ✕</button>
              <span v-else class="quien__no">{{ g.n }}</span>
            </template>
          </span>
        </li>
      </ul>
      <p v-if="avisoAnular" class="final__ok">{{ avisoAnular }}</p>
    </details>

    <details v-if="personas">
      <summary>Ver recuento (solo para el equipo facilitador)</summary>
      <p class="nota">Favorita 1 = 3 puntos · favorita 2 = 2 · favorita 3 = 1.</p>
      <ol class="recuento">
        <li v-for="r in recuento" :key="r.teamId">
          <span class="recuento__eq">Equipo {{ r.teamId }}<em v-if="store.coverHeadline(r.teamId)">{{ store.coverHeadline(r.teamId) }}</em></span>
          <span class="recuento__barra"><i :style="{ width: `${(r.points / maximo) * 100}%` }"></i></span>
          <strong>{{ r.points }} <small>pts</small></strong>
          <small class="recuento__votos">{{ r.votes }} {{ r.votes === 1 ? 'voto' : 'votos' }}</small>
        </li>
      </ol>
    </details>

    <!-- Resultado final -->
    <div class="final">
      <span class="kicker">Las 3 más votadas por el público</span>
      <p class="nota">Por defecto, los más votados. Podéis cambiar cualquier puesto antes de publicar.</p>
      <div class="final__puestos">
        <label v-for="(t, i) in podio" :key="i" class="final__puesto">
          <span>{{ PUESTOS[i] }}</span>
          <select :value="t" @change="cambiarPuesto(i, ($event.target as HTMLSelectElement).value)">
            <option v-for="eq in store.db.teams" :key="eq.id" :value="eq.id">Equipo {{ eq.id }}{{ store.coverHeadline(eq.id) ? ` · ${store.coverHeadline(eq.id)}` : '' }}</option>
          </select>
        </label>
      </div>
      <div class="final__botones">
        <button class="boton" :class="{ 'boton--sec': publicado }" type="button" @click="alternarPublicar">
          {{ publicado ? 'Retirar los resultados' : 'Publicar las más votadas' }}
        </button>
        <button v-if="store.db.event.podium?.length" class="boton boton--sec" type="button" @click="porVotos">Volver a los más votados</button>
        <a class="final__ver" href="/resultados" target="_blank" rel="noopener">Abrir la página de resultados (para proyectar) ↗</a>
      </div>
      <p v-if="publicado" class="final__ok">✓ Publicados: los participantes ya los ven en su móvil y en la app del equipo.</p>
      <div class="descargas">
        <span>Para después (se abre en Excel):</span>
        <button class="boton boton--sec" type="button" @click="csvResultados">Descargar resultados (CSV)</button>
        <button class="boton boton--sec" type="button" :disabled="!personas" @click="csvVotos">Descargar votos (CSV)</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.votacion--abierta{box-shadow:inset 0 0 0 3px var(--c-innova)}
.votacion__cab{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem}
.boton--sec{background:var(--c-white);box-shadow:inset 0 0 0 1.5px var(--c-ink)}
details summary{cursor:pointer;font-weight:600;color:var(--c-ink);margin-top:.4rem}
.recuento{list-style:none;margin:.6rem 0 0;padding:0;display:grid;gap:.35rem}
.recuento li{display:grid;grid-template-columns:minmax(9rem,1.6fr) 1fr 3.5rem 4rem;align-items:center;gap:.6rem;font-size:.9rem}
.recuento__votos{color:var(--c-green-dark)}
.nota{font-size:.8rem;font-style:italic;margin:.3rem 0 0}
.recuento__eq{display:grid;color:var(--c-ink);font-weight:600}
.recuento__eq em{font-family:var(--font-paper);font-style:normal;font-weight:400;font-size:.85rem;line-height:1.25;color:var(--c-green-dark)}
.recuento__barra{height:.6rem;border-radius:99px;background:var(--c-green-light);overflow:hidden}
.recuento__barra i{display:block;height:100%;background:var(--gradient-verde)}
.recuento strong{text-align:right;color:var(--c-ink)}
.final{display:grid;gap:.6rem;border-top:1px solid var(--c-gris-10);padding-top:1rem;margin-top:.4rem}
.final .nota{margin:0;font-size:.85rem}
.final__puestos{display:grid;gap:.45rem}
.final__puesto{display:grid;grid-template-columns:2.5rem 1fr;align-items:center;gap:.6rem;font-weight:700;color:var(--c-ink)}
.final__puesto select{font:inherit;font-weight:400;font-size:.95rem;padding:.5em .8em;border:1.5px solid var(--c-paper-line);border-radius:.8rem;background:var(--c-white);min-width:0}
.final__botones{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1rem}
.final__ver{font-size:.9rem;font-weight:600;color:var(--c-innova-dark)}
.descargas{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;font-size:.85rem;border-top:1px dashed var(--c-gris-10);padding-top:.8rem}
.descargas .boton:disabled{opacity:.45;cursor:not-allowed}
.final__ok{margin:0;font-weight:600;color:var(--c-innova-dark)}
.cuenta{font-size:1.15rem;color:var(--c-ink)}
.quien__equipos{list-style:none;margin:.6rem 0 0;padding:0;display:grid;gap:.4rem}
.quien__equipos li{display:grid;grid-template-columns:3.5rem 1fr;gap:.6rem;align-items:start}
.quien__letra{font-weight:700;color:var(--c-ink)}
.quien__letra small{font-weight:400;font-size:.75rem;color:var(--c-green-dark)}
.quien__gente{display:flex;flex-wrap:wrap;gap:.3rem}
.quien__si,.quien__no{font:inherit;font-size:.8rem;border-radius:99px;padding:.15em .7em}
.quien__si{border:0;cursor:pointer;background:var(--c-green-light);color:var(--c-ink);font-weight:600}
.quien__si:hover{background:color-mix(in srgb,var(--c-rubi) 15%,var(--c-white))}
.quien__si:disabled{opacity:.5;cursor:progress}
.quien__no{background:var(--c-white);box-shadow:inset 0 0 0 1px var(--c-gris-10);color:var(--c-green-dark)}
</style>
