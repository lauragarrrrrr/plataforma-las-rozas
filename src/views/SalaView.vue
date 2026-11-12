<script setup lang="ts">
// /sala · Pantalla del proyector (modos y cronómetro en el hito 4)
import { useStore } from '../data/store'

const store = useStore()

const MODOS = {
  welcome: 'Bienvenida', phase: 'Fase', alert: 'Alerta', pitch: 'Speed pitch', covers: 'Portadas', results: 'Resultados',
} as const
</script>

<template>
  <main class="sala">
    <div class="sala__in">
      <span class="sala__kicker">Hackathon · Sábado 21/11/2026</span>
      <h1><span class="nombre">Las Rozas</span> <span class="anio">2040</span></h1>
      <p class="lema">El futuro no se espera. Se construye juntos.</p>
    </div>
    <p class="sala__modo">Modo: {{ MODOS[store.db.room.mode] }}</p>
  </main>
</template>

<style scoped>
.sala{min-height:100vh;background:var(--gradient-dark);color:var(--c-white);display:grid;place-items:center;padding:4vw;position:relative;text-align:center}
.sala__in{display:grid;gap:2vw;justify-items:center}
.sala__kicker{font-size:clamp(.9rem,1.4vw,1.6rem);letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:var(--c-green-mid)}
h1{color:var(--c-white);font-size:clamp(3rem,11vw,14rem);line-height:.9;letter-spacing:-.05em}
.nombre{font-weight:300}
.anio{font-weight:700;color:var(--c-green-mid)}
.lema{font-size:clamp(1.2rem,2.6vw,3rem);letter-spacing:-.02em;color:var(--c-green-light)}
.sala__modo{position:absolute;bottom:1.5rem;right:2rem;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c-green-mid)}
</style>
