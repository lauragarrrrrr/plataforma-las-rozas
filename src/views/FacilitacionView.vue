<script setup lang="ts">
// /facilitacion · Entrada del equipo facilitador
// ⚠️ La contraseña llega con el panel completo (hito 4).
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { AGENDA } from '../data/agenda'
import { useStore } from '../data/store'

const store = useStore()
const pendientes = computed(() => store.db.helpRequests.filter((h) => !h.attendedAt).length)
const paso = computed(() => AGENDA[store.db.room.step] ?? AGENDA[0])
</script>

<template>
  <main class="section s-claro">
    <div class="wrap">
      <span class="kicker">Equipo facilitador</span>
      <h1 class="titular">¿Qué queréis hacer?</h1>
      <div class="opciones">
        <RouterLink class="opcion opcion--sala" to="/sala">
          <span class="kicker">Proyector</span>
          <strong>Presentación de la sala</strong>
          <span>La jornada paso a paso, como una presentación: apertura, recorrido, foresight, vídeo y cada dinámica con su cronómetro.</span>
          <span class="ahora">Ahora: {{ paso.title }}</span>
        </RouterLink>
        <RouterLink class="opcion" to="/panel">
          <span class="kicker">Seguimiento</span>
          <strong>Panel de los equipos</strong>
          <span>Por dónde va cada equipo, sus fotos y sus peticiones de ayuda.</span>
          <span v-if="pendientes" class="aviso">{{ pendientes }} {{ pendientes === 1 ? 'equipo pide' : 'equipos piden' }} ayuda</span>
        </RouterLink>
        <RouterLink class="opcion opcion--previa" to="/vista-previa">
          <span class="kicker">Para revisar</span>
          <strong>Vista previa de las dinámicas</strong>
          <span>Recorred todas las pantallas que verán los equipos, una a una, sin esperar cronómetros ni subir fotos. No se guarda nada.</span>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.opciones{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
@media(max-width:700px){.opciones{grid-template-columns:1fr}}
.opcion{display:grid;gap:.45rem;align-content:start;background:var(--c-white);border-radius:var(--radius-card);padding:clamp(1.4rem,3vw,2.2rem);text-decoration:none;color:var(--c-green-dark);transition:transform .2s var(--ease-out)}
.opcion:hover{transform:translateY(-4px)}
.opcion strong{font-size:clamp(1.4rem,2.6vw,2rem);font-weight:500;letter-spacing:-.03em;line-height:1.1;color:var(--c-ink)}
.opcion--sala{background:var(--gradient-dark);color:var(--c-green-light)}
.opcion--sala strong{color:var(--c-white)}
.opcion--sala .kicker{color:var(--c-green-mid)}
.opcion--previa{grid-column:1/-1;background:var(--c-white);box-shadow:inset 0 0 0 2px var(--c-green-mid)}
.ahora{margin-top:.5rem;font-weight:600;color:var(--c-green-mid)}
.aviso{justify-self:start;margin-top:.5rem;background:var(--c-rubi);color:var(--c-white);border-radius:99px;padding:.3em .9em;font-size:.85rem;font-weight:600}
</style>
