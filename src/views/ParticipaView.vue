<script setup lang="ts">
// /participa · Entrada de los participantes: «¿De qué equipo eres?»
// Cada equipo con los nombres de sus personas, para que cada cual se encuentre.
// Antes de la revelación (10:20) no se ve el ámbito; después, se agrupan por ámbito.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { AREAS } from '../data/config'
import { SIMULATED_ROSTER } from '../data/roster'
import { useStore } from '../data/store'
import type { AreaId, Team } from '../data/types'

const store = useStore()
const revealed = computed(() => store.db.event.areasRevealed)
const teams = computed(() => store.db.teams.slice().sort((a, b) => a.number - b.number))
const byArea = computed(() =>
  (Object.keys(AREAS) as AreaId[]).map((a) => ({ id: a, name: AREAS[a], teams: teams.value.filter((t) => t.area === a) })),
)
/** Personas del equipo: las que confirmó al entrar o, si no, la lista prevista */
const people = (t: Team) => store.setup(t.id)?.members ?? SIMULATED_ROSTER[t.id] ?? []
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
        <h2 class="titular">¿De qué equipo eres?</h2>
        <p class="intro">Busca tu nombre y entra en tu equipo.</p>

        <!-- Después de la revelación: por ámbito -->
        <div v-if="revealed" class="ambitos">
          <section v-for="a in byArea" :key="a.id" class="ambito">
            <h3>{{ a.name }}</h3>
            <RouterLink v-for="t in a.teams" :key="t.id" class="equipo" :to="`/equipo/${t.id}`">
              <span class="equipo__letra">{{ t.id }}</span>
              <span class="equipo__nombres">{{ people(t).join(' · ') }}</span>
            </RouterLink>
          </section>
        </div>

        <!-- Antes: todos los equipos en orden, sin ámbito -->
        <div v-else class="equipos">
          <RouterLink v-for="t in teams" :key="t.id" class="equipo equipo--tarjeta" :to="`/equipo/${t.id}`">
            <span class="equipo__letra">{{ t.id }}</span>
            <span class="equipo__nombres">{{ people(t).join(' · ') }}</span>
          </RouterLink>
        </div>
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

.equipos{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:.75rem}
.ambitos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
@media(max-width:960px){.ambitos{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.ambitos{grid-template-columns:1fr}}
.ambito{display:grid;gap:.6rem;align-content:start;background:var(--c-white);border-radius:var(--radius-card);padding:1.2rem}
.ambito h3{font-size:1.1rem;font-weight:600;letter-spacing:-.02em;line-height:1.2}

.equipo{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:.9rem;padding:.8rem 1rem;border-radius:1.2rem;background:var(--c-green-light);text-decoration:none;color:var(--c-ink);transition:transform .2s var(--ease-out),background .2s}
.equipo--tarjeta{background:var(--c-white);border-radius:var(--radius-card);padding:1rem 1.2rem}
.equipo:hover{transform:translateY(-3px);background:var(--c-innova)}
.equipo__letra{display:grid;place-items:center;width:3rem;height:3rem;border-radius:50%;background:var(--c-innova-dark);color:var(--c-white);font-size:1.6rem;font-weight:600}
.equipo__nombres{font-size:.92rem;line-height:1.4}
</style>
