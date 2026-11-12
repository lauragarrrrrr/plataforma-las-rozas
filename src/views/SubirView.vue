<script setup lang="ts">
// /subir/:id?d=:dinamica · Página del móvil que abre el QR.
// Una sola acción: hacer la foto. Se sube sola y el ordenador del equipo avanza.
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ALL_DYNAMICS, photoOf, PREMORTEM, TEAM_DYNAMICS } from '../data/dynamics'
import { addPhoto, useStore } from '../data/store'
import PhotoUpload from '../components/PhotoUpload.vue'

const props = defineProps<{ id: string }>()
const route = useRoute()
const store = useStore()

const team = computed(() => store.team(props.id))
/** La dinámica viene en el QR; si no, la que tenga abierta el equipo */
const dynamic = computed(() => {
  const fromQr = ALL_DYNAMICS.find((d) => d.id === route.query.d)
  if (fromQr) return fromQr
  const i = store.progress(props.id)?.current ?? 0
  return TEAM_DYNAMICS[Math.min(i, TEAM_DYNAMICS.length - 1)]
})

/** Las fichas individuales se suben varias seguidas */
const multi = computed(() => dynamic.value.id === PREMORTEM.id)
const sentCount = computed(() => store.photos(props.id).filter((p) => p.dynamicId === dynamic.value.id).length)

const sentUrl = ref('')
const failed = ref(false)
const sending = ref(false)

/** Solo dice «Foto subida» cuando la foto está guardada de verdad */
async function onPhoto(url: string) {
  sending.value = true
  failed.value = false
  try {
    await addPhoto(props.id, dynamic.value.id, dynamic.value.photo.kind, url)
    failed.value = store.lastSaveFailed()
    if (!failed.value) sentUrl.value = url
  } catch {
    failed.value = true
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <main class="movil">
    <div class="wrap movil__in">
      <p v-if="!team" class="alerta">Este QR no corresponde a ningún equipo. Pedid ayuda al equipo facilitador.</p>

      <!-- Foto enviada -->
      <!-- Fichas individuales: una detrás de otra -->
      <template v-else-if="sentUrl && !failed && multi">
        <span class="ok" aria-hidden="true">✓</span>
        <h1 class="titulo">Ficha subida</h1>
        <p class="contador">Llevas <strong>{{ sentCount }}</strong> {{ sentCount === 1 ? 'ficha' : 'fichas' }}.</p>
        <img class="previa" :src="sentUrl" alt="Ficha individual" />
        <button class="boton grande-boton" type="button" @click="sentUrl = ''">Subir otra ficha</button>
        <p>Cuando estén todas, sigue en el ordenador del equipo.</p>
      </template>

      <template v-else-if="sentUrl && !failed">
        <span class="ok" aria-hidden="true">✓</span>
        <h1 class="titulo">Foto subida</h1>
        <p>Ya está en el expediente del {{ team.name }}. Mirad el ordenador: ya podéis seguir.</p>
        <img class="previa" :src="sentUrl" :alt="`Foto: ${dynamic.photo.label}`" />
        <button class="enlace" type="button" @click="sentUrl = ''">Repetir la foto</button>
      </template>

      <!-- Hacer la foto -->
      <template v-else>
        <span class="kicker">{{ team.name }} · {{ dynamic.title }}</span>
        <h1 v-if="multi" class="titulo">Sube las fichas de «{{ PREMORTEM.title }}»</h1>
        <h1 v-else class="titulo">Haced la foto {{ photoOf(dynamic) }}</h1>
        <p v-if="multi">Una foto por ficha. <template v-if="sentCount">Llevas {{ sentCount }}.</template></p>
        <p v-else>Que se vea entero y se pueda leer. Se sube sola al pulsar.</p>
        <p v-if="sending" class="enviando">Subiendo la foto… no cerréis esta pantalla.</p>
        <PhotoUpload v-else class="grande" :label="multi ? 'Hacer la foto de una ficha' : 'Hacer la foto'" @uploaded="onPhoto" />
        <p v-if="failed" class="alerta">No se ha podido subir la foto. Comprobad la conexión y probad otra vez.</p>
      </template>
    </div>
  </main>
</template>

<style scoped>
.movil{min-height:calc(100vh - 4.5rem);background:var(--c-green-light)}
.movil__in{display:grid;gap:1rem;padding-block:2rem;max-width:30rem}
.titulo{font-size:clamp(1.8rem,7vw,2.6rem);font-weight:500;letter-spacing:-.04em;line-height:1.05}
.grande :deep(.boton){width:100%;justify-content:center;padding:1.1em;font-size:1.15rem}
.ok{display:grid;place-items:center;width:4rem;height:4rem;border-radius:50%;background:var(--c-innova);color:var(--c-ink);font-size:2rem;font-weight:700}
.previa{border-radius:1rem;max-height:50vh;object-fit:contain;background:var(--c-white)}
.enviando{font-weight:600;color:var(--c-innova-dark)}
.contador{font-size:1.15rem;color:var(--c-ink)}
.grande-boton{width:100%;justify-content:center;padding:1.1em;font-size:1.15rem}
.enlace{justify-self:start;border:0;background:none;padding:0;font:inherit;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}
</style>
