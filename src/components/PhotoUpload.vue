<script setup lang="ts">
// Botón para hacer o elegir una foto. En el móvil abre la cámara.
import { ref } from 'vue'
import { compressImage } from '../utils/image'

defineProps<{ label?: string }>()
const emit = defineEmits<{ uploaded: [dataUrl: string] }>()

const input = ref<HTMLInputElement>()
const busy = ref(false)
const error = ref('')

async function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  busy.value = true
  error.value = ''
  try {
    emit('uploaded', await compressImage(file))
  } catch {
    error.value = 'No se ha podido leer la foto. Probad con otra.'
  } finally {
    busy.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div class="subida">
    <button class="boton" type="button" :disabled="busy" @click="input?.click()">
      <span aria-hidden="true">＋</span> {{ busy ? 'Subiendo…' : label ?? 'Registrar fotografía' }}
    </button>
    <input ref="input" class="oculto" type="file" accept="image/*" capture="environment" @change="onChange" />
    <p v-if="error" class="alerta">{{ error }}</p>
  </div>
</template>

<style scoped>
.subida{display:grid;gap:.6rem;justify-items:start}
.oculto{display:none}
</style>
