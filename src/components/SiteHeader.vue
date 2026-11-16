<script setup lang="ts">
// Banda superior con los logos, común a todas las pantallas.
// En las pantallas de participantes el nombre NO es un enlace: así nadie llega
// por accidente a la entrada del equipo facilitador.
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const destino = computed(() => (route.meta.facilitator ? '/facilitacion' : '/'))
</script>

<template>
  <header class="banda">
    <div class="wrap banda__in">
      <img src="/logos/ayuntamiento-las-rozas.png" alt="Ayuntamiento de Las Rozas" />
      <span v-if="route.meta.participant" class="banda__nombre">Las Rozas 2040</span>
      <RouterLink v-else class="banda__nombre" :to="destino">Las Rozas 2040</RouterLink>
      <img src="/logos/las-rozas-innova.png" alt="Las Rozas Innova" />
    </div>
  </header>
</template>

<style scoped>
.banda{background:var(--c-innova-dark);color:var(--c-white)}
.banda__in{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding-block:.9rem}
.banda img{height:clamp(1.6rem,5vw,2.3rem);width:auto}
.banda__nombre{font-size:clamp(.95rem,3.6vw,1.5rem);letter-spacing:-.02em;white-space:nowrap;color:var(--c-white);text-decoration:none}
</style>
