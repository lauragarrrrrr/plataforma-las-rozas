<script setup lang="ts">
// /equipo/:id · App del equipo (parte de participantes)
// 1. ¿Quiénes sois? y ¿quién es el digital owner?
// 2. Mientras la sala está en la parte de facilitación: pantalla de espera.
// 3. Cuando se revelan los ámbitos: las dinámicas, una a una, con explicación,
//    chat que os reta, cronómetro, «Pedir ayuda» y foto obligatoria para seguir.
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { AGENDA } from '../data/agenda'
import { ALL_DYNAMICS, backToRoomAfter, photoOf, PREMORTEM, TEAM_DYNAMICS } from '../data/dynamics'
import { addPhoto, finishPremortem, markIntroSeen, nextDynamic, requestHelp, saveSetup, startDynamic, useStore } from '../data/store'
import { formatClock, useNow } from '../composables/useNow'
import CoachChat from '../components/CoachChat.vue'
import HelpButton from '../components/HelpButton.vue'
import PhotoQr from '../components/PhotoQr.vue'
import VotacionEquipo from '../components/VotacionEquipo.vue'
import { SIMULATED_ROSTER } from '../data/roster'

const props = defineProps<{ id: string }>()
const store = useStore()
const now = useNow()

const team = computed(() => store.team(props.id))
const setup = computed(() => store.setup(props.id))
const progress = computed(() => store.progress(props.id))
const roomStep = computed(() => AGENDA[store.db.room.step] ?? AGENDA[0])

// --- 1. Quiénes sois ----------------------------------------------------------
// Los nombres vienen ya puestos (lista prevista del equipo); se pueden corregir.
const previstos = SIMULATED_ROSTER[props.id] ?? []
const form = reactive({ members: [...previstos, '', '', '', '', ''].slice(0, 5), owner: '' })
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

/** Hasta qué dinámica nos deja llegar el equipo facilitador */
const allowed = computed(() => store.allowed(props.id))
const waitingNext = computed(() => !!photo.value && index.value >= allowed.value)
const startedAt = computed(() => store.openedAt(props.id, dynamic.value.id))
const remaining = computed(() => {
  if (!startedAt.value) return dynamic.value.minutes * 60_000
  return new Date(startedAt.value).getTime() + dynamic.value.minutes * 60_000 - now.value
})
const timeUp = computed(() => remaining.value <= 0)
const elapsedPct = computed(() => Math.min(100, 100 - (remaining.value / (dynamic.value.minutes * 60_000)) * 100))

// Apuntamos cuándo llega el equipo a cada dinámica (el cronómetro cuenta desde que se abrió)
watch(
  () => [allowed.value, setup.value?.teamId, dynamic.value.id, finished.value] as const,
  ([open, hasSetup, dynId, isFinished]) => {
    if (open >= 0 && hasSetup && !isFinished) startDynamic(props.id, dynId)
  },
  { immediate: true },
)

