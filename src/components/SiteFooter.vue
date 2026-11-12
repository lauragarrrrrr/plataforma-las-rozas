<script setup lang="ts">
// Pie común: cinta «LAS ROZAS 2040», logos y «Powered by Avantis»
const repeticiones = 4
</script>

<template>
  <footer class="pie">
    <div class="pie__pista" aria-hidden="true">
      <span v-for="n in repeticiones" :key="n" class="pie__item">LAS ROZAS 2040<i>●</i></span>
    </div>
    <div class="wrap pie__logos">
      <img src="/logos/ayuntamiento-las-rozas.png" alt="Ayuntamiento de Las Rozas" />
      <img src="/logos/las-rozas-innova.png" alt="Las Rozas Innova" />
    </div>
    <p class="pie__powered">Powered by <img src="/logos/avantis.png" alt="Avantis" /></p>
  </footer>
</template>

<style scoped>
.pie{background:var(--c-ink);color:var(--c-green-light);overflow:hidden;padding-top:2.5rem}
.pie__pista{display:flex;width:max-content;animation:desfile 30s linear infinite}
.pie__item{white-space:nowrap;font-size:clamp(2.5rem,9vw,7rem);font-weight:600;letter-spacing:-.05em;line-height:1;color:color-mix(in srgb,var(--c-green-mid) 24%,var(--c-ink));padding-right:.35em}
.pie__item i{font-style:normal;font-size:.4em;vertical-align:middle;padding-left:.35em}
.pie__logos{display:flex;flex-wrap:wrap;align-items:center;gap:1.4rem 3rem;padding-block:2rem}
.pie__logos img{height:clamp(1.8rem,5vw,2.6rem);width:auto}
.pie__powered{display:flex;justify-content:center;align-items:center;gap:.6rem;margin:0;padding:1.1rem 16px;border-top:1px solid color-mix(in srgb,var(--c-green-mid) 15%,transparent);font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb,var(--c-white) 60%,transparent)}
.pie__powered img{height:.95rem;width:auto}
@keyframes desfile{to{transform:translateX(-50%)}}
</style>
