<script setup lang="ts">
// /participa · Entrada de los participantes (llegan por QR desde el móvil)
// «¿Quién eres?» → escriben su nombre, tocan el suyo → su ámbito (lo primero) y su equipo y mesa.
// Todo se descubre a la vez al escanear, como en la metodología v3 («Ámbitos y equipos»).
// Solo se ven los nombres que coinciden con lo que se escribe, nunca la lista entera.
// Después: «¿Ya estáis todos juntos? ¿Quién será vuestro digital owner?». Lo elige
// cualquiera del equipo desde su móvil y lo ven todos. El digital owner entra desde el
// ordenador con el enlace que le envía por correo el equipo facilitador (/equipo/:id).
import { computed, ref, watch } from 'vue'
import { AREA_QUESTIONS, AREAS } from '../data/config'
import { ROSTER } from '../data/roster'
import { forgetOnDevice, recallOnDevice, rememberOnDevice, saveSetup, useStore } from '../data/store'

const store = useStore()

interface Person { name: string; teamId: string }
const people: Person[] = Object.entries(ROSTER).flatMap(([teamId, names]) => names.map((name) => ({ name, teamId })))

/** Sin tildes ni mayúsculas, para que «lucia» encuentre a «Lucía» */
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const query = ref('')
const matches = computed(() => {
  const q = plain(query.value)
  if (q.length < 2) return []
  return people.filter((p) => plain(p.name).split(/\s+/).some((w) => w.startsWith(q)) || plain(p.name).startsWith(q)).slice(0, 8)
})

// Se recuerda en este móvil (si vuelven a abrir el QR, ven su equipo directamente),
// pero se olvida cuando el equipo facilitador deja todo en blanco o restaura los datos.
const KEY = 'lr2040-participante'
const me = ref<Person | null>(recallOnDevice<Person>(KEY))
watch(() => store.db.event.jornada, () => { me.value = recallOnDevice<Person>(KEY) })
function choose(p: Person) {
  me.value = p
  rememberOnDevice(KEY, p)
}
function reset() {
  me.value = null
  query.value = ''
  forgetOnDevice(KEY)
}

const myTeam = computed(() => (me.value ? store.db.teams.find((t) => t.id === me.value!.teamId) : undefined))
const myArea = computed(() => (myTeam.value ? AREAS[myTeam.value.area] : ''))
const myQuestion = computed(() => (myTeam.value ? AREA_QUESTIONS[myTeam.value.area] : ''))
const firstName = computed(() => me.value?.name.split(' ')[0] ?? '')

// --- Digital owner del equipo ---
const setup = computed(() => (me.value ? store.setup(me.value.teamId) : undefined))
const members = computed(() => (me.value ? setup.value?.members ?? ROSTER[me.value.teamId] ?? [] : []))
const owner = computed(() => setup.value?.digitalOwner ?? '')
const ownerFirst = computed(() => owner.value.split(' ')[0])
const soyOwner = computed(() => !!me.value && owner.value === me.value.name)
const changingOwner = ref(false)
/** Han pulsado «¡Ya estamos todos juntos!»: ahora eligen digital owner */
const juntos = ref(false)
const teamLink = computed(() => (me.value ? `${location.host}/equipo/${me.value.teamId}` : ''))
const teamUrl = computed(() => (me.value ? `${location.origin}/equipo/${me.value.teamId}` : ''))
function chooseOwner(name: string) {
  if (!me.value) return
  saveSetup(me.value.teamId, [...members.value], name)
  changingOwner.value = false
}
</script>