// Con la foto subida, el equipo pasa solo en cuanto el equipo facilitador abre la siguiente
watch(
  () => [!!photo.value, allowed.value, index.value] as const,
  ([hasPhoto, open, i]) => {
    if (hasPhoto && i < open) nextDynamic(props.id)
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

// --- 1b. Reto de las fichas individuales ---------------------------------------
const premortemPhotos = computed(() => store.photos(props.id).filter((p) => p.dynamicId === PREMORTEM.id))
async function onPremortem(url: string) {
  try {
    await addPhoto(props.id, PREMORTEM.id, PREMORTEM.photo.kind, url)
    saveFailed.value = store.lastSaveFailed()
  } catch {
    saveFailed.value = true
  }
}
/** El reto no es obligatorio: si no hay fichas, solo se confirma */
function seguirReto() {
  if (premortemPhotos.value.length || confirm('No has subido ninguna ficha. ¿Seguir sin subirlas?')) finishPremortem(props.id)
}

const expediente = computed(() =>
  ALL_DYNAMICS.map((d) => ({ d, photos: store.photos(props.id).filter((p) => p.dynamicId === d.id) })).filter((x) => x.photos.length),
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
      <p class="intro">Comprobad que estáis todos. Si falta alguien o sobra, corregidlo.</p>
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

  <!-- 1b · Reto del digital owner: subir las fichas individuales -->
  <main v-else-if="!setup.premortemDone" class="reto">
    <div class="wrap reto__in">
      <div class="reto__cab">
        <span class="kicker">{{ team.name }} · Primer reto</span>
        <h1 class="titular">¡{{ setup.digitalOwner }}, digital owner!</h1>
        <p class="reto__lema">Te ponemos un reto:</p>
        <p class="intro">
          Sube las fichas individuales de <strong>«{{ PREMORTEM.title }}»</strong> que ha rellenado cada persona de tu equipo.
          Una foto por ficha, una detrás de otra.
        </p>
      </div>

      <div class="reto__grid">
        <div class="card">
          <span class="kicker">Con el móvil</span>
          <PhotoQr :team-id="id" :dynamic-id="PREMORTEM.id" multi @uploaded="onPremortem" />
        </div>

        <div class="card reto__contador">
          <span class="kicker">Fichas subidas</span>
          <strong class="reto__cifra">{{ premortemPhotos.length }}</strong>
          <div v-if="premortemPhotos.length" class="reto__fotos">
            <img v-for="p in premortemPhotos" :key="p.id" :src="p.url" alt="Ficha individual" />
          </div>
          <p class="nota">Cuando hayas subido las fichas que tengáis, sigue.</p>
          <button class="boton" type="button" @click="seguirReto">
            {{ premortemPhotos.length ? '¡Reto superado! Seguir →' : 'Seguir →' }}
          </button>
          <p v-if="saveFailed" class="alerta">No se ha podido guardar la foto. Probad otra vez.</p>
        </div>
      </div>
    </div>
    <HelpButton :team-id="id" :dynamic-id="PREMORTEM.id" />
  </main>

  <!-- 2 · Esperando: la sala está en la parte de facilitación -->
  <main v-else-if="allowed < 0" class="espera">
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
    <template v-if="finished">
      <section class="section s-oscuro">
        <div class="wrap">
          <span class="kicker">Lo habéis conseguido</span>
          <h1 class="titular">Vuestro trabajo está en el expediente.</h1>
          <p>Volved a la sala principal para el speed pitch.</p>
        </div>
      </section>
      <div class="wrap final-votacion">
        <VotacionEquipo :team-id="id" :open="store.votingOpen()" />
      </div>
    </template>

    <!-- Pantalla previa (por ejemplo, el sobre de las cartas) -->
    <section v-else-if="dynamic.intro && !progress?.introSeen?.[dynamic.id]" class="wrap intro-din">
      <span class="kicker">{{ dynamic.title }}</span>
      <span class="intro-din__icono" aria-hidden="true">✉</span>
      <h1 class="intro-din__titulo">{{ dynamic.intro.title }}</h1>
      <p class="intro-din__texto">{{ dynamic.intro.text }}</p>
      <button class="boton intro-din__boton" type="button" @click="markIntroSeen(id, dynamic.id)">{{ dynamic.intro.button }}</button>
    </section>

    <section v-else class="wrap dinamica" :class="{ 'dinamica--sin-chat': dynamic.noChat }">
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
            <div><dt>¿Qué tendríais que obtener?</dt><dd>{{ dynamic.output }}</dd></div>
          </dl>
        </div>

        <div class="card reloj" :class="{ 'reloj--fin': timeUp }">
          <span class="kicker">Tiempo</span>
          <strong class="reloj__cifra">{{ formatClock(remaining) }}</strong>
          <div class="reloj__barra"><span :style="{ width: `${elapsedPct}%` }"></span></div>
        </div>

        <div class="card foto">
          <template v-if="photo">
            <span class="kicker">Foto registrada ✓</span>
            <img :src="photo.url" :alt="`Foto: ${dynamic.photo.label}`" />
            <p v-if="waitingNext" class="esperando">
              <span class="punto" aria-hidden="true"></span>
              <span v-if="nextOne">Esperad: el equipo facilitador abrirá <strong>«{{ nextOne.title }}»</strong> cuando sea el momento.</span>
              <span v-else>¡Hecho! Esperad indicaciones del equipo facilitador.</span>
            </p>
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

      <CoachChat v-if="!dynamic.noChat" class="dinamica__chat" :team-id="id" :dynamic="dynamic" />
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

    <!-- Fin de fase: todos a la sala principal hasta que se abra la siguiente -->
    <div v-if="!finished && waitingNext && backToRoomAfter(dynamic)" class="bloqueo sala-aviso" role="dialog" aria-modal="true" aria-labelledby="sala-titulo">
      <div class="sala-aviso__caja">
        <span class="sala-aviso__icono" aria-hidden="true">→</span>
        <h2 id="sala-titulo">¡Volved a la sala principal!</h2>
        <p>Habéis terminado {{ nextOne ? 'esta fase' : 'el trabajo en equipo' }}. Id todos a la sala principal.</p>
        <p v-if="nextOne" class="nota">Cuando el equipo facilitador abra «{{ nextOne.title }}», esta pantalla seguirá sola.</p>
        <!-- Por si algo falla: esta pantalla tapa el botón de «Pedir ayuda» -->
        <p v-if="store.pendingHelp(id)" class="sala-aviso__enviado">Aviso enviado: el equipo facilitador viene a vuestra mesa.</p>
        <button v-else class="sala-aviso__error" type="button" @click="requestHelp(id, dynamic.id)">
          ¿Algo va mal? Avisar al equipo facilitador
        </button>
      </div>
    </div>

    <details v-if="expediente.length" class="wrap expediente">
      <summary>Mi expediente · {{ store.photos(id).length }} {{ store.photos(id).length === 1 ? 'foto' : 'fotos' }}</summary>
      <!-- Todas las fotos, agrupadas por dinámica. Al pulsar una, se abre en grande -->
      <section v-for="x in expediente" :key="x.d.id" class="expediente__bloque">
        <h3>{{ x.d.title }} <small>· {{ x.photos.length }} {{ x.photos.length === 1 ? 'foto' : 'fotos' }}</small></h3>
        <div class="expediente__grid">
          <a v-for="(p, n) in x.photos" :key="p.id" :href="p.url" target="_blank" rel="noopener" class="expediente__foto">
            <img :src="p.url" :alt="`${x.d.title} · foto ${n + 1}`" />
          </a>
        </div>
      </section>
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

.reto{background:var(--c-green-light);padding-bottom:6rem}
.reto__in{display:grid;gap:1.5rem;padding-block:2.5rem}
.reto__cab{display:grid;gap:.6rem}
.reto__lema{font-size:clamp(1.3rem,2.6vw,2rem);font-weight:500;letter-spacing:-.02em;color:var(--c-innova-dark)}
.reto__grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:1.25rem;align-items:start}
@media(max-width:900px){.reto__grid{grid-template-columns:1fr}}
.reto__contador{gap:.8rem}
.reto__cifra{font-size:3rem;font-weight:600;letter-spacing:-.04em;line-height:1;color:var(--c-ink)}
.reto__cifra small{font-size:1.2rem;font-weight:500;color:var(--c-green-dark)}
.reto__barra{height:.6rem;border-radius:99px;background:var(--c-green-light);overflow:hidden}
.reto__barra span{display:block;height:100%;background:var(--gradient-verde);transition:width .4s var(--ease-out)}
.reto__fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(5rem,1fr));gap:.4rem}
.reto__fotos img{aspect-ratio:3/4;object-fit:cover;border-radius:.6rem;width:100%}
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
/* Sin chat: explicación a la izquierda y cronómetro + foto a la derecha */
.dinamica--sin-chat{grid-template-columns:1fr}
.dinamica--sin-chat .dinamica__izq{grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);align-items:start}
.dinamica--sin-chat .explica{grid-row:span 2}
@media(max-width:960px){.dinamica--sin-chat .dinamica__izq{grid-template-columns:1fr}.dinamica--sin-chat .explica{grid-row:auto}}
.dinamica__izq{display:grid;gap:1.25rem}
.dinamica__chat{position:sticky;top:1rem}
.dinamica__titulo{font-size:clamp(1.8rem,3.4vw,2.8rem);font-weight:500;letter-spacing:-.04em;line-height:1.05}
.que{font-size:1.1rem;color:var(--c-ink)}
.qpco{margin:.4rem 0 0;display:grid;border-top:1px solid var(--c-gris-10)}
.qpco > div{display:grid;grid-template-columns:9rem 1fr;gap:.8rem;padding:.6rem 0;border-bottom:1px solid var(--c-gris-10)}
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
.esperando{display:flex;gap:.6rem;align-items:flex-start;background:var(--c-green-light);border-radius:1rem;padding:.8rem 1rem;color:var(--c-ink)}
.esperando .punto{flex:none;margin-top:.45rem;width:.7rem;height:.7rem;border-radius:50%;background:var(--c-innova);animation:latir 1.2s ease-in-out infinite}
@keyframes latir{50%{opacity:.3;transform:scale(.8)}}

