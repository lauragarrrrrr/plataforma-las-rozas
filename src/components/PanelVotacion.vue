<script setup lang="ts">
// Votación en el panel: abrirla o cerrarla y ver el recuento.
// El recuento solo lo ve el equipo facilitador.
import { computed } from 'vue'
import { setVotingOpen, useStore } from '../data/store'

const store = useStore()
const abierta = computed(() => store.votingOpen())
const recuento = computed(() => store.voteCounts())
const maximo = computed(() => Math.max(1, ...recuento.value.map((r) => r.votes)))
const personas = computed(() => store.db.votes.length)

function alternar() {
  const texto = abierta.value
    ? '¿Cerrar la votación? Nadie más podrá votar.'
    : '¿Abrir la votación? A los equipos les aparecerá el QR para votar desde el móvil.'
  if (confirm(texto)) setVotingOpen(!abierta.value)
}
</script>

<template>
  <section class="card votacion" :class="{ 'votacion--abierta': abierta }">
    <div class="votacion__cab">
      <div>
        <span class="kicker">Votación</span>
        <p v-if="abierta"><strong>Abierta.</strong> Han votado {{ personas }} {{ personas === 1 ? 'persona' : 'personas' }}.</p>
        <p v-else>Cerrada. Los equipos la ven bloqueada al final de su app. Abridla al terminar el speed pitch.</p>
      </div>
      <button class="boton" :class="{ 'boton--sec': abierta }" type="button" @click="alternar">
        {{ abierta ? 'Cerrar la votación' : 'Abrir la votación' }}
      </button>
    </div>

    <details v-if="personas">
      <summary>Ver recuento (solo para el equipo facilitador)</summary>
      <ol class="recuento">
        <li v-for="r in recuento" :key="r.teamId">
          <span class="recuento__eq">Equipo {{ r.teamId }}</span>
          <span class="recuento__barra"><i :style="{ width: `${(r.votes / maximo) * 100}%` }"></i></span>
          <strong>{{ r.votes }}</strong>
        </li>
      </ol>
    </details>
  </section>
</template>

<style scoped>
.votacion--abierta{box-shadow:inset 0 0 0 3px var(--c-innova)}
.votacion__cab{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem}
.boton--sec{background:var(--c-white);box-shadow:inset 0 0 0 1.5px var(--c-ink)}
details summary{cursor:pointer;font-weight:600;color:var(--c-ink);margin-top:.4rem}
.recuento{list-style:none;margin:.6rem 0 0;padding:0;display:grid;gap:.35rem}
.recuento li{display:grid;grid-template-columns:6rem 1fr 2rem;align-items:center;gap:.6rem;font-size:.9rem}
.recuento__eq{color:var(--c-ink)}
.recuento__barra{height:.6rem;border-radius:99px;background:var(--c-green-light);overflow:hidden}
.recuento__barra i{display:block;height:100%;background:var(--gradient-verde)}
.recuento strong{text-align:right;color:var(--c-ink)}
</style>
