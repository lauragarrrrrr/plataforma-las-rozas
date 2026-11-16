<script setup lang="ts">
// Foto en grande, dentro de la página (ver openPhoto en src/composables/usePhotoViewer.ts).
// Se cierra con «Cerrar», con Escape o pulsando fuera de la foto.
import { onBeforeUnmount, onMounted } from 'vue'
import { closePhoto, photoState as v } from '../composables/usePhotoViewer'

function onKey(e: KeyboardEvent) {
  if (v.url && e.key === 'Escape') closePhoto()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="v.url" class="visor" role="dialog" aria-modal="true" :aria-label="v.caption || 'Foto'" @click.self="closePhoto">
    <figure class="visor__fig">
      <img :src="v.url" :alt="v.caption || 'Foto subida'" />
      <figcaption v-if="v.caption">{{ v.caption }}</figcaption>
    </figure>
    <button class="visor__cerrar" type="button" @click="closePhoto">Cerrar ✕</button>
  </div>
</template>

<style scoped>
.visor{position:fixed;inset:0;z-index:110;display:grid;place-items:center;padding:clamp(1rem,4vw,3rem);background:color-mix(in srgb,var(--c-ink) 85%,transparent)}
.visor__fig{margin:0;display:grid;gap:.7rem;justify-items:center;max-width:100%;max-height:100%}
.visor__fig img{max-width:min(100%,1400px);max-height:calc(100vh - 8rem);object-fit:contain;border-radius:1rem;background:var(--c-white)}
.visor__fig figcaption{color:var(--c-white);font-size:.95rem;text-align:center}
.visor__cerrar{position:fixed;top:1rem;right:1rem;border:0;border-radius:99px;padding:.6em 1.2em;background:var(--c-white);color:var(--c-ink);font:inherit;font-weight:600;cursor:pointer}
</style>
