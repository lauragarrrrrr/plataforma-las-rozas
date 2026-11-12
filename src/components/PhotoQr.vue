<script setup lang="ts">
// QR para subir la foto con el móvil. Lleva a /subir/:equipo?d=:dinámica.
// El ordenador se desbloquea solo cuando la foto ha llegado.
import { computed, ref, watchEffect } from 'vue'
import QRCode from 'qrcode'
import PhotoUpload from './PhotoUpload.vue'

const props = defineProps<{ teamId: string; dynamicId: string }>()
const emit = defineEmits<{ uploaded: [dataUrl: string] }>()

const link = computed(() => `${location.origin}/subir/${props.teamId}?d=${props.dynamicId}`)
const qr = ref('')
const showBackup = ref(false)

watchEffect(async () => {
  // Colores de tokens.css: tinta sobre blanco para que lo lea cualquier móvil
  qr.value = await QRCode.toDataURL(link.value, { margin: 1, width: 320, color: { dark: '#000000', light: '#ffffff' } })
})
</script>

<template>
  <div class="qr">
    <img v-if="qr" :src="qr" width="200" height="200" alt="Código QR para subir la foto con el móvil" />
    <div class="qr__pasos">
      <ol>
        <li>Abrid la cámara del móvil y apuntad al código.</li>
        <li>Haced la foto.</li>
        <li>Esperad aquí: la pantalla avanza sola cuando llega.</li>
      </ol>
      <p class="qr__espera"><span class="punto" aria-hidden="true"></span> Esperando la foto…</p>
      <button class="enlace" type="button" @click="showBackup = !showBackup">¿El QR no funciona?</button>
      <PhotoUpload v-if="showBackup" label="Subir desde este ordenador" @uploaded="(u) => emit('uploaded', u)" />
    </div>
  </div>
</template>

<style scoped>
.qr{display:flex;flex-wrap:wrap;gap:1.2rem;align-items:center}
.qr img{width:200px;height:200px;border-radius:1rem;background:var(--c-white);box-shadow:0 0 0 1px var(--c-gris-10)}
.qr__pasos{display:grid;gap:.6rem;flex:1;min-width:14rem}
.qr__pasos ol{margin:0;padding-left:1.2rem;display:grid;gap:.25rem;color:var(--c-ink)}
.qr__espera{display:flex;align-items:center;gap:.5rem;font-weight:600;color:var(--c-innova-dark)}
.punto{width:.7rem;height:.7rem;border-radius:50%;background:var(--c-innova);animation:latir 1.2s ease-in-out infinite}
@keyframes latir{50%{opacity:.3;transform:scale(.8)}}
.enlace{justify-self:start;border:0;background:none;padding:0;font:inherit;font-size:.85rem;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}
</style>
