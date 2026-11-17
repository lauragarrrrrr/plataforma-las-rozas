<script setup lang="ts">
// Panel · Avisos a los equipos: el equipo facilitador los lanza a mano, a todos o a un equipo.
// Al equipo le aparecen a pantalla completa (en rubí) hasta que pulsan «¡Entendido!».
import { computed, ref } from 'vue'
import { askConfirm } from '../composables/useConfirm'
import { launchAlert, useStore } from '../data/store'

const store = useStore()
const destino = ref('all')
const titulo = ref('')
const texto = ref('')

/** Avisos preparados (se pueden cambiar aquí) */
const PREPARADOS = [
  { title: '¡Tenemos que avanzar!', body: 'Subid ya las fotos de vuestro trabajo.' },
  { title: 'Quedan 5 minutos', body: 'Id cerrando y preparad la foto.' },
  { title: '¡Volved a la sala principal!', body: 'Os esperamos en la sala principal.' },
  { title: 'Vamos a vuestra mesa', body: 'Alguien del equipo facilitador se acerca ahora.' },
]

const aQuien = computed(() => (destino.value === 'all' ? 'a todos los equipos' : `al equipo ${destino.value}`))

async function lanzar(title: string, body: string) {
  if (!title.trim()) return
  if (!(await askConfirm(`¿Lanzar «${title.trim()}» ${aQuien.value}?`, '', 'Sí, lanzar'))) return
  launchAlert(destino.value, title, body)
  if (title === titulo.value) { titulo.value = ''; texto.value = '' }
}

const recientes = computed(() =>
  store.db.alerts.filter((a) => a.launchedAt).slice().sort((a, b) => (b.launchedAt ?? '').localeCompare(a.launchedAt ?? '')).slice(0, 6),
)
function leidos(a: { id: string; target: string }) {
  const vistos = store.alertSeenBy(a.id)
  if (a.target !== 'all') return vistos.includes(a.target) ? 'Leído' : 'Sin leer todavía'
  return `Leído por ${vistos.length} de ${store.db.teams.length}`
}
const hora = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '')
</script>

<template>
  <section class="card avisos">
    <span class="kicker">Avisos a los equipos</span>
    <p class="nota">Les aparece a pantalla completa en su ordenador hasta que pulsan «¡Entendido!».</p>

    <label class="campo">
      <span>¿A quién?</span>
      <select v-model="destino">
        <option value="all">A todos los equipos</option>
        <option v-for="t in store.db.teams" :key="t.id" :value="t.id">Equipo {{ t.id }}</option>
      </select>
    </label>

    <div class="preparados">
      <button v-for="p in PREPARADOS" :key="p.title" type="button" class="preparado" @click="lanzar(p.title, p.body)">{{ p.title }}</button>
    </div>

    <details class="propio">
      <summary>Escribir un aviso propio</summary>
      <label class="campo"><span>Título</span><input v-model="titulo" type="text" maxlength="80" placeholder="Por ejemplo: ¡Desafío sorpresa!" /></label>
      <label class="campo"><span>Texto (opcional)</span><textarea v-model="texto" rows="2" maxlength="300" placeholder="Las empresas ya no pueden publicar ofertas de empleo…"></textarea></label>
      <button class="boton" type="button" :disabled="!titulo.trim()" @click="lanzar(titulo, texto)">Lanzar aviso</button>
    </details>

    <ul v-if="recientes.length" class="lista">
      <li v-for="a in recientes" :key="a.id">
        <span class="lista__hora">{{ hora(a.launchedAt) }}</span>
        <span><strong>{{ a.title }}</strong> · {{ a.target === 'all' ? 'Todos' : `Equipo ${a.target}` }}</span>
        <span class="lista__leido">{{ leidos(a) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.avisos{display:grid;gap:.9rem}
.nota{margin:0;font-size:.85rem}
.campo{display:grid;gap:.3rem;font-size:.85rem;font-weight:600}
.campo select,.campo input,.campo textarea{font:inherit;font-weight:400;font-size:.95rem;color:var(--c-ink);background:var(--c-white);border:1.5px solid var(--c-paper-line);border-radius:.9rem;padding:.55em .9em}
.campo select{max-width:16rem}
.preparados{display:flex;flex-wrap:wrap;gap:.5rem}
.preparado{border:0;border-radius:99px;padding:.55em 1.1em;background:color-mix(in srgb,var(--c-rubi) 12%,var(--c-white));color:var(--c-rubi);font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;transition:transform .2s var(--ease-out)}
.preparado:hover{transform:translateY(-2px)}
.propio{display:grid;gap:.6rem}
.propio summary{cursor:pointer;font-weight:600;font-size:.9rem;color:var(--c-innova-dark)}
.propio[open]{display:grid;gap:.6rem}
.boton:disabled{opacity:.5;cursor:not-allowed;transform:none}
.lista{list-style:none;margin:0;padding:0;display:grid;gap:.35rem;font-size:.85rem;border-top:1px solid var(--c-gris-10);padding-top:.7rem}
.lista li{display:grid;grid-template-columns:auto 1fr auto;gap:.8rem;align-items:baseline}
.lista__hora{font-variant-numeric:tabular-nums;color:var(--c-innova-dark);font-weight:600}
.lista__leido{color:var(--c-green-dark);font-size:.8rem}
</style>
