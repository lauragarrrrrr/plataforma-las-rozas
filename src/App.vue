<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'

const route = useRoute()
</script>

<template>
  <SiteHeader v-if="!route.meta.fullscreen" />
  <RouterView />
  <SiteFooter v-if="!route.meta.fullscreen" />
</template>