<template>
  <main>
    <section class="hero">
      <div class="wrap hero__in">
        <span class="kicker">Participantes</span>
        <h1><span class="nombre">Las Rozas</span> <span class="anio">2040</span></h1>
        <p class="lema">El futuro no se espera. Se construye juntos.</p>
        <p class="intro">Una jornada para escuchar a quienes forman Las Rozas, <strong>imaginar la ciudad de 2040</strong> y convertir sus necesidades en ideas concretas. Primero se conversa; después se contrasta; finalmente, el equipo decide qué registrar.</p>
      </div>
    </section>

    <section class="section s-claro">
      <div class="wrap">
        <!-- Ya sabe quién es: su equipo -->
        <div v-if="me" class="resultado">
          <span class="kicker">¡Hola, {{ firstName }}!</span>

          <!-- Lo primero, el ámbito -->
          <div class="resultado__ambito">
            <span class="kicker">Vuestro ámbito</span>
            <strong>{{ myArea }}</strong>
            <p v-if="myQuestion">{{ myQuestion }}</p>
          </div>

          <!-- Después, el equipo y la mesa -->
          <div class="resultado__equipo">
            <span class="resultado__letra">{{ me.teamId }}</span>
            <p class="resultado__mesa">Sois el <strong>equipo {{ me.teamId }}</strong>.<br />Buscad la mesa con la letra <strong>{{ me.teamId }}</strong>.</p>
          </div>

          <!-- ¿Quién será vuestro digital owner? -->
          <div class="owner">
            <template v-if="!owner && !juntos">
              <p class="owner__nota">Cuando estéis todas las personas del equipo en la mesa:</p>
              <button class="boton owner__juntos" type="button" @click="juntos = true">¡Ya estamos todos juntos!</button>
            </template>
            <template v-else-if="!owner || changingOwner">
              <h2 class="owner__titulo">¿Quién será vuestro digital owner?</h2>
              <p class="owner__nota">La persona que llevará el ordenador y centralizará toda la experiencia digital del equipo. Elegidla entre todos.</p>
              <div class="owner__nombres">
                <button v-for="m in members" :key="m" type="button" class="owner__nombre" :class="{ 'owner__nombre--actual': m === owner }" @click="chooseOwner(m)">{{ m }}</button>
              </div>
              <button v-if="!owner" class="otra" type="button" @click="juntos = false">Todavía no</button>
              <button v-if="changingOwner" class="otra" type="button" @click="changingOwner = false">Cancelar</button>
            </template>
            <template v-else>
              <span class="kicker">Vuestro digital owner</span>
              <p class="owner__elegido">{{ owner }}</p>
              <p v-if="soyOwner" class="owner__pasos">
                <strong>¡Eres tú!</strong> Abre el correo que os ha enviado el equipo facilitador y entra en el enlace <strong>desde el ordenador de vuestra mesa</strong>.
              </p>
              <p v-else class="owner__pasos">
                <strong>{{ ownerFirst }}</strong> abrirá el correo del equipo facilitador y entrará en el enlace desde el ordenador de vuestra mesa.
              </p>
              <p class="owner__link">¿No llega el correo? Abrid este enlace en el ordenador:<a :href="teamUrl" target="_blank" rel="noopener">{{ teamLink }}</a></p>
              <button class="otra" type="button" @click="changingOwner = true">Cambiar de digital owner</button>
            </template>
          </div>

          <button class="otra" type="button" @click="reset">No soy {{ firstName }}</button>
        </div>

        <!-- Todavía no: «¿Quién eres?» -->
        <div v-else class="buscar">
          <h2 class="titular">¿Quién eres?</h2>
          <label class="buscar__label" for="nombre">Escribe tu nombre y toca el tuyo.</label>
          <input
            id="nombre"
            v-model="query"
            class="buscar__campo"
            type="text"
            autocomplete="off"
            autocapitalize="words"
            enterkeyhint="search"
            placeholder="Tu nombre"
          />
          <ul v-if="matches.length" class="buscar__lista">
            <li v-for="p in matches" :key="p.teamId + p.name">
              <button type="button" class="buscar__nombre" @click="choose(p)">{{ p.name }}</button>
            </li>
          </ul>
          <p v-else-if="query.trim().length >= 2" class="buscar__nada">
            No te encontramos. Prueba solo con tu nombre o pregunta al equipo facilitador.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero__in{display:grid;gap:1rem;padding-block:clamp(2.5rem,6vw,4.5rem)}
