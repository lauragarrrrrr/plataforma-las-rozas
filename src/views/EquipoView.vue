<script setup lang="ts">
// /equipo/:id · App del equipo (parte de participantes)
// 1. ¿Quiénes sois? y ¿quién es el digital owner?
// 2. Mientras la sala está en la parte de facilitación: pantalla de espera.
// 3. Cuando se revelan los ámbitos: las dinámicas, una a una, con explicación,
//    chat que os reta, cronómetro, «Pedir ayuda» y foto obligatoria para seguir.
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { AGENDA } from '../data/agenda'
import { photoOf, TEAM_DYNAMICS } from '../data/dynamics'
import { addPhoto, nextDynamic, saveSetup, startDynamic, useStore } from '../data/store'
import { formatClock, useNow } from '../composables/useNow'
import CoachChat from '../components/CoachChat.vue'
import HelpButton from '../components/HelpButton.vue'
import PhotoQr from '../components/PhotoQr.vue'

const props = defineProps<{ id: string }>()
const store = useStore()
const now = useNow()

const team = computed(() => store.team(props.id))
const setup = computed(() => store.setup(props.id))
const progress = computed(() => store.progress(props.id))
const revealed = computed(() => store.db.event.areasRevealed)
const roomStep = computed(() => AGENDA[store.db.room.step] ?? AGENDA[0])

// --- 1. Quiénes sois ----------------------------------------------------------
const form = reactive({ members: ['', '', '', '', ''], owner: '' })
const named = computed(() => form.members.map((m) => m.trim()).filter(Boolean))
const editing = ref(false)
function startEditing() {
  const s = setup.value
  form.members = [...(s?.members ?? []), '', '', '', '', ''].slice(0, 5)
  form.owner = s?.digitalOwner ?? ''
  editing.value = true
}
function guardarEquipo() {
  if (!named.value.length || !named.value.includes(form.owner)) return
  saveSetup(props.id, named.value, form.owner)
  editing.value = false
}

// --- 3. Dinámicas -------------------------------------------------------------
const index = computed(() => progress.value?.current ?? 0)
const finished = computed(() => index.value >= TEAM_DYNAMICS.length)
const dynamic = computed(() => TEAM_DYNAMICS[Math.min(index.value, TEAM_DYNAMICS.length - 1)])
const nextOne = computed(() => TEAM_DYNAMICS[index.value + 1])
const photo = computed(() => store.photoFor(props.id, dynamic.value.id))

const startedAt = computed(() => progress.value?.started[dynamic.value.id])
const remaining = computed(() => {
  if (!startedAt.value) return dynamic.value.minutes * 60_000
  return new Date(startedAt.value).getTime() + dynamic.value.minutes * 60_000 - now.value
})
const timeUp = computed(() => remaining.value <= 0)
const elapsedPct = computed(() => Math.min(100, 100 - (remaining.value / (dynamic.value.minutes * 60_000)) * 100))

// El cronómetro arranca cuando el equipo llega a la dinámica
watch(
  () => [revealed.value, setup.value?.teamId, dynamic.value.id, finished.value] as const,
  ([isRevealed, hasSetup, dynId, isFinished]) => {
    if (isRevealed && hasSetup && !isFinished) startDynamic(props.id, dynId)
  },
  { immediate: true },
)

const showQr = ref(false)
watch(() => dynamic.value.id, () => (showQr.value = false))

const saveFailed = ref(false)
async function onPhoto(url: string) {
  try {
    await addPhoto(props.id, dynamic.value.id, dynamic.value.photo.kind, url)
    saveFailed.value = store.lastSaveFailed()
  } catch {
    saveFailed.value = true
  }
}

const expediente = computed(() =>
  TEAM_DYNAMICS.map((d) => ({ d, photos: store.photos(props.id).filter((p) => p.dynamicId === d.id) })).filter((x) => x.photos.length),
)
</script>

