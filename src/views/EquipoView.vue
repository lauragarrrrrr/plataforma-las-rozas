<script setup lang="ts">
import { rich } from '../utils/rich'
// /equipo/:id · App del equipo (parte de participantes)
// 1. ¿Quiénes sois? y ¿quién es el digital owner?
// 2. Mientras la sala está en la parte de facilitación: ya ven «Titular positivo», sin cronómetro en marcha.
// 3. Cuando se revelan los ámbitos: las dinámicas, una a una, con explicación,
//    chat que os reta, cronómetro, «Pedir ayuda» y foto obligatoria para seguir.
import { askConfirm } from '../composables/useConfirm'
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { AGENDA } from '../data/agenda'
import { ALL_DYNAMICS, backToRoomAfter, photoOf, PREMORTEM, TEAM_DYNAMICS } from '../data/dynamics'
import { forgetOnDevice, recallOnDevice, rememberOnDevice, addPhoto, autoAdvance, canAutoAdvance, finishPremortem, markIntroSeen, nextDynamic, requestHelp, saveSetup, startDynamic, useStore } from '../data/store'
import { useNow } from '../composables/useNow'
import { openPhoto } from '../composables/usePhotoViewer'
import CoachChat from '../components/CoachChat.vue'
import DynamicTimer from '../components/DynamicTimer.vue'
import HelpButton from '../components/HelpButton.vue'
import PhotoQr from '../components/PhotoQr.vue'
import VotacionEquipo from '../components/VotacionEquipo.vue'
import TeamNotices from '../components/TeamNotices.vue'
import { ROSTER } from '../data/roster'

const props = defineProps<{ id: string }>()
const store = useStore()
const now = useNow()

const team = computed(() => store.team(props.id))
const setup = computed(() => store.setup(props.id))
const progress = computed(() => store.progress(props.id))

// --- 1. Quiénes sois ----------------------------------------------------------
// Los nombres vienen ya puestos (lista prevista del equipo); se pueden corregir.
const previstos = ROSTER[props.id] ?? []
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

// --- 0. ¿Eres el digital owner? ------------------------------------------------
// El equipo elige a su digital owner desde el móvil (/participa). Al entrar desde el
// ordenador con el enlace del correo, escribe su nombre: si es la persona elegida,
// bienvenida; si es otra persona del equipo, puede tomar el relevo.
// Este ordenador se acuerda de quién entró (no se vuelve a preguntar al recargar).
const OWNER_KEY = `lr2040-ordenador-${props.id}`
// Se olvida al dejar todo en blanco o restaurar (va unido a la jornada de datos)
const deviceOwner = ref(recallOnDevice<string>(OWNER_KEY) ?? '')
watch(() => store.db.event.jornada, () => { deviceOwner.value = recallOnDevice<string>(OWNER_KEY) ?? '' })
const verified = computed(() => !!setup.value && !!deviceOwner.value)
const teamMembers = computed(() => setup.value?.members ?? previstos)
const picked = ref('')
/** «No somos este equipo»: el ordenador olvida el equipo y vuelve a «¿Qué equipo sois?» */
function cambiarEquipo() { forgetOnDevice('lr2040-equipo-del-ordenador') }
const pickedFirst = computed(() => picked.value.split(' ')[0])
/** owner: es la persona elegida · other: el equipo eligió a otra · new: aún no han elegido */
const pickedKind = computed(() => {
  if (!picked.value) return ''
  if (!setup.value?.digitalOwner) return 'new'
  return setup.value.digitalOwner === picked.value ? 'owner' : 'other'
})
function enterAsOwner() {
  if (!picked.value) return
  if (setup.value?.digitalOwner !== picked.value) saveSetup(props.id, [...teamMembers.value], picked.value)
  rememberOnDevice(OWNER_KEY, picked.value)
  deviceOwner.value = picked.value
}

// --- 3. Dinámicas -------------------------------------------------------------
const index = computed(() => progress.value?.current ?? 0)
const finished = computed(() => index.value >= TEAM_DYNAMICS.length)
const dynamic = computed(() => TEAM_DYNAMICS[Math.min(index.value, TEAM_DYNAMICS.length - 1)])
const nextOne = computed(() => TEAM_DYNAMICS[index.value + 1])
const photo = computed(() => store.photoFor(props.id, dynamic.value.id))

