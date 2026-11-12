<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { useStore } from './data/store'

const route = useRoute()
const { ready, connError } = useStore()
</script>

<template>
  <SiteHeader v-if="!route.meta.fullscreen" />
  <p v-if="connError" class="alerta conexion" role="alert">{{ connError }}</p>
  <RouterView v-if="ready" />
  <main v-else-if="!connError" class="cargando" aria-live="polite">Conectando…</main>
  <SiteFooter v-if="!route.meta.fullscreen" />
</template>

<style scoped>
.conexion{position:sticky;top:0;z-index:60;border-radius:0;text-align:center}
.cargando{min-height:60vh;display:grid;place-items:center;font-weight:600;color:var(--c-innova-dark)}
</style>
