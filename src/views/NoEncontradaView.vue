<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="section">
    <div class="wrap">
      <span class="kicker">Error 404</span>
      <h1 class="titular">Esta página no existe.</h1>
      <RouterLink class="boton" to="/">Volver a la portada</RouterLink>
    </div>
  </main>
</template>