/** Hasta qué dinámica nos deja llegar el equipo facilitador */
/** Pantalla «Antes de empezar» (una sola vez por equipo) */
const COMO_FUNCIONA = 'como-funciona'
const allowed = computed(() => store.allowed(props.id))
/** Todavía no se ha abierto la primera dinámica: la ven, pero el cronómetro no corre */
const pendiente = computed(() => allowed.value < 0)
/** El equipo ya está en las dinámicas (para el aviso «¡Cambiamos de pantalla!») */
const inDynamics = computed(() => !!setup.value?.premortemDone && allowed.value >= 0 && !finished.value)
const waitingNext = computed(() => !!photo.value && index.value >= allowed.value)
/**
 * ¿Toca pausa después de esta dinámica? Sí, si en la escaleta el siguiente momento es un descanso
 * (la pausa para café de las 11:45). Devuelve sus minutos y a qué hora se vuelve a la sala.
 */
const pausa = computed(() => {
  const stepId = dynamic.value.id === 'como-podriamos' ? 'a-quien' : dynamic.value.id
  const i = AGENDA.findIndex((s) => s.id === stepId)
  const siguiente = AGENDA[i + 1]
  if (i < 0 || !siguiente || siguiente.kind !== 'break' || siguiente.id === 'comida') return null
  return { minutes: siguiente.minutes, vuelta: AGENDA[i + 2]?.time ?? '' }
})
const startedAt = computed(() => store.openedAt(props.id, dynamic.value.id))
const remaining = computed(() => {
  if (!startedAt.value) return dynamic.value.minutes * 60_000
  return new Date(startedAt.value).getTime() + dynamic.value.minutes * 60_000 - now.value
})
const timeUp = computed(() => remaining.value <= 0)

// Apuntamos cuándo llega el equipo a cada dinámica (el cronómetro cuenta desde que se abrió)
watch(
  // Solo cuando el equipo VE la dinámica (después del reto de las fichas y de «Antes de empezar»)
  () => [allowed.value, setup.value?.teamId, dynamic.value.id, finished.value, !!setup.value?.premortemDone, !!progress.value?.introSeen?.[COMO_FUNCIONA]] as const,
  ([open, hasSetup, dynId, isFinished, retoHecho, leido]) => {
    if (open >= 0 && hasSetup && !isFinished && retoHecho && leido) startDynamic(props.id, dynId)
  },
  { immediate: true },
)

// Al final de una fase, el equipo SIEMPRE ve «¡Volved a la sala principal!» antes de pasar
// (también si sube la foto tarde, cuando el resto ya ha empezado la siguiente: entonces pulsa «Seguir»).
const salaKey = computed(() => 'sala-' + dynamic.value.id)
const salaVista = computed(() => !!progress.value?.introSeen?.[salaKey.value])
const vuelveASala = computed(() => !finished.value && !!photo.value && backToRoomAfter(dynamic.value))
/** Ha subido la foto tarde: el resto ya está en la siguiente */
const salaTarde = computed(() => vuelveASala.value && allowed.value > index.value && !salaVista.value)
// Si ha visto el aviso mientras esperaba, ya cuenta como visto
watch(
  () => vuelveASala.value && waitingNext.value,
  (visto) => { if (visto && !salaVista.value) markIntroSeen(props.id, salaKey.value) },
  { immediate: true },
)

// Con la foto subida, el equipo pasa solo en cuanto el equipo facilitador abre la siguiente
watch(
  () => [!!photo.value, allowed.value, index.value, salaVista.value] as const,
  ([hasPhoto, open, i, vista]) => {
    if (hasPhoto && i < open && !(backToRoomAfter(dynamic.value) && !vista)) nextDynamic(props.id)
  },
  { immediate: true },
)

// …y también pasa solo cuando se acaba el tiempo y ya tiene la foto (salvo al final de una fase)
const autoNext = computed(() => !finished.value && canAutoAdvance(props.id))
watch(
  () => [!!photo.value, timeUp.value, index.value] as const,
  ([hasPhoto, up]) => {
    if (hasPhoto && up && autoNext.value) autoAdvance(props.id)
  },
  { immediate: true },
)

const showQr = ref(false)
/** Fotos de más de esta dinámica (post-its, borradores…), además de la principal */
const showExtraQr = ref(false)
watch(() => dynamic.value.id, () => { showQr.value = false; showExtraQr.value = false })
const extras = computed(() => store.photos(props.id).filter((p) => p.dynamicId === dynamic.value.id && p.kind === 'other'))

