<script setup lang="ts">
// /subir/:id?d=:dinamica · Página del móvil que abre el QR.
// Se hacen o se eligen VARIAS fotos y se envían todas de una vez:
// · Normal: la que está marcada «Principal» es la del papel de la dinámica; las demás,
//   fotos de más (post-its, borradores…). El ordenador avanza cuando llega la principal.
// · Fichas individuales: todas son fichas.
// · ?extra=1 (o después de enviar): todas son fotos de más.
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ALL_DYNAMICS, photoOf, PREMORTEM, TEAM_DYNAMICS } from '../data/dynamics'
import { addPhoto, useStore } from '../data/store'
import { compressImage } from '../utils/image'

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

/** Las fichas individuales: todas las fotos son fichas */
const multi = computed(() => dynamic.value.id === PREMORTEM.id)
/** Solo fotos de más (post-its, borradores…) */
const extra = ref(route.query.extra === '1')
/** ¿Hay que marcar una como principal? */
const conPrincipal = computed(() => !multi.value && !extra.value)

// --- Las fotos preparadas, antes de enviarlas ---
const fotos = ref<string[]>([])
const principal = ref(0)
const preparando = ref(false)
const error = ref('')
const camara = ref<HTMLInputElement>()
const galeria = ref<HTMLInputElement>()

async function anadir(e: Event) {
  const input = e.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  if (!files.length) return
  preparando.value = true
  error.value = ''
  for (const f of files) {
    try {
      fotos.value.push(await compressImage(f))
    } catch {
      error.value = 'Alguna foto no se ha podido leer. Probad con otra.'
    }
  }
  preparando.value = false
  input.value = ''
}
function quitar(n: number) {
  fotos.value.splice(n, 1)
  if (principal.value === n) principal.value = 0
  else if (principal.value > n) principal.value--
}

// --- Enviar todas ---
const enviando = ref(0)
const fallo = ref(false)
const enviadas = ref<string[]>([])
async function enviar() {
  if (!fotos.value.length) return
  fallo.value = false
  const lista = [...fotos.value]
  const pendientes: string[] = []
  for (const [n, url] of lista.entries()) {
    enviando.value = n + 1
    const kind = multi.value ? PREMORTEM.photo.kind : conPrincipal.value && n === principal.value ? dynamic.value.photo.kind : 'other'
    try {
      await addPhoto(props.id, dynamic.value.id, kind, url)
      if (store.lastSaveFailed()) throw new Error('no guardada')
    } catch {
      pendientes.push(url)
    }
  }
  enviando.value = 0
  const ok = lista.filter((u) => !pendientes.includes(u))
  if (pendientes.length) {
    // Se quedan las que no han llegado, para reintentar (la principal ya no hace falta si llegó)
    if (conPrincipal.value && !pendientes.includes(lista[principal.value])) extra.value = true
    fotos.value = pendientes
    principal.value = 0
    fallo.value = true
    if (!ok.length) return
  } else {
    fotos.value = []
    principal.value = 0
  }
  enviadas.value = ok
}
function masFotos() {
  extra.value = !multi.value
  enviadas.value = []
}
</script>

