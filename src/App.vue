<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
// En el hito 1 la portada pasa a ser la ruta «/» del router
import PortadaView from './views/PortadaView.vue'
</script>

<template>
  <SiteHeader />
  <PortadaView />
  <SiteFooter />
</template>