const saveFailed = ref(false)
async function onPhoto(url: string, extra = false) {
  try {
    await addPhoto(props.id, dynamic.value.id, extra ? 'other' : dynamic.value.photo.kind, url)
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
async function seguirReto() {
  if (premortemPhotos.value.length || (await askConfirm('No has subido ninguna ficha. ¿Seguir sin subirlas?'))) finishPremortem(props.id)
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

  <!-- 0 · ¿Eres el digital owner? -->
  <main v-else-if="!setup || (!verified && !editing)" class="section s-claro paso">
    <div class="wrap estrecho">
      <span class="kicker">{{ team.name }} · {{ store.areaName(team.area) }}</span>

      <!-- Ya ha tocado su nombre -->
      <div v-if="picked" class="card bienvenida">
        <template v-if="pickedKind === 'owner'">
          <h1 class="titular">¡{{ pickedFirst }}, eres digital owner!</h1>
          <p class="intro">Te damos la bienvenida. Desde este ordenador llevarás toda la experiencia digital del equipo {{ team.id }}.</p>
          <button class="boton" type="button" @click="enterAsOwner">¡Empezamos!</button>
        </template>
        <template v-else-if="pickedKind === 'other'">
          <h1 class="titular">Hola, {{ pickedFirst }}</h1>
          <p class="intro">El digital owner de vuestro equipo es <strong>{{ setup?.digitalOwner }}</strong>. ¿Pasas a serlo tú?</p>
          <button class="boton" type="button" @click="enterAsOwner">Sí, soy yo el digital owner</button>
        </template>
        <template v-else>
          <h1 class="titular">¡{{ pickedFirst }}, eres digital owner!</h1>
          <p class="intro">Te damos la bienvenida. Desde este ordenador llevarás toda la experiencia digital del equipo {{ team.id }}.</p>
          <button class="boton" type="button" @click="enterAsOwner">¡Empezamos!</button>
        </template>
        <button class="enlace" type="button" @click="picked = ''">{{ pickedKind === 'new' ? 'Nos hemos equivocado de persona' : `No soy ${pickedFirst}` }}</button>
      </div>

      <!-- Todavía sin digital owner: lo elige el equipo, todos juntos -->
      <template v-else-if="!setup?.digitalOwner">
        <h1 class="titular">¿Quién será vuestro digital owner?</h1>
        <p class="intro">La persona que llevará este ordenador y subirá las fotos del equipo. Elegidla entre todos y tocad su nombre.</p>
        <div class="nombres">
          <button v-for="m in teamMembers" :key="m" type="button" class="nombres__btn" @click="picked = m">{{ m }}</button>
        </div>
        <p class="nota">¿Falta alguien? Avisad al equipo facilitador. · <RouterLink :to="'/equipo'" @click="cambiarEquipo">No somos el equipo {{ team.id }}</RouterLink></p>
      </template>

      <!-- Ya hay digital owner (por ejemplo, al volver a entrar o desde otro ordenador) -->
      <template v-else>
        <h1 class="titular">¡Hola, digital owner!</h1>
        <p class="intro">¿Quién eres? Toca tu nombre para entrar.</p>
        <div class="nombres">
          <button v-for="m in teamMembers" :key="m" type="button" class="nombres__btn" :class="{ 'nombres__btn--owner': m === setup?.digitalOwner }" @click="picked = m">{{ m }}</button>
        </div>
        <p class="nota">¿No sale tu nombre? Avisad al equipo facilitador.</p>
      </template>
    </div>
  </main>

  <!-- 1 · ¿Quiénes sois? (para corregir las personas del equipo) -->
  <main v-else-if="editing" class="section s-claro">
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
          <p class="nota">Quien llevará el ordenador y centralizará toda la experiencia digital del equipo.</p>
          <label v-for="n in named" :key="n" class="opcion" :class="{ 'opcion--on': form.owner === n }">
            <input v-model="form.owner" type="radio" name="owner" :value="n" />
            {{ n }}
          </label>
        </fieldset>

        <button class="boton" type="submit" :disabled="!named.includes(form.owner)">Empezar</button>
      </form>
    </div>
  </main>

  <!-- 1b · Reto del digital owner: subir las fichas individuales -->
  <main v-else-if="!setup.premortemDone" class="reto">
    <div class="wrap reto__in">
      <div class="reto__cab">
        <span class="kicker">{{ team.name }} · Primer reto</span>
        <h1 class="titular">¡{{ setup.digitalOwner.split(" ")[0] }}, digital owner!</h1>
        <p class="reto__lema">Te ponemos un reto:</p>
        <p class="intro">
          Sube las fichas individuales de <strong>«{{ PREMORTEM.title }}»</strong> que ha rellenado cada persona de tu equipo.
          Una foto por ficha: podéis hacerlas o elegirlas todas y enviarlas juntas.
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

  <!-- 2 · Antes de empezar: primero el papel, después la pantalla (se ve una vez) -->
  <main v-else-if="!progress?.introSeen?.[COMO_FUNCIONA]" class="reto">
    <div class="wrap arranque">
      <header class="arranque__cab">
        <span class="kicker">{{ team.name }} · Antes de empezar</span>
        <h1 class="arranque__titulo">Primero, el papel.<br /><span>Después, la pantalla.</span></h1>
        <p class="arranque__intro">Esta aplicación es vuestra guía durante la jornada. Pero el trabajo de verdad se hace <strong>en la mesa</strong>, hablando entre todos y escribiendo en los materiales que tenéis delante.</p>
      </header>
      <ol class="arranque__pasos">
        <li>
          <span class="arranque__num">1</span>
          <strong>Mirad aquí qué toca</strong>
          <p>En cada dinámica os explicamos qué hacer y cuánto tiempo tenéis.</p>
        </li>
        <li>
          <span class="arranque__num">2</span>
          <strong>Trabajad en papel</strong>
          <p>El periódico, las fichas y los post-its de vuestra mesa: ahí va todo lo que penséis.</p>
        </li>
        <li>
          <span class="arranque__num">3</span>
          <strong>Haced la foto y subidla</strong>
          <p>Al terminar cada dinámica. Así queda en vuestro expediente y podéis pasar a la siguiente.</p>
        </li>
      </ol>
      <footer class="arranque__pie">
        <button class="boton arranque__boton" type="button" @click="markIntroSeen(id, COMO_FUNCIONA)">¡Entendido, empezamos!</button>
        <p>No tenéis que escribir vuestro trabajo en el ordenador: la foto basta.</p>
      </footer>
    </div>
    <HelpButton :team-id="id" :dynamic-id="TEAM_DYNAMICS[0].id" />
  </main>

  <!-- 3 · Dinámicas -->
  <main v-else class="app">
    <header class="app__cab">
      <div class="wrap app__cab-in">
        <div>
          <span class="kicker">{{ team.name }} · {{ store.areaName(team.area) }}</span>
          <p class="owner-linea" :title="setup.members.join(', ')">Digital owner: <strong>{{ setup.digitalOwner }}</strong> · <button class="enlace" type="button" @click="startEditing">Cambiar</button></p>
        </div>
        <DynamicTimer v-if="!finished && !(dynamic.intro && !progress?.introSeen?.[dynamic.id])" class="app__reloj" :remaining="remaining" :minutes="dynamic.minutes" :photo-done="!!photo" compact />
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
        <!-- El equipo facilitador ya ha abierto la siguiente: solo falta la foto -->
        <p v-if="!photo && allowed > index" class="avanzar" role="alert">
          <strong>¡Tenemos que avanzar!</strong> Subid ya la foto de «{{ dynamic.title }}» para pasar a la siguiente.
        </p>
        <p v-if="pendiente" class="pendiente" role="status">
          <span class="punto" aria-hidden="true"></span>
          <span><strong>Atentos a la sala.</strong> Empezaréis «{{ dynamic.title }}» cuando lo abra el equipo facilitador: en ese momento arranca vuestro cronómetro. Mientras, podéis leer de qué va.</span>
        </p>

        <div class="card explica">
          <span class="kicker">Dinámica {{ index + 1 }} de {{ TEAM_DYNAMICS.length }} · {{ dynamic.minutes }} min</span>
          <h1 class="dinamica__titulo">{{ dynamic.title }}</h1>
          <p class="que" v-html="rich(dynamic.what)"></p>
          <dl class="qpco">
            <div><dt>Para qué</dt><dd v-html="rich(dynamic.why)"></dd></div>
            <div>
              <dt>Cómo</dt>
              <dd><ol class="como"><li v-for="h in dynamic.how" :key="h" v-html="rich(h)"></li></ol></dd>
            </div>
            <div><dt>¿Qué tendríais que obtener?</dt><dd v-html="rich(dynamic.output)"></dd></div>
          </dl>
        </div>

      </div>

      <div class="dinamica__der">
        <CoachChat v-if="!dynamic.noChat" class="dinamica__chat" :team-id="id" :dynamic="dynamic" />
          <div v-if="!pendiente" class="card foto" :class="{ 'foto--boton': !photo && !showQr && !dynamic.noChat }">
            <template v-if="photo">
              <span class="kicker">Foto registrada ✓</span>
              <img :src="photo.url" :alt="`Foto: ${dynamic.photo.label}`" />
              <p v-if="waitingNext" class="esperando">
                <span class="punto" aria-hidden="true"></span>
                <span v-if="nextOne && autoNext">¡Foto subida! Cuando acabe el tiempo pasaréis solos a <strong>«{{ nextOne.title }}»</strong>. Aprovechadlo para repasar.</span>
                <span v-else-if="nextOne">Esperad: el equipo facilitador abrirá <strong>«{{ nextOne.title }}»</strong> cuando sea el momento.</span>
                <span v-else>¡Hecho! Esperad indicaciones del equipo facilitador.</span>
              </p>
              <!-- Más fotos: post-its, borradores… -->
              <div class="extras">
                <div v-if="extras.length" class="extras__fotos">
                  <button v-for="(p, n) in extras" :key="p.id" type="button" @click="openPhoto(p.url, `${dynamic.title} · foto de más ${n + 1}`)">
                    <img :src="p.url" :alt="`Foto de más ${n + 1}`" />
                  </button>
                </div>
                <button v-if="!showExtraQr" class="enlace" type="button" @click="showExtraQr = true">
                  ＋ Añadir más fotos (post-its, borradores…){{ extras.length ? ` · lleváis ${extras.length}` : '' }}
                </button>
                <PhotoQr v-else :team-id="id" :dynamic-id="dynamic.id" extra @uploaded="(u) => onPhoto(u, true)" />
              </div>
            </template>
            <template v-else>
              <!-- Un solo botón; al pulsarlo sale el QR -->
              <!-- Sin chat: una tarjeta que explica qué subir -->
              <div v-if="!showQr && dynamic.noChat" class="foto__intro">
                <span class="foto__icono" aria-hidden="true">📷</span>
                <span class="kicker">Al terminar</span>
                <strong>Subid vuestras imágenes</strong>
                <p>La foto {{ photoOf(dynamic) }} y, si queréis, las de post-its y borradores. Sin la foto no podéis pasar a la siguiente.</p>
              </div>
              <button v-if="!showQr" class="boton foto__subir" type="button" @click="showQr = true">{{ dynamic.noChat ? 'Subir imágenes' : '📷 Subir imágenes' }}</button>
              <div v-else class="foto__cab">
                <span class="kicker">Subir imágenes</span>
                <p>La foto {{ photoOf(dynamic) }} y, si queréis, las de post-its y borradores. Podéis hacer <strong>varias fotos a la vez</strong> y enviarlas todas juntas.</p>
              </div>
              <template v-if="showQr">
                <PhotoQr :team-id="id" :dynamic-id="dynamic.id" @uploaded="onPhoto" />
                                <div v-if="extras.length" class="extras">
                  <div v-if="extras.length" class="extras__fotos">
                    <button v-for="(p, n) in extras" :key="p.id" type="button" @click="openPhoto(p.url, `${dynamic.title} · foto de más ${n + 1}`)">
                      <img :src="p.url" :alt="`Foto de más ${n + 1}`" />
                    </button>
                  </div>
                </div>
              </template>
            </template>
            <p v-if="saveFailed" class="alerta">No se ha podido guardar la foto. Probad otra vez o avisad al equipo facilitador.</p>
          </div>
      </div>
    </section>

    <!-- Se acabó el tiempo: hay que subir la foto para seguir -->
    <!-- Se acabó el tiempo, o el equipo facilitador ya ha abierto la siguiente: hay que subir la foto para seguir -->
    <div v-if="!finished && !photo && (timeUp || allowed > index)" class="bloqueo" role="dialog" aria-modal="true" aria-labelledby="bloqueo-titulo">
      <div class="bloqueo__caja">
        <span class="kicker">{{ timeUp ? 'Se acabó el tiempo' : '¡Tenemos que avanzar!' }}</span>
        <h2 id="bloqueo-titulo">Subid la foto para continuar</h2>
        <p>Fotografiad {{ dynamic.photo.label }} tal y como está ahora, aunque no esté terminado.</p>
        <PhotoQr :team-id="id" :dynamic-id="dynamic.id" @uploaded="onPhoto" />
      </div>
    </div>

    <!-- Fin de fase: todos a la sala principal hasta que se abra la siguiente -->
    <div v-if="vuelveASala && (waitingNext || salaTarde)" class="bloqueo sala-aviso" :class="{ 'sala-aviso--pausa': pausa }" role="dialog" aria-modal="true" aria-labelledby="sala-titulo">
      <div class="sala-aviso__caja">
        <!-- Si después de esta fase toca la pausa (11:45, metodología v3) -->
        <template v-if="pausa">
          <span class="sala-aviso__icono" aria-hidden="true">☕</span>
          <h2 id="sala-titulo">¡Pausa! Hay que descansar un poco</h2>
          <p>Habéis terminado esta fase. Id a levantar las piernas y a tomaros algo.</p>
          <p class="nota">En {{ pausa.minutes }} minutos exactos nos vemos en la sala principal.</p>
        </template>
        <template v-else>
          <span class="sala-aviso__icono" aria-hidden="true">→</span>
          <h2 id="sala-titulo">¡Volved a la sala principal!</h2>
          <p>Habéis terminado {{ nextOne ? 'esta fase' : 'el trabajo en equipo' }}. Id todos a la sala principal.</p>
        </template>
        <template v-if="salaTarde && nextOne">
          <p class="nota">Los demás equipos ya han empezado «{{ nextOne.title }}». Cuando volváis de la sala principal, pulsad «Seguir».</p>
          <button class="sala-aviso__seguir" type="button" @click="markIntroSeen(id, salaKey)">Ya hemos vuelto: seguir →</button>
        </template>
        <p v-else-if="nextOne" class="nota">Cuando sea el momento, accederéis todos a la siguiente fase desde aquí.</p>
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
          <a v-for="(p, n) in x.photos" :key="p.id" :href="p.url" class="expediente__foto" @click.prevent="openPhoto(p.url, `${x.d.title} · foto ${n + 1}`)">
            <img :src="p.url" :alt="`${x.d.title} · foto ${n + 1}`" />
          </a>
        </div>
      </section>
    </details>

    <HelpButton v-if="!finished" :team-id="id" :dynamic-id="dynamic.id" />
  </main>

  <!-- Avisos a pantalla completa: cambio de pantalla y avisos del panel -->
  <TeamNotices
    v-if="team && setup && verified"
    :team-id="id"
    :dynamic-id="inDynamics ? dynamic.id : undefined"
    :dynamic-title="dynamic.title"
    :dynamic-minutes="dynamic.minutes"
  />
</template>

<style scoped>
.estrecho{max-width:44rem}
.bienvenida{display:grid;gap:1rem;justify-items:start}
.nombres__btn--owner{box-shadow:inset 0 0 0 2px var(--c-innova)}
.campo-nombre{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:1.3rem;color:var(--c-ink);background:var(--c-white);border:2px solid var(--c-paper-line);border-radius:99px;padding:.8em 1.2em}
.campo-nombre:focus{outline:none;border-color:var(--c-innova)}
.nombres{display:flex;flex-wrap:wrap;gap:.6rem}
.nombres__btn{font:inherit;font-size:1.15rem;font-weight:500;color:var(--c-ink);background:var(--c-white);border:0;border-radius:99px;padding:.7em 1.3em;cursor:pointer;transition:background .2s,transform .2s var(--ease-out)}
.nombres__btn:hover,.nombres__btn:focus-visible{background:var(--c-innova);transform:translateY(-2px);outline:none}
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

.reto{background:var(--c-green-light);padding-bottom:5rem;min-height:calc(100dvh - 7.5rem);display:grid;align-content:center}
/* Pantallas de paso (digital owner, reto, antes de empezar): centradas en la pantalla */
.paso{min-height:calc(100dvh - 7.5rem);display:grid;align-content:center}
.reto > .wrap,.paso > .wrap{width:100%;box-sizing:border-box}
.paso .estrecho{display:grid;gap:1rem;justify-items:center;text-align:center;max-width:48rem}
.paso .titular,.reto .titular{font-size:clamp(2rem,3.6vw,3rem);line-height:1.08;letter-spacing:-.035em}
.paso .intro{max-width:38rem;margin:0}
.paso .nombres{justify-content:center}
.paso .bienvenida{justify-items:center;text-align:center;width:100%;box-sizing:border-box}
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
.arranque{display:grid;gap:clamp(1.2rem,3vh,2rem);max-width:66rem;padding-block:clamp(1rem,3vh,2rem)}
.arranque__cab{display:grid;gap:.6rem;justify-items:center;text-align:center}
.arranque__titulo{margin:0;font-size:clamp(1.9rem,3.4vw,2.8rem);font-weight:600;letter-spacing:-.04em;line-height:1.05;color:var(--c-ink)}
.arranque__titulo span{color:var(--c-innova-dark)}
.arranque__intro{margin:0;max-width:44rem;font-size:clamp(1rem,1.3vw,1.12rem);color:var(--c-green-dark)}
.arranque__intro strong{color:var(--c-ink)}
.arranque__pasos{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
@media(max-width:760px){.arranque__pasos{grid-template-columns:1fr}}
.arranque__pasos li{display:grid;gap:.45rem;align-content:start;background:var(--c-white);border-radius:var(--radius-card);padding:1.3rem 1.4rem}
.arranque__num{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--gradient-anio);color:var(--c-white);font-size:1.1rem;font-weight:700;margin-bottom:.2rem}
.arranque__pasos strong{font-size:1.12rem;font-weight:600;letter-spacing:-.02em;color:var(--c-ink);line-height:1.25}
.arranque__pasos p{margin:0;font-size:.95rem;line-height:1.45}
.arranque__pie{display:grid;gap:.8rem;justify-items:center;text-align:center}
.arranque__pie p{margin:0;font-size:.9rem;font-style:italic}
.arranque__boton{justify-self:center;font-size:1.1rem;padding:.9em 2em}
.reto__fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(5rem,1fr));gap:.4rem}
.reto__fotos img{aspect-ratio:3/4;object-fit:cover;border-radius:.6rem;width:100%}
.enlace{justify-self:start;border:0;background:none;padding:0;font:inherit;font-size:.85rem;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}

.app{background:var(--c-green-light);padding-bottom:5rem;min-height:calc(100dvh - 7.5rem)}
.app__cab{position:sticky;top:0;z-index:20}
.app__reloj{order:2}
.app__cab{background:var(--c-white);border-bottom:1px solid var(--c-gris-10)}
.app__cab-in{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:.6rem 1.5rem;padding-block:.6rem}
@media(max-width:900px){.app__cab-in{grid-template-columns:1fr auto}.app__cab-in .pasos{grid-column:1/-1;order:3}}
.owner-linea{font-size:.85rem}
.owner-linea strong{color:var(--c-ink)}
.pasos{list-style:none;margin:0;padding:0;display:flex;gap:.35rem}
.pasos li span{display:grid;place-items:center;width:1.9rem;height:1.9rem;border-radius:50%;font-size:.75rem;font-weight:700;background:var(--c-white);color:var(--c-green-dark);box-shadow:inset 0 0 0 2px var(--c-green-mid)}
.pasos .hecho span{background:var(--c-green-deep);color:var(--c-white);box-shadow:none}
.pasos .actual span{background:var(--c-innova);color:var(--c-ink);box-shadow:0 0 0 3px var(--c-white),0 0 0 5px var(--c-innova)}

.dinamica{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:1.25rem;padding-block:1.25rem;align-items:start}
@media(max-width:960px){.dinamica{grid-template-columns:1fr}.dinamica__der{position:static;max-height:none}}
/* Sin chat: explicación a la izquierda y cronómetro + foto a la derecha */
.dinamica--sin-chat{grid-template-columns:minmax(0,1.6fr) minmax(0,.7fr)}
.dinamica--sin-chat .dinamica__der{max-height:none}
.dinamica--sin-chat .dinamica__izq{grid-template-columns:1fr}
/* Sin chat: cronómetro arriba a todo el ancho; debajo, la explicación y la foto, una al lado de la otra */
.dinamica--sin-chat .reloj{grid-column:1/-1}
.avanzar{grid-column:1/-1;margin:0;padding:.9rem 1.2rem;border-radius:1.2rem;background:var(--c-rubi);color:var(--c-white);font-size:1.05rem}
.avanzar strong{color:var(--c-white)}
@media(max-width:960px){.dinamica--sin-chat .dinamica__izq{grid-template-columns:1fr}}
.dinamica__izq{display:grid;gap:1rem}
.dinamica__der{display:flex;flex-direction:column;gap:1rem;position:sticky;top:6.5rem}
/* El chat ocupa lo que queda de pantalla, con el botón «Subir imágenes» debajo: sin scroll en la columna */
.dinamica__der .dinamica__chat{height:clamp(20rem,calc(100dvh - 17rem),36rem);min-height:0;max-height:none}
.dinamica__titulo{font-size:clamp(1.7rem,2.8vw,2.4rem);font-weight:500;letter-spacing:-.04em;line-height:1.05}
.que{font-size:1.1rem;color:var(--c-ink)}
.qpco{margin:.4rem 0 0;display:grid;border-top:1px solid var(--c-gris-10)}
.qpco > div{display:grid;grid-template-columns:7rem 1fr;gap:.8rem;padding:.5rem 0;border-bottom:1px solid var(--c-gris-10)}
.qpco dt{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--c-innova-dark);padding-top:.2rem}
.qpco dd{margin:0;min-width:0}
.como{margin:0;padding-left:1.1rem;display:grid;gap:.5rem}
.que :deep(strong),.qpco dd :deep(strong){color:inherit;font-weight:600}
@media(max-width:520px){.qpco > div{grid-template-columns:1fr;gap:.15rem}}