<template>
  <main class="movil">
    <div class="wrap movil__in">
      <p v-if="!team" class="alerta">Este QR no corresponde a ningún equipo. Pedid ayuda al equipo facilitador.</p>

      <!-- Enviadas -->
      <template v-else-if="enviadas.length && !fotos.length">
        <span class="ok" aria-hidden="true">✓</span>
        <h1 class="titulo">{{ enviadas.length === 1 ? 'Foto subida' : `${enviadas.length} fotos subidas` }}</h1>
        <p v-if="multi">Cuando estén todas las fichas, seguid en el ordenador del equipo.</p>
        <p v-else>Ya están en el expediente del {{ team.name }}. Mirad el ordenador: ya podéis seguir.</p>
        <div class="miniaturas miniaturas--hechas">
          <img v-for="(u, n) in enviadas" :key="n" :src="u" :alt="`Foto ${n + 1}`" />
        </div>
        <button class="boton grande-boton" type="button" @click="masFotos">＋ {{ multi ? 'Subir más fichas' : 'Añadir más fotos' }}</button>
      </template>

      <!-- Hacer o elegir las fotos -->
      <template v-else>
        <span class="kicker">{{ team.name }} · {{ dynamic.title }}</span>
        <h1 v-if="multi" class="titulo">Subid las fichas de «{{ PREMORTEM.title }}»</h1>
        <h1 v-else-if="extra" class="titulo">Añadid más fotos</h1>
        <h1 v-else class="titulo">Subid vuestras fotos</h1>
        <p v-if="multi">Una foto por ficha. Podéis hacer varias o elegirlas de la galería y enviarlas todas juntas.</p>
        <p v-else-if="extra">Post-its, borradores, esquemas… Podéis hacer varias y enviarlas todas juntas.</p>
        <p v-else>La foto {{ photoOf(dynamic) }} y, si queréis, las de post-its y borradores. Hacedlas o elegidlas de la galería y enviadlas todas juntas. Que se vean enteras y se puedan leer.</p>

        <!-- Las fotos preparadas -->
        <template v-if="fotos.length">
          <p v-if="conPrincipal && fotos.length > 1" class="nota">Tocad la foto {{ photoOf(dynamic) }} para marcarla como <strong>principal</strong>.</p>
          <div class="miniaturas">
            <figure v-for="(u, n) in fotos" :key="u.slice(-40) + n" class="mini" :class="{ 'mini--principal': conPrincipal && n === principal }">
              <button type="button" class="mini__foto" :disabled="!conPrincipal" @click="principal = n">
                <img :src="u" :alt="`Foto ${n + 1}`" />
              </button>
              <figcaption v-if="conPrincipal && n === principal">Principal</figcaption>
              <button type="button" class="mini__quitar" :aria-label="`Quitar la foto ${n + 1}`" @click="quitar(n)">✕</button>
            </figure>
          </div>
        </template>

        <p v-if="enviando" class="enviando">Subiendo {{ enviando }} de {{ fotos.length }}… no cerréis esta pantalla.</p>
        <template v-else>
          <div class="botones">
            <button class="boton boton--foto" type="button" :disabled="preparando" @click="camara?.click()">📷 {{ fotos.length ? 'Hacer otra foto' : 'Hacer una foto' }}</button>
            <button class="boton boton--foto boton--sec" type="button" :disabled="preparando" @click="galeria?.click()">🖼 Elegir de la galería</button>
          </div>
          <p v-if="preparando" class="enviando">Preparando las fotos…</p>
          <button v-if="fotos.length" class="boton grande-boton" type="button" :disabled="preparando" @click="enviar">
            Enviar {{ fotos.length === 1 ? 'la foto' : `las ${fotos.length} fotos` }} →
          </button>
        </template>

        <input ref="camara" class="oculto" type="file" accept="image/*" capture="environment" @change="anadir" />
        <input ref="galeria" class="oculto" type="file" accept="image/*" multiple @change="anadir" />
        <p v-if="error" class="alerta">{{ error }}</p>
        <p v-if="fallo" class="alerta">No se {{ fotos.length === 1 ? 'ha podido subir 1 foto' : `han podido subir ${fotos.length} fotos` }}. Comprobad la conexión y pulsad «Enviar» otra vez.</p>
      </template>
    </div>
  </main>
</template>

<style scoped>
.movil{min-height:calc(100vh - 4.5rem);background:var(--c-green-light)}
.movil__in{display:grid;gap:1rem;padding-block:2rem;max-width:30rem}
.titulo{font-size:clamp(1.8rem,7vw,2.6rem);font-weight:500;letter-spacing:-.04em;line-height:1.05}
.ok{display:grid;place-items:center;width:4rem;height:4rem;border-radius:50%;background:var(--c-innova);color:var(--c-ink);font-size:2rem;font-weight:700}
.nota{margin:0;font-size:.9rem;color:var(--c-ink)}
.enviando{margin:0;font-weight:600;color:var(--c-innova-dark)}
.oculto{display:none}
.botones{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.boton--foto{justify-self:stretch;justify-content:center;padding:1em .6em;font-size:1rem}
.boton--sec{background:var(--c-white);box-shadow:inset 0 0 0 1.5px var(--c-ink)}
.boton:disabled{opacity:.45;cursor:not-allowed;transform:none}
.grande-boton{justify-self:stretch;justify-content:center;padding:1.1em;font-size:1.15rem}
.miniaturas{display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem}
.miniaturas--hechas{grid-template-columns:repeat(3,1fr)}
.miniaturas--hechas img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:.8rem;background:var(--c-white)}
.mini{position:relative;margin:0;border-radius:1rem;background:var(--c-white);padding:.35rem;box-shadow:0 0 0 1px var(--c-gris-10)}
.mini--principal{box-shadow:0 0 0 3px var(--c-innova)}
.mini__foto{display:block;width:100%;border:0;padding:0;background:none;cursor:pointer}
.mini__foto:disabled{cursor:default}
.mini__foto img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:.7rem}
.mini figcaption{position:absolute;left:.7rem;bottom:.7rem;background:var(--c-innova);color:var(--c-ink);font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-radius:99px;padding:.2em .7em}
.mini__quitar{position:absolute;top:.6rem;right:.6rem;width:2rem;height:2rem;border:0;border-radius:50%;background:var(--c-white);color:var(--c-ink);font-size:.95rem;font-weight:700;cursor:pointer;box-shadow:0 0 0 1px var(--c-gris-10)}
</style>