<template>
  <!-- Equipo que no existe -->
  <main v-if="!team" class="section">
    <div class="wrap">
      <p class="alerta">No existe el equipo «{{ id }}».</p>
      <RouterLink class="boton" to="/participa">Elegir equipo</RouterLink>
    </div>
  </main>

  <!-- 1 · ¿Quiénes sois? -->
  <main v-else-if="!setup || editing" class="section s-claro">
    <div class="wrap estrecho">
      <span class="kicker">{{ team.name }}</span>
      <h1 class="titular">¿Quiénes sois?</h1>
      <p class="intro">Escribid el nombre de pila de cada persona del equipo.</p>
      <form class="card quienes" @submit.prevent="guardarEquipo">
        <label v-for="(_, i) in form.members" :key="i" class="campo">
          <span>Persona {{ i + 1 }}</span>
          <input v-model="form.members[i]" type="text" maxlength="30" autocomplete="off" :placeholder="i === 0 ? 'Nombre' : 'Nombre (opcional)'" />
        </label>

        <fieldset v-if="named.length" class="owner">
          <legend>¿Quién será el digital owner?</legend>
          <p class="nota">La persona que lleva el ordenador del equipo, registra las fotos y abre el chat.</p>
          <label v-for="n in named" :key="n" class="opcion" :class="{ 'opcion--on': form.owner === n }">
            <input v-model="form.owner" type="radio" name="owner" :value="n" />
            {{ n }}
          </label>
        </fieldset>

        <button class="boton" type="submit" :disabled="!named.includes(form.owner)">Empezar</button>
      </form>
      <p class="nota">Solo guardamos los nombres de pila, para saber a quién acudir si pedís ayuda.</p>
    </div>
  </main>

  <!-- 2 · Esperando: la sala está en la parte de facilitación -->
  <main v-else-if="!revealed" class="espera">
    <div class="wrap espera__in">
      <span class="kicker">{{ team.name }} · Digital owner: {{ setup.digitalOwner }}</span>
      <h1 class="titular">Atentos a la sala</h1>
      <p class="intro">La jornada empieza todos juntos. Cuando se revele vuestro ámbito, empezaréis aquí vuestro trabajo en equipo.</p>
      <div class="card ahora">
        <span class="kicker">Ahora en la sala · {{ roomStep.time }}</span>
        <strong>{{ roomStep.title }}</strong>
        <p>{{ roomStep.description }}</p>
      </div>
      <button class="enlace" type="button" @click="startEditing">Cambiar las personas del equipo</button>
    </div>
  </main>

  <!-- 3 · Dinámicas -->
  <main v-else class="app">
    <header class="app__cab">
      <div class="wrap app__cab-in">
        <div>
          <span class="kicker">{{ team.name }} · {{ store.areaName(team.area) }}</span>
          <p class="owner-linea">Digital owner: <strong>{{ setup.digitalOwner }}</strong> · {{ setup.members.join(', ') }}</p>
        </div>
        <ol class="pasos" aria-label="Dinámicas">
          <li v-for="(d, i) in TEAM_DYNAMICS" :key="d.id" :class="{ hecho: i < index, actual: i === index }" :title="d.title">
            <span>{{ i + 1 }}</span>
          </li>
        </ol>
      </div>
    </header>

    <!-- Terminado -->
    <section v-if="finished" class="section s-oscuro">
      <div class="wrap">
        <span class="kicker">Lo habéis conseguido</span>
        <h1 class="titular">Vuestro trabajo está en el expediente.</h1>
        <p>Volved a la sala principal para el speed pitch.</p>
      </div>
    </section>

    <section v-else class="wrap dinamica">
      <div class="dinamica__izq">
        <div class="card explica">
          <span class="kicker">Dinámica {{ index + 1 }} de {{ TEAM_DYNAMICS.length }} · {{ dynamic.minutes }} min</span>
          <h1 class="dinamica__titulo">{{ dynamic.title }}</h1>
          <p class="que">{{ dynamic.what }}</p>
          <dl class="qpco">
            <div><dt>Para qué</dt><dd>{{ dynamic.why }}</dd></div>
            <div>
              <dt>Cómo</dt>
              <dd><ol class="como"><li v-for="h in dynamic.how" :key="h">{{ h }}</li></ol></dd>
            </div>
            <div><dt>Qué obtenemos</dt><dd>{{ dynamic.output }}</dd></div>
          </dl>
        </div>

        <div class="card reloj" :class="{ 'reloj--fin': timeUp }">
          <span class="kicker">Tiempo</span>
          <strong class="reloj__cifra">{{ formatClock(remaining) }}</strong>
          <div class="reloj__barra"><span :style="{ width: `${elapsedPct}%` }"></span></div>
        </div>

        <div class="card foto">
          <template v-if="photo">
            <span class="kicker">Foto registrada</span>
            <img :src="photo.url" :alt="`Foto: ${dynamic.photo.label}`" />
            <button v-if="nextOne" class="boton" type="button" @click="nextDynamic(id)">Siguiente: {{ nextOne.title }} →</button>
            <button v-else class="boton" type="button" @click="nextDynamic(id)">Terminar →</button>
          </template>
          <template v-else>
            <span class="kicker">Al terminar</span>
            <p>Subid una foto {{ photoOf(dynamic) }}. Sin la foto no podéis pasar a la siguiente dinámica.</p>
            <button v-if="!showQr" class="boton" type="button" @click="showQr = true">Ya hemos terminado: subir foto</button>
            <PhotoQr v-else :team-id="id" :dynamic-id="dynamic.id" @uploaded="onPhoto" />
          </template>
          <p v-if="saveFailed" class="alerta">No se ha podido guardar la foto. Probad otra vez o avisad al equipo facilitador.</p>
        </div>
      </div>

      <CoachChat class="dinamica__chat" :team-id="id" :dynamic="dynamic" />
    </section>

    <!-- Se acabó el tiempo: hay que subir la foto para seguir -->
    <div v-if="!finished && timeUp && !photo" class="bloqueo" role="dialog" aria-modal="true" aria-labelledby="bloqueo-titulo">
      <div class="bloqueo__caja">
        <span class="kicker">Se acabó el tiempo</span>
        <h2 id="bloqueo-titulo">Subid la foto para continuar</h2>
        <p>Fotografiad {{ dynamic.photo.label }} tal y como está ahora, aunque no esté terminado.</p>
        <PhotoQr :team-id="id" :dynamic-id="dynamic.id" @uploaded="onPhoto" />
      </div>
    </div>

    <details v-if="expediente.length" class="wrap expediente">
      <summary>Mi expediente · {{ store.photos(id).length }} {{ store.photos(id).length === 1 ? 'foto' : 'fotos' }}</summary>
      <div class="expediente__grid">
        <figure v-for="x in expediente" :key="x.d.id">
          <img :src="x.photos[x.photos.length - 1].url" :alt="x.d.title" />
          <figcaption>{{ x.d.title }}</figcaption>
        </figure>
      </div>
    </details>

    <HelpButton v-if="!finished" :team-id="id" :dynamic-id="dynamic.id" />
  </main>