.foto__cab{display:grid;gap:.3rem;justify-items:start}
/* Antes de subir: solo el botón, sin tarjeta */
.foto--boton{background:none !important;box-shadow:none !important;padding:0 !important}
.foto__intro{display:grid;gap:.35rem;justify-items:start}
.foto__icono{display:grid;place-items:center;width:3rem;height:3rem;border-radius:50%;background:var(--c-green-light);font-size:1.4rem;margin-bottom:.3rem}
.foto__intro strong{font-size:1.3rem;font-weight:600;letter-spacing:-.02em;color:var(--c-ink);line-height:1.2}
.foto__intro p{margin:0;font-size:.95rem}
.foto__subir{justify-self:stretch;justify-content:center;font-size:1.15rem;padding:1em 1.2em}
.foto__cab p{margin:.2rem 0 0;font-size:.92rem}
@media(max-width:700px){.foto__cab{grid-template-columns:1fr}}
.explica{padding:clamp(1.2rem,2.2vw,1.7rem)}
.foto{padding:1.1rem 1.4rem}
.dinamica__chat + .foto{background:color-mix(in srgb,var(--c-white) 70%,transparent);box-shadow:inset 0 0 0 1px var(--c-green-mid)}
.foto img{border-radius:1rem;max-height:18rem;object-fit:cover;width:100%}
.extras{display:grid;gap:.6rem;border-top:1px solid var(--c-gris-10);padding-top:.8rem}
.extras__fotos{display:flex;flex-wrap:wrap;gap:.4rem}
.extras__fotos button{border:0;padding:0;background:none;cursor:pointer}
.extras__fotos img{width:4.5rem;height:4.5rem;object-fit:cover;border-radius:.6rem;max-height:none}
.pendiente{display:flex;gap:.6rem;align-items:flex-start;margin:0;background:var(--c-white);border-radius:1rem;padding:.9rem 1.1rem;color:var(--c-ink);box-shadow:inset 0 0 0 2px var(--c-innova)}
.pendiente .punto{flex:none;margin-top:.45rem;width:.7rem;height:.7rem;border-radius:50%;background:var(--c-innova);animation:latir 1.2s ease-in-out infinite}
.esperando{display:flex;gap:.6rem;align-items:flex-start;background:var(--c-green-light);border-radius:1rem;padding:.8rem 1rem;color:var(--c-ink)}
.esperando .punto{flex:none;margin-top:.45rem;width:.7rem;height:.7rem;border-radius:50%;background:var(--c-innova);animation:latir 1.2s ease-in-out infinite}
@keyframes latir{50%{opacity:.3;transform:scale(.8)}}