.bloqueo{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:16px;background:color-mix(in srgb,var(--c-green-deep) 80%,transparent);backdrop-filter:blur(4px)}
.bloqueo__caja{background:var(--c-white);border-radius:var(--radius-card);padding:clamp(1.5rem,4vw,2.5rem);max-width:40rem;display:grid;gap:.8rem}
.bloqueo__caja h2{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:500;letter-spacing:-.03em;line-height:1.1}
.final-votacion{padding-block:1.5rem}
.intro-din{min-height:60vh;display:grid;justify-items:center;align-content:center;gap:1rem;text-align:center;padding-block:3rem}
.intro-din__icono{display:grid;place-items:center;width:6rem;height:6rem;border-radius:50%;background:var(--c-white);color:var(--c-innova-dark);font-size:3rem;box-shadow:0 0 0 6px var(--c-green-mid);animation:latido 2s ease-in-out infinite}
@keyframes latido{50%{transform:scale(1.06)}}
.intro-din__titulo{font-size:clamp(2.2rem,6vw,4rem);font-weight:500;letter-spacing:-.04em;line-height:1}
.intro-din__texto{font-size:clamp(1.2rem,2.4vw,1.7rem);color:var(--c-ink);max-width:30ch}
.intro-din__boton{justify-self:center;font-size:1.1rem;padding:.9em 1.8em}
.sala-aviso{background:color-mix(in srgb,var(--c-rubi) 88%,transparent)}
.sala-aviso__caja{display:grid;justify-items:center;gap:.8rem;text-align:center;color:var(--c-white);max-width:40rem}
.sala-aviso__icono{display:grid;place-items:center;width:5rem;height:5rem;border-radius:50%;background:var(--c-white);color:var(--c-rubi);font-size:2.6rem;font-weight:700;animation:empuja 1.4s ease-in-out infinite}
@keyframes empuja{50%{transform:translateX(10px)}}
.sala-aviso h2{color:var(--c-white);font-size:clamp(2.2rem,6vw,4rem);font-weight:600;letter-spacing:-.04em;line-height:1}
.sala-aviso p{font-size:1.2rem}
.sala-aviso .nota{font-size:.95rem;opacity:.9}
.sala-aviso__error{margin-top:1rem;border:2px solid var(--c-white);border-radius:99px;padding:.6em 1.3em;background:transparent;color:var(--c-white);font:inherit;font-weight:600;cursor:pointer}
.sala-aviso__error:hover{background:var(--c-white);color:var(--c-rubi)}
.sala-aviso__enviado{margin-top:1rem;background:var(--c-white);color:var(--c-rubi);border-radius:1rem;padding:.6rem 1.2rem;font-weight:600}
.expediente{margin-top:1rem}
.expediente summary{cursor:pointer;font-weight:600;color:var(--c-ink);padding:.8rem 0}
.expediente__bloque{background:var(--c-white);border-radius:var(--radius-card);padding:1rem 1.2rem;margin-bottom:.8rem;display:grid;gap:.6rem}
.expediente__bloque h3{font-size:1rem;font-weight:600;color:var(--c-ink)}
.expediente__bloque small{font-weight:400;color:var(--c-green-dark)}
.expediente__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(9rem,1fr));gap:.6rem}
.expediente__foto{display:block;border-radius:.7rem;overflow:hidden;transition:transform .2s var(--ease-out)}
.expediente__foto:hover{transform:scale(1.03)}
.expediente img{aspect-ratio:4/3;object-fit:cover;width:100%;display:block}
</style>