</template>

<style scoped>
.estrecho{max-width:44rem}
.estrecho > *{margin-bottom:1rem}
.quienes{gap:.8rem}
.campo{display:grid;gap:.25rem}
.campo span{font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--c-innova-dark)}
.campo input{font:inherit;padding:.65rem .9rem;border:1.5px solid var(--c-green-mid);border-radius:.9rem;color:var(--c-ink)}
.owner{border:0;padding:0;margin:.6rem 0 0;display:flex;flex-wrap:wrap;gap:.5rem}
.owner legend{font-size:1.15rem;font-weight:500;color:var(--c-ink);margin-bottom:.2rem}
.owner .nota{width:100%;margin:0 0 .3rem}
.opcion{display:inline-flex;align-items:center;gap:.4rem;border-radius:99px;padding:.5em 1em;background:var(--c-green-light);color:var(--c-ink);cursor:pointer;font-weight:500}
.opcion input{accent-color:var(--c-innova-dark)}
.opcion--on{background:var(--c-innova)}
.nota{font-size:.85rem;font-style:italic}
.boton:disabled{opacity:.45;cursor:not-allowed;transform:none}

.espera{min-height:70vh;display:grid;align-items:center;background:var(--c-green-light)}
.espera__in{display:grid;gap:1.2rem;padding-block:3rem}
.ahora{gap:.4rem;max-width:44rem}
.ahora strong{font-size:clamp(1.3rem,2.5vw,1.8rem);font-weight:500;color:var(--c-ink);letter-spacing:-.02em}
.enlace{justify-self:start;border:0;background:none;padding:0;font:inherit;font-size:.85rem;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}