.bloqueo{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:16px;overflow-y:auto;overscroll-behavior:contain;background:color-mix(in srgb,var(--c-green-deep) 80%,transparent);backdrop-filter:blur(4px)}
.bloqueo__caja{background:var(--c-white);border-radius:var(--radius-card);padding:clamp(1.5rem,4vw,2.5rem);max-width:40rem;display:grid;gap:.8rem;max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;box-sizing:border-box}
.bloqueo__caja h2{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:500;letter-spacing:-.03em;line-height:1.1}
.final-votacion{padding-block:1.5rem}
.intro-din{min-height:60vh;display:grid;justify-items:center;align-content:center;gap:1rem;text-align:center;padding-block:3rem}
.intro-din__icono{display:grid;place-items:center;width:6rem;height:6rem;border-radius:50%;background:var(--c-white);color:var(--c-innova-dark);font-size:3rem;box-shadow:0 0 0 6px var(--c-green-mid);animation:latido 2s ease-in-out infinite}
@keyframes latido{50%{transform:scale(1.06)}}
.intro-din__titulo{font-size:clamp(2.2rem,6vw,4rem);font-weight:500;letter-spacing:-.04em;line-height:1}
.intro-din__texto{font-size:clamp(1.2rem,2.4vw,1.7rem);color:var(--c-ink);max-width:30ch}
.intro-din__boton{justify-self:center;font-size:1.1rem;padding:.9em 1.8em}
.sala-aviso{background:color-mix(in srgb,var(--c-rubi) 88%,transparent)}
.sala-aviso--pausa{background:color-mix(in srgb,var(--c-green-deep) 92%,transparent)}
.sala-aviso__caja{display:grid;justify-items:center;gap:.8rem;text-align:center;color:var(--c-white);max-width:40rem}
.sala-aviso__icono{display:grid;place-items:center;width:5rem;height:5rem;border-radius:50%;background:var(--c-white);color:var(--c-rubi);font-size:2.6rem;font-weight:700;animation:empuja 1.4s ease-in-out infinite}
@keyframes empuja{50%{transform:translateX(10px)}}
.sala-aviso h2{color:var(--c-white);font-size:clamp(2.2rem,6vw,4rem);font-weight:600;letter-spacing:-.04em;line-height:1}
.sala-aviso p{font-size:1.2rem}
.sala-aviso .nota{font-size:.95rem;opacity:.9}
.sala-aviso__seguir{margin-top:.6rem;border:0;border-radius:99px;padding:.8em 1.6em;background:var(--c-white);color:var(--c-ink);font:inherit;font-weight:700;font-size:1.05rem;cursor:pointer}
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
