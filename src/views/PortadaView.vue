<script setup lang="ts">
// «/» · Entrada: Las Rozas 2040 y dos puertas, equipo facilitador o participante.
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="entrada">
    <div class="wrap entrada__in">
      <span class="tipo">Hackathon · Sábado 21/11/2026</span>
      <h1><span class="nombre">Las Rozas</span><span class="anio">2040</span></h1>
      <p class="lema">El futuro no se espera. Se construye juntos.</p>

      <div class="puertas">
        <RouterLink to="/participa" class="puerta puerta--participante">
          <span class="kicker">Participante</span>
          <strong>Entrar con mi equipo</strong>
          <span>Para el ordenador de cada equipo.</span>
          <span class="puerta__ir">Entrar →</span>
        </RouterLink>
        <RouterLink to="/facilitacion" class="puerta puerta--facilitador">
          <span class="kicker">Equipo facilitador</span>
          <strong>Llevar la jornada</strong>
          <span>Presentación de la sala y panel de seguimiento.</span>
          <span class="puerta__ir">Entrar →</span>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.entrada{min-height:calc(100vh - 4.5rem);display:grid;align-items:center;background:var(--c-white)}
.entrada__in{display:grid;gap:clamp(1.2rem,3vw,2rem);padding-block:clamp(2.5rem,7vw,5rem)}
.tipo{justify-self:start;display:inline-flex;align-items:center;gap:.5em;background:var(--c-innova-dark);color:var(--c-white);border-radius:99px;padding:.55em 1.1em .55em .9em;font-size:clamp(.68rem,2.6vw,.85rem);font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.tipo::before{content:"";width:.6em;aspect-ratio:1;border-radius:50%;background:var(--c-white);animation:latir 1.8s ease-in-out infinite}
@keyframes latir{50%{opacity:.35}}
h1{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:.25em;font-size:clamp(3rem,11.5vw,10rem);line-height:.92}
.nombre{font-weight:300;letter-spacing:-.06em}
.anio{font-weight:700;letter-spacing:-.05em;background:var(--gradient-anio);-webkit-background-clip:text;background-clip:text;color:transparent}
.lema{font-size:clamp(1.25rem,2.3vw,1.85rem);line-height:1.2;letter-spacing:-.02em;color:var(--c-ink)}
.puertas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-top:1rem}
@media(max-width:700px){.puertas{grid-template-columns:1fr}}
.puerta{display:grid;gap:.4rem;align-content:start;border-radius:var(--radius-card);padding:clamp(1.4rem,3vw,2.2rem);text-decoration:none;transition:transform .2s var(--ease-out)}
.puerta:hover{transform:translateY(-4px)}
.puerta strong{font-size:clamp(1.4rem,2.6vw,2rem);font-weight:500;letter-spacing:-.03em;line-height:1.1}
.puerta__ir{margin-top:.6rem;font-weight:600}
.puerta--participante{background:var(--c-green-light);color:var(--c-green-dark)}
.puerta--participante strong{color:var(--c-ink)}
.puerta--participante .puerta__ir{color:var(--c-innova-dark)}
.puerta--facilitador{background:var(--gradient-dark);color:var(--c-green-light)}
.puerta--facilitador strong{color:var(--c-white)}
.puerta--facilitador .kicker,.puerta--facilitador .puerta__ir{color:var(--c-green-mid)}
</style>