.app{background:var(--c-green-light);padding-bottom:6rem}
.app__cab{background:var(--c-white);border-bottom:1px solid var(--c-gris-10)}
.app__cab-in{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.8rem 2rem;padding-block:.9rem}
.owner-linea{font-size:.85rem}
.owner-linea strong{color:var(--c-ink)}
.pasos{list-style:none;margin:0;padding:0;display:flex;gap:.35rem}
.pasos li span{display:grid;place-items:center;width:1.9rem;height:1.9rem;border-radius:50%;font-size:.75rem;font-weight:700;background:var(--c-white);color:var(--c-green-dark);box-shadow:inset 0 0 0 2px var(--c-green-mid)}
.pasos .hecho span{background:var(--c-green-deep);color:var(--c-white);box-shadow:none}
.pasos .actual span{background:var(--c-innova);color:var(--c-ink);box-shadow:0 0 0 3px var(--c-white),0 0 0 5px var(--c-innova)}

.dinamica{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:1.25rem;padding-block:1.5rem;align-items:start}
@media(max-width:960px){.dinamica{grid-template-columns:1fr}}
.dinamica__izq{display:grid;gap:1.25rem}
.dinamica__chat{position:sticky;top:1rem}
.dinamica__titulo{font-size:clamp(1.8rem,3.4vw,2.8rem);font-weight:500;letter-spacing:-.04em;line-height:1.05}
.que{font-size:1.1rem;color:var(--c-ink)}
.qpco{margin:.4rem 0 0;display:grid;border-top:1px solid var(--c-gris-10)}
.qpco > div{display:grid;grid-template-columns:7.5rem 1fr;gap:.8rem;padding:.6rem 0;border-bottom:1px solid var(--c-gris-10)}
.qpco dt{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--c-innova-dark);padding-top:.2rem}
.qpco dd{margin:0;min-width:0}
.como{margin:0;padding-left:1.1rem;display:grid;gap:.25rem}
@media(max-width:520px){.qpco > div{grid-template-columns:1fr;gap:.15rem}}

.reloj{grid-template-columns:auto 1fr;align-items:center;column-gap:1.2rem}
.reloj .kicker{grid-column:1/-1}
.reloj__cifra{font-size:clamp(2.6rem,6vw,3.6rem);font-weight:600;letter-spacing:-.04em;color:var(--c-ink);font-variant-numeric:tabular-nums;line-height:1}
.reloj__barra{height:.6rem;border-radius:99px;background:var(--c-green-light);overflow:hidden}
.reloj__barra span{display:block;height:100%;background:var(--gradient-verde);transition:width 1s linear}
.reloj--fin .reloj__cifra{color:var(--c-rubi)}

.foto img{border-radius:1rem;max-height:18rem;object-fit:cover;width:100%}

.bloqueo{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:16px;background:color-mix(in srgb,var(--c-green-deep) 80%,transparent);backdrop-filter:blur(4px)}
.bloqueo__caja{background:var(--c-white);border-radius:var(--radius-card);padding:clamp(1.5rem,4vw,2.5rem);max-width:40rem;display:grid;gap:.8rem}
.bloqueo__caja h2{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:500;letter-spacing:-.03em;line-height:1.1}

.expediente{margin-top:1rem}
.expediente summary{cursor:pointer;font-weight:600;color:var(--c-ink);padding:.8rem 0}
.expediente__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(10rem,1fr));gap:.75rem}
.expediente figure{margin:0;background:var(--c-white);border-radius:1rem;padding:.5rem;display:grid;gap:.3rem}
.expediente img{border-radius:.7rem;aspect-ratio:4/3;object-fit:cover;width:100%}
.expediente figcaption{font-size:.8rem;color:var(--c-ink)}
</style>