h1{font-size:clamp(3rem,10vw,8rem);line-height:.92}
.nombre{font-weight:300;letter-spacing:-.06em}
.anio{font-weight:700;letter-spacing:-.05em;background:var(--gradient-anio);-webkit-background-clip:text;background-clip:text;color:transparent}
.lema{font-size:clamp(1.2rem,2.2vw,1.7rem);color:var(--c-ink);letter-spacing:-.02em}

/* ¿Quién eres? */
.buscar{display:grid;gap:1rem;max-width:34rem}
.buscar__label{font-size:1.05rem}
.buscar__campo{font:inherit;font-size:1.2rem;color:var(--c-ink);background:var(--c-white);border:2px solid var(--c-paper-line);border-radius:99px;padding:.8em 1.2em;width:100%;box-sizing:border-box}
.buscar__campo:focus{outline:none;border-color:var(--c-innova)}
.buscar__lista{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
.buscar__nombre{width:100%;text-align:left;font:inherit;font-size:1.1rem;font-weight:500;color:var(--c-ink);background:var(--c-white);border:0;border-radius:1.2rem;padding:.9em 1.2em;cursor:pointer;transition:background .2s,transform .2s var(--ease-out)}
.buscar__nombre:hover,.buscar__nombre:focus-visible{background:var(--c-innova);transform:translateY(-2px);outline:none}
.buscar__nada{font-size:.95rem}

/* Resultado: tu equipo */
.resultado{display:grid;justify-items:center;text-align:center;gap:.6rem;background:var(--c-white);border-radius:var(--radius-card);padding:clamp(1.8rem,5vw,3rem) 1.5rem;max-width:34rem;width:100%;box-sizing:border-box;justify-self:center}
.resultado__equipo{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:1rem;width:100%;box-sizing:border-box;text-align:left}
.resultado__letra{display:grid;place-items:center;width:4.5rem;height:4.5rem;border-radius:50%;background:var(--gradient-anio);color:var(--c-white);font-size:2.6rem;font-weight:700;line-height:1}
.resultado__mesa{font-size:1.05rem;margin:0;color:var(--c-ink)}
.resultado__ambito{display:grid;gap:.4rem;width:100%;box-sizing:border-box;margin-top:.4rem;padding:1.4rem 1.3rem;border-radius:1.2rem;background:var(--gradient-dark);color:var(--c-white)}
.resultado__ambito .kicker{color:var(--c-green-mid)}
.resultado__ambito strong{font-size:clamp(1.8rem,7vw,2.4rem);font-weight:600;letter-spacing:-.03em;line-height:1.1}
.resultado__ambito p{margin:0;font-size:.95rem;color:var(--c-green-light)}
.otra{margin-top:.6rem;font:inherit;font-size:.85rem;color:var(--c-green-dark);background:none;border:0;text-decoration:underline;cursor:pointer}

/* Digital owner */
.owner{display:grid;gap:.6rem;justify-items:center;width:100%;box-sizing:border-box;margin-top:.8rem;padding:1.2rem;border-radius:1.2rem;border:2px dashed var(--c-green-mid)}
.owner__titulo{margin:0;font-size:1.35rem;font-weight:600;letter-spacing:-.02em;color:var(--c-ink);line-height:1.2}
.owner__nota{margin:0;font-size:.9rem}
.owner__nombres{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin-top:.3rem}
.owner__nombre{font:inherit;font-weight:500;color:var(--c-ink);background:var(--c-green-light);border:0;border-radius:99px;padding:.6em 1.1em;cursor:pointer;transition:background .2s,transform .2s var(--ease-out)}
.owner__nombre:hover,.owner__nombre:focus-visible{background:var(--c-innova);transform:translateY(-2px);outline:none}
.owner__nombre--actual{box-shadow:inset 0 0 0 2px var(--c-innova)}
.owner__elegido{margin:0;font-size:1.6rem;font-weight:600;color:var(--c-ink);letter-spacing:-.02em}
.owner__pasos{margin:0;font-size:1rem;color:var(--c-ink)}
.owner__link{margin:0;font-size:.85rem}
.owner__link a{display:block;word-break:break-all;font-weight:600;color:var(--c-innova-dark)}
.owner__juntos{font-size:1.1rem}
</style>
