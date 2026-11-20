<script setup lang="ts">
// /resultados · Podio final a pantalla completa, para proyectar o hacer una captura
// para la presentación. Es del equipo facilitador: se ve aunque no esté publicado
// (con un aviso pequeño que desaparece al publicar, para que la captura quede limpia).
import { useStore } from '../data/store'
import ResultadosPodio from '../components/ResultadosPodio.vue'

const store = useStore()
function fullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen?.()
}
</script>

<template>
  <main class="resultados">
    <div class="resultados__in">
      <header class="cab">
        <span class="kicker">Las Rozas 2040 · Hackathon de innovación</span>
        <h1 class="titulo">✦ Las 3 iniciativas más votadas por el público</h1>
      </header>
      <ResultadosPodio grande />
      <footer class="pie">
        <img src="/logos/ayuntamiento-las-rozas.png" alt="Ayuntamiento de Las Rozas" />
        <img src="/logos/las-rozas-innova.png" alt="Las Rozas Innova" />
      </footer>
    </div>
    <div class="controles">
      <span v-if="!store.resultsPublished()" class="borrador">Vista previa: todavía no publicados</span>
      <button type="button" class="ctrl" @click="fullscreen">Pantalla completa</button>
    </div>
  </main>
</template>

<style scoped>
.resultados{min-height:100vh;background:var(--gradient-dark);color:var(--c-white);display:grid;place-items:center;padding:clamp(1.5rem,4vw,4rem)}
.resultados__in{width:min(100%,1500px);display:grid;gap:clamp(1.2rem,3vh,2.4rem)}
.cab{display:grid;gap:.4rem}
.cab .kicker{color:var(--c-green-mid);font-size:clamp(.8rem,1.1vw,1.1rem)}
.titulo{margin:0;font-size:clamp(2.6rem,6vw,5.5rem);font-weight:700;letter-spacing:-.04em;line-height:1;color:var(--c-white)}
.pie{display:flex;gap:2rem;align-items:center;opacity:.9}
.pie img{height:clamp(1.8rem,3vw,2.8rem);width:auto}
.controles{position:fixed;right:1rem;bottom:1rem;display:flex;gap:.6rem;align-items:center}
.borrador{background:var(--c-rubi);color:var(--c-white);border-radius:99px;padding:.35em .9em;font-size:.8rem;font-weight:600}
.ctrl{border:0;border-radius:99px;padding:.45em 1em;background:color-mix(in srgb,var(--c-white) 15%,transparent);color:var(--c-white);font:inherit;font-size:.8rem;cursor:pointer}
</style>
