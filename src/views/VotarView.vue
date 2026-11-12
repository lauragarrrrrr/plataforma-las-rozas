<script setup lang="ts">
// /votar · Votación desde el móvil (se construye en el hito 6)
import { computed } from 'vue'
import { useStore } from '../data/store'

const store = useStore()
const portadas = computed(() => store.db.covers.length)
</script>

<template>
  <main class="section s-claro">
    <div class="wrap">
      <span class="kicker">Votación</span>
      <h1 class="titular">¿Qué ideas os gustaría ver avanzar?</h1>
      <p class="intro">Elegiréis vuestras tres iniciativas favoritas. No se puede votar al propio equipo.</p>
      <p class="card">Portadas listas para votar: <strong>{{ portadas }} de {{ store.db.teams.length }}</strong></p>
      <p class="pendiente">La votación llega en el hito 6.</p>
    </div>
  </main>
</template>

<style scoped>
.pendiente{font-style:italic}
</style>
