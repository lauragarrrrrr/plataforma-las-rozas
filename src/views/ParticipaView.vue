<script setup lang="ts">
// /participa · Bienvenida para participantes y «¿A qué equipo pertenecéis?»
// Antes de la revelación (10:20) solo se ven los números; después, agrupados por ámbito.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { AREAS } from '../data/config'
import { useStore } from '../data/store'
import type { AreaId } from '../data/types'

const store = useStore()
const revealed = computed(() => store.db.event.areasRevealed)
const teams = computed(() => store.db.teams.slice().sort((a, b) => a.number - b.number))
const byArea = computed(() =>
  (Object.keys(AREAS) as AreaId[]).map((a) => ({ id: a, name: AREAS[a], teams: teams.value.filter((t) => t.area === a) })),
)
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
        <p class="intro">Mirad la letra en vuestra acreditación.</p>

        <!-- Después de la revelación: por ámbito -->
        <div v-if="revealed" class="ambitos">
          <section v-for="a in byArea" :key="a.id" class="ambito">
            <h3>{{ a.name }}</h3>
            <ul class="equipos">
              <li v-for="t in a.teams" :key="t.id">
                <RouterLink class="equipo" :to="`/equipo/${t.id}`">
                  <small>Equipo</small>
                  <strong>{{ t.id }}</strong>
                </RouterLink>
              </li>
            </ul>
          </section>
        </div>

        <!-- Antes: solo las letras, en orden -->
        <template v-else>
          <ul class="equipos equipos--todos">
            <li v-for="t in teams" :key="t.id">
              <RouterLink class="equipo" :to="`/equipo/${t.id}`">
                <small>Equipo</small>
                <strong>{{ t.id }}</strong>
                <span class="por-revelar">Ámbito por revelar</span>
              </RouterLink>
            </li>
          </ul>
        </template>
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

.ambitos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
@media(max-width:960px){.ambitos{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.ambitos{grid-template-columns:1fr}}
.ambito{display:grid;gap:.8rem;align-content:start;background:var(--c-white);border-radius:var(--radius-card);padding:1.2rem}
.ambito h3{font-size:1.15rem;font-weight:600;letter-spacing:-.02em;line-height:1.2}

.equipos{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}
.equipos--todos{grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:.75rem}
.equipo{display:grid;justify-items:center;gap:.1rem;padding:1rem .5rem;border-radius:1.2rem;background:var(--c-green-light);text-decoration:none;color:var(--c-ink);transition:transform .2s var(--ease-out),background .2s}
.equipos--todos .equipo{background:var(--c-white);border-radius:var(--radius-card);padding:1.2rem .5rem}
.equipo:hover{transform:translateY(-3px);background:var(--c-innova)}
.equipo small{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c-green-dark)}
.equipo strong{font-size:2.4rem;font-weight:600;letter-spacing:-.04em;line-height:1}
.por-revelar{margin-top:.3rem;font-size:.68rem;font-style:italic;color:var(--c-green-dark)}
</style>
