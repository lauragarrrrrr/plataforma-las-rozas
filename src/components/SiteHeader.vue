<script setup lang="ts">
// Banda superior con los logos, común a todas las pantallas.
// En las pantallas de participantes el nombre NO es un enlace: así nadie llega
// por accidente a la entrada del equipo facilitador.
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { facilitator, logoutFacilitator, isRemote } from '../data/store'

const route = useRoute()
const destino = computed(() => (route.meta.facilitator ? '/facilitacion' : '/'))
const mostrarSalir = computed(() => isRemote && facilitator.value && route.meta.facilitator)
</script>

<template>
  <header class="banda">
    <div class="wrap banda__in">
      <img src="/logos/ayuntamiento-las-rozas.png" alt="Ayuntamiento de Las Rozas" />
      <span v-if="route.meta.participant" class="banda__nombre">Las Rozas 2040</span>
      <RouterLink v-else class="banda__nombre" :to="destino">Las Rozas 2040</RouterLink>
      <div class="banda__der">
        <button v-if="mostrarSalir" class="banda__salir" type="button" @click="logoutFacilitator().then(() => $router.push('/acceso'))">Cerrar sesión</button>
        <img src="/logos/las-rozas-innova.png" alt="Las Rozas Innova" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.banda{background:var(--c-innova-dark);color:var(--c-white)}
.banda__in{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding-block:.9rem}
.banda img{height:clamp(1.6rem,5vw,2.3rem);width:auto}
.banda__nombre{font-size:clamp(.95rem,3.6vw,1.5rem);letter-spacing:-.02em;white-space:nowrap;color:var(--c-white);text-decoration:none}
.banda__der{display:flex;align-items:center;gap:1rem}
.banda__salir{border:0;border-radius:99px;padding:.35em .9em;background:color-mix(in srgb,var(--c-white) 18%,transparent);color:var(--c-white);font:inherit;font-size:.8rem;cursor:pointer}
</style>
