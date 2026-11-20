<script setup lang="ts">
// QR para subir la foto con el móvil. Lleva a /subir/:equipo?d=:dinámica.
// · Normal: el ordenador avanza solo cuando la foto ha llegado.
// · multi: se pueden subir varias fotos seguidas (las fichas individuales).
// · extra: fotos de más de una dinámica ya registrada (post-its, borradores…), sin revisar.
import { computed, ref, watchEffect } from 'vue'
import QRCode from 'qrcode'
import PhotoUpload from './PhotoUpload.vue'

const props = defineProps<{ teamId: string; dynamicId: string; multi?: boolean; extra?: boolean }>()
const emit = defineEmits<{ uploaded: [dataUrl: string] }>()

const link = computed(() => `${location.origin}/subir/${props.teamId}?d=${props.dynamicId}${props.extra ? '&extra=1' : ''}`)
const qr = ref('')
const showBackup = ref(false)
/**
 * ¿Se está usando la app del equipo desde un móvil? (por si algún equipo no tiene ordenador)
 * Entonces no tiene sentido escanear un QR con el mismo móvil: la foto se hace directamente.
 */
const isPhone = typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
const showQrOnPhone = ref(false)

watchEffect(async () => {
  qr.value = await QRCode.toDataURL(link.value, { margin: 1, width: 320, color: { dark: '#000000', light: '#ffffff' } })
})
</script>

<template>
  <!-- En el móvil: la foto se hace con este mismo móvil -->
  <div v-if="isPhone && !showQrOnPhone" class="movil">
    <PhotoUpload :no-review="multi || extra" label="Hacer la foto con este móvil" @uploaded="(u) => emit('uploaded', u)" />
    <p class="movil__nota">Que se vea entera y se pueda leer: de frente, con luz y sin sombras.</p>
    <button class="enlace" type="button" @click="showQrOnPhone = true">¿La hacéis con otro móvil? Ver el código QR</button>
  </div>
  <div v-else class="qr">
    <img v-if="qr":src="qr" width="200" height="200" alt="Código QR para subir la foto con el móvil" />
    <div class="qr__pasos">
      <ol v-if="multi">
        <li>Abre la cámara del móvil y apunta al código.</li>
        <li>Haz o elige las fotos de las fichas y envíalas todas juntas.</li>
        <li>Las fichas aparecen aquí según llegan.</li>
      </ol>
      <ol v-else-if="extra">
        <li>Abrid la cámara del móvil y apuntad al código.</li>
        <li>Haced o elegid las fotos que queráis y enviadlas juntas.</li>
        <li>Van llegando a vuestro expediente.</li>
      </ol>
      <ol v-else>
        <li>Abrid la cámara del móvil y apuntad al código.</li>
        <li>Haced o elegid las fotos y enviadlas todas juntas.</li>
        <li>Esperad aquí: la pantalla avanza sola cuando llega.</li>
      </ol>
      <p class="qr__espera"><span class="punto" aria-hidden="true"></span> {{ multi ? 'Esperando las fichas…' : extra ? 'Esperando las fotos…' : 'Esperando la foto…' }}</p>
      <button class="enlace" type="button" @click="showBackup = !showBackup">¿El QR no funciona?</button>
      <PhotoUpload v-if="showBackup" :no-review="multi || extra" label="Subir desde este ordenador" @uploaded="(u) => emit('uploaded', u)" />
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
.movil{display:grid;gap:.6rem}
.movil :deep(.subida > .boton){justify-self:stretch;justify-content:center;font-size:1.1rem;padding:1em 1.2em}
.movil__nota{margin:0;font-size:.85rem}
@media(max-width:480px){.qr img{width:160px;height:160px}.qr__pasos{min-width:0}}
.enlace{justify-self:start;border:0;background:none;padding:0;font:inherit;font-size:.85rem;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}
</style>
