<script setup lang="ts">
// Foto en grande, dentro de la página (ver openPhoto en src/composables/usePhotoViewer.ts).
// Se cierra con «Cerrar», con Escape o pulsando fuera de la foto.
// Al tocar la foto se amplía más y se puede mover con el dedo (para leerla en el móvil).
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { closePhoto, photoState as v } from '../composables/usePhotoViewer'

const ampliada = ref(false)
watch(() => v.url, () => { ampliada.value = false })

function onKey(e: KeyboardEvent) {
  if (v.url && e.key === 'Escape') closePhoto()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="v.url" class="visor" :class="{ 'visor--ampliada': ampliada }" role="dialog" aria-modal="true" :aria-label="v.caption || 'Foto'" @click.self="closePhoto">
    <figure class="visor__fig">
      <img :src="v.url" :alt="v.caption || 'Foto subida'" @click="ampliada = !ampliada" />
      <figcaption>
        <template v-if="v.caption">{{ v.caption }}<br /></template>
        <small>{{ ampliada ? 'Moved la foto con el dedo. Tocadla otra vez para verla entera.' : 'Tocad la foto para ampliarla.' }}</small>
      </figcaption>
    </figure>
    <button class="visor__cerrar" type="button" @click="closePhoto">Cerrar ✕</button>
  </div>
</template>

<style scoped>
.visor{position:fixed;inset:0;z-index:110;display:grid;place-items:center;padding:clamp(1rem,4vw,3rem);background:color-mix(in srgb,var(--c-ink) 85%,transparent)}
.visor__fig{margin:0;display:grid;gap:.7rem;justify-items:center;max-width:100%;max-height:100%}
.visor__fig img{max-width:min(100%,1400px);max-height:calc(100vh - 9rem);object-fit:contain;border-radius:1rem;background:var(--c-white);cursor:zoom-in}
.visor__fig figcaption{color:var(--c-white);font-size:.95rem;text-align:center}
.visor__fig figcaption small{font-size:.8rem;opacity:.8}
.visor__cerrar{position:fixed;top:1rem;right:1rem;z-index:1;border:0;border-radius:99px;padding:.6em 1.2em;background:var(--c-white);color:var(--c-ink);font:inherit;font-weight:600;cursor:pointer}
/* Ampliada: la foto, mucho más grande, y se mueve con el dedo o con las barras */
.visor--ampliada{overflow:auto;place-items:start;padding:4.5rem 1rem 1rem;-webkit-overflow-scrolling:touch}
.visor--ampliada .visor__fig{max-width:none;max-height:none;justify-items:start}
.visor--ampliada .visor__fig img{max-width:none;max-height:none;width:max(250vw,1400px);cursor:zoom-out}
@media(min-width:900px){.visor--ampliada .visor__fig img{width:min(2500px,180vw)}}
</style>
