<script setup lang="ts">
// Botón para hacer o elegir una foto. En el móvil abre la cámara.
// Antes de enviarla: «¿Se ve bien la imagen?».
//  · Sí → se envía.
//  · No → se repite (2 intentos en total).
//  · Si la segunda tampoco convence → eligen la mejor de las dos.
// Con `noReview` (las fichas individuales, una detrás de otra) se envía directamente.
import { ref } from 'vue'
import { compressImage } from '../utils/image'

const props = defineProps<{ label?: string; noReview?: boolean }>()
const emit = defineEmits<{ uploaded: [dataUrl: string] }>()

const input = ref<HTMLInputElement>()
const busy = ref(false)
const error = ref('')
/** Fotos hechas en este envío (como mucho, 2) */
const intentos = ref<string[]>([])
const fase = ref<'nada' | 'revisar' | 'elegir'>('nada')

function reset() {
  intentos.value = []
  fase.value = 'nada'
}
function enviar(url: string) {
  emit('uploaded', url)
  reset()
}

async function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  busy.value = true
  error.value = ''
  try {
    const url = await compressImage(file)
    if (props.noReview) return enviar(url)
    intentos.value = [...intentos.value, url].slice(-2)
    fase.value = 'revisar'
  } catch {
    error.value = 'No se ha podido leer la foto. Probad con otra.'
  } finally {
    busy.value = false
    if (input.value) input.value.value = ''
  }
}

function noSeVe() {
  if (intentos.value.length < 2) input.value?.click() // segundo intento
  else fase.value = 'elegir'
}
</script>

<template>
  <div class="subida">
    <!-- ¿Se ve bien la imagen? -->
    <div v-if="fase === 'revisar'" class="revisar">
      <img :src="intentos[intentos.length - 1]" alt="Vista previa de la foto" />
      <p class="revisar__pregunta">{{ intentos.length === 1 ? '¿Se ve bien la imagen?' : '¿Se ve bien ahora?' }}</p>
      <p class="revisar__nota">Comprobad que se lee el texto: de frente, con luz y sin sombras.</p>
      <div class="revisar__botones">
        <button class="boton" type="button" :disabled="busy" @click="enviar(intentos[intentos.length - 1])">Sí, enviar</button>
        <button class="boton boton--sec" type="button" :disabled="busy" @click="noSeVe">
          {{ intentos.length === 1 ? 'No, repetir la foto (último intento)' : 'No' }}
        </button>
      </div>
    </div>

    <!-- Segunda foto tampoco: elegir la mejor -->
    <div v-else-if="fase === 'elegir'" class="revisar">
      <p class="revisar__pregunta">¿Cuál se ve mejor?</p>
      <p class="revisar__nota">Tocad la foto que queréis enviar.</p>
      <div class="elegir">
        <button v-for="(url, n) in intentos" :key="n" type="button" class="elegir__foto" @click="enviar(url)">
          <img :src="url" :alt="`Foto ${n + 1}`" />
          <span>Foto {{ n + 1 }}</span>
        </button>
      </div>
    </div>

    <button v-else class="boton" type="button" :disabled="busy" @click="input?.click()">
      <span aria-hidden="true">＋</span> {{ busy ? 'Preparando…' : label ?? 'Registrar fotografía' }}
    </button>
    <input ref="input" class="oculto" type="file" accept="image/*" capture="environment" @change="onChange" />
    <p v-if="error" class="alerta">{{ error }}</p>
  </div>
</template>

<style scoped>
.subida{display:grid;gap:.6rem;justify-items:stretch}
.subida > .boton{justify-self:start}
.oculto{display:none}
.revisar{display:grid;gap:.6rem}
.revisar img{width:100%;max-height:22rem;object-fit:contain;border-radius:1rem;background:var(--c-white);box-shadow:0 0 0 1px var(--c-gris-10)}
.revisar__pregunta{margin:0;font-size:1.25rem;font-weight:600;color:var(--c-ink)}
.revisar__nota{margin:0;font-size:.85rem}
.revisar__botones{display:flex;flex-wrap:wrap;gap:.5rem}
.boton--sec{background:var(--c-white);box-shadow:inset 0 0 0 1.5px var(--c-ink)}
.elegir{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.elegir__foto{display:grid;gap:.3rem;border:0;padding:.4rem;border-radius:1rem;background:var(--c-white);font:inherit;font-weight:600;color:var(--c-ink);cursor:pointer;box-shadow:0 0 0 1px var(--c-gris-10)}
.elegir__foto:hover{box-shadow:0 0 0 3px var(--c-innova)}
.elegir__foto img{width:100%;height:10rem;object-fit:cover;border-radius:.7rem}
</style>
