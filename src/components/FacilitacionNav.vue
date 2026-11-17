<script setup lang="ts">
// Barra de navegación del equipo facilitador, debajo de la cabecera:
// «← Atrás» (la pantalla anterior) y accesos directos a cada pantalla de facilitación.
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const LINKS = [
  { to: '/facilitacion', label: 'Inicio' },
  { to: '/panel', label: 'Panel' },
  { to: '/sala', label: 'Presentación de la sala' },
  { to: '/vista-previa', label: 'Vista previa' },
]

/** Vuelve a la pantalla anterior; si se entró directamente, a la entrada de facilitación */
function back() {
  if (window.history.state?.back) router.back()
  else router.push(route.path === '/facilitacion' ? '/' : '/facilitacion')
}
</script>

<template>
  <nav class="fnav" aria-label="Navegación del equipo facilitador">
    <div class="wrap fnav__in">
      <button class="fnav__atras" type="button" @click="back">← Atrás</button>
      <div class="fnav__links">
        <RouterLink v-for="l in LINKS" :key="l.to" :to="l.to" class="fnav__link" :class="{ 'fnav__link--on': route.path === l.to }">{{ l.label }}</RouterLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.fnav{background:var(--c-white);border-bottom:1px solid var(--c-gris-10)}
.fnav__in{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.6rem 1.2rem;padding-block:.6rem}
.fnav__atras{border:0;border-radius:99px;padding:.45em 1em;background:var(--c-green-light);color:var(--c-ink);font:inherit;font-size:.9rem;font-weight:600;cursor:pointer}
.fnav__atras:hover{background:var(--c-innova)}
.fnav__links{display:flex;flex-wrap:wrap;gap:.3rem}
.fnav__link{border-radius:99px;padding:.4em .9em;font-size:.85rem;font-weight:500;color:var(--c-green-dark);text-decoration:none}
.fnav__link:hover{background:var(--c-green-light)}
.fnav__link--on{background:var(--c-innova);color:var(--c-ink)}
</style>
