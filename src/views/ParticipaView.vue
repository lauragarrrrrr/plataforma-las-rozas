<script setup lang="ts">
// /participa · Bienvenida para participantes y «¿A qué equipo pertenecéis?»
import { RouterLink } from 'vue-router'
import { useStore } from '../data/store'

const store = useStore()
</script>

<template>
  <main>
    <section class="hero">
      <div class="wrap hero__in">
        <span class="kicker">Participantes</span>
        <h1><span class="nombre">Las Rozas</span> <span class="anio">2040</span></h1>
        <p class="lema">El futuro no se espera. Se construye juntos.</p>
        <p class="intro">Una jornada para escuchar a quienes forman Las Rozas, <strong>imaginar la ciudad de 2040</strong> y convertir sus necesidades en ideas concretas. Primero se conversa; después se contrasta; finalmente, el equipo decide qué registrar.</p>
      </div>
    </section>

    <section class="section s-claro">
      <div class="wrap">
        <h2 class="titular">¿A qué equipo pertenecéis?</h2>
        <p class="intro">Mirad el número en vuestra acreditación.</p>
        <ul class="equipos">
          <li v-for="t in store.db.teams" :key="t.id">
            <RouterLink class="equipo" :to="`/equipo/${t.id}`">
              <small>Equipo</small>
              <strong>{{ t.id }}</strong>
            </RouterLink>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero__in{display:grid;gap:1rem;padding-block:clamp(2.5rem,6vw,4.5rem)}
h1{font-size:clamp(3rem,10vw,8rem);line-height:.92}
.nombre{font-weight:300;letter-spacing:-.06em}
.anio{font-weight:700;letter-spacing:-.05em;background:var(--gradient-anio);-webkit-background-clip:text;background-clip:text;color:transparent}
.lema{font-size:clamp(1.2rem,2.2vw,1.7rem);color:var(--c-ink);letter-spacing:-.02em}
.equipos{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(7rem,1fr));gap:.75rem}
.equipo{display:grid;justify-items:center;gap:.1rem;padding:1.2rem .5rem;border-radius:var(--radius-card);background:var(--c-white);text-decoration:none;color:var(--c-ink);transition:transform .2s var(--ease-out),background .2s}
.equipo:hover{transform:translateY(-3px);background:var(--c-innova)}
.equipo small{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c-green-dark)}
.equipo strong{font-size:2.4rem;font-weight:600;letter-spacing:-.04em;line-height:1}
</style>
