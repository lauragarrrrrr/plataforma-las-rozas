<script setup lang="ts">
// /subir/:id · Subir una foto desde el móvil (se construye en el hito 3)
import { computed } from 'vue'
import { useStore } from '../data/store'

const props = defineProps<{ id: string }>()
const store = useStore()
const team = computed(() => store.team(props.id))
const total = computed(() => store.photos(props.id).length)
</script>

<template>
  <main class="section s-claro">
    <div class="wrap">
      <template v-if="team">
        <span class="kicker">{{ team.name }}</span>
        <h1 class="titular">Subir una foto</h1>
        <p class="intro">Haced la foto de vuestras fichas y enviadla a vuestro expediente.</p>
        <p class="card">Fotos en vuestro expediente: <strong>{{ total }}</strong></p>
        <p class="pendiente">La subida de fotos llega en el hito 3.</p>
      </template>
      <p v-else class="alerta">Este QR no corresponde a ningún equipo. Pedid ayuda al equipo facilitador.</p>
    </div>
  </main>
</template>

<style scoped>
.pendiente{font-style:italic}
</style>
