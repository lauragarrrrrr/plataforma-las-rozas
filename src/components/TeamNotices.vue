<script setup lang="ts">
// Avisos a pantalla completa en la app del equipo:
// 1. «¡Cambiamos de pantalla! ¿Preparados?» cada vez que pasan a otra dinámica.
// 2. Los avisos que lanza el equipo facilitador desde el panel (en rubí), hasta que pulsan «¡Entendido!».
// El aviso del panel tiene prioridad sobre el de cambio de pantalla.
import { computed, ref, watch } from 'vue'
import { ackAlert, useStore } from '../data/store'

const props = defineProps<{
  teamId: string
  /** Dinámica en la que está el equipo (vacío si todavía no han empezado) */
  dynamicId?: string
  dynamicTitle?: string
  dynamicMinutes?: number
}>()
const store = useStore()

// --- 1. Cambio de pantalla ---
const cambio = ref<{ title: string; minutes?: number } | null>(null)
watch(
  () => props.dynamicId,
  (id, prev) => {
    // Solo al pasar de una dinámica a otra, no al abrir la página
    if (id && prev && id !== prev) cambio.value = { title: props.dynamicTitle ?? '', minutes: props.dynamicMinutes }
  },
)

// --- 2. Avisos del panel ---
const aviso = computed(() => store.unseenAlerts(props.teamId)[0])
</script>

<template>
  <div v-if="aviso" class="aviso aviso--panel" role="alertdialog" aria-modal="true" aria-labelledby="aviso-titulo">
    <div class="aviso__caja">
      <span class="aviso__icono" aria-hidden="true">!</span>
      <span class="kicker">Aviso del equipo facilitador</span>
      <h2 id="aviso-titulo" class="aviso__titulo">{{ aviso.title }}</h2>
      <p v-if="aviso.body" class="aviso__texto">{{ aviso.body }}</p>
      <button class="aviso__boton" type="button" @click="ackAlert(teamId, aviso.id)">¡Entendido!</button>
    </div>
  </div>

  <div v-else-if="cambio" class="aviso aviso--cambio" role="dialog" aria-modal="true" aria-labelledby="cambio-titulo">
    <div class="aviso__caja">
      <span class="aviso__icono" aria-hidden="true">→</span>
      <h2 id="cambio-titulo" class="aviso__titulo">¡Cambiamos de pantalla! ¿Preparados?</h2>
      <p class="aviso__texto">Ahora toca: <strong>{{ cambio.title }}</strong><template v-if="cambio.minutes"> · {{ cambio.minutes }} min</template></p>
      <button class="aviso__boton" type="button" @click="cambio = null">¡Vamos!</button>
    </div>
  </div>
</template>

<style scoped>
.aviso{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:1.5rem}
.aviso--panel{background:color-mix(in srgb,var(--c-rubi) 92%,transparent);color:var(--c-white)}
.aviso--cambio{background:color-mix(in srgb,var(--c-green-deep) 92%,transparent);color:var(--c-white)}
.aviso__caja{display:grid;justify-items:center;text-align:center;gap:.9rem;max-width:44rem}
.aviso__icono{display:grid;place-items:center;width:4.5rem;height:4.5rem;border-radius:50%;background:var(--c-white);font-size:2.2rem;font-weight:700}
.aviso--panel .aviso__icono{color:var(--c-rubi)}
.aviso--cambio .aviso__icono{color:var(--c-innova-dark)}
.aviso .kicker{color:var(--c-white);opacity:.85}
.aviso__titulo{margin:0;font-size:clamp(2rem,5vw,3.6rem);font-weight:600;letter-spacing:-.04em;line-height:1.05}
.aviso__texto{margin:0;font-size:clamp(1.1rem,2.2vw,1.4rem)}
.aviso__texto strong{color:var(--c-white)}
.aviso__boton{margin-top:.6rem;border:0;border-radius:99px;padding:.8em 1.8em;background:var(--c-white);color:var(--c-ink);font:inherit;font-size:1.1rem;font-weight:600;cursor:pointer;transition:transform .2s var(--ease-out)}
.aviso__boton:hover{transform:translateY(-2px)}
</style>
