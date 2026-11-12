<script setup lang="ts">
// Chat que les reta. Es UNO por equipo y sigue de una dinámica a la siguiente.
// Hoy pregunta con las preguntas de la metodología, una cada vez.
// Cuando haya IA conectada, este mismo chat responderá a lo que escriban.
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { TEAM_DYNAMICS, type TeamDynamic } from '../data/dynamics'
import { addChat, useStore } from '../data/store'

const props = defineProps<{ teamId: string; dynamic: TeamDynamic }>()
const store = useStore()

const messages = computed(() => store.chat(props.teamId))
const inThisDynamic = computed(() => messages.value.filter((m) => m.dynamicId === props.dynamic.id))
const text = ref('')
const list = ref<HTMLElement>()
const typing = ref(false)

/** El equipo pide ayuda o dice que no entiende (en vez de responder) */
function isStuck(text: string) {
  return /ayud|no entiendo|no (lo )?s[eé]\b|perdid|qu[eé] (tengo|tenemos|hay) que hacer|no me sirve/i.test(text)
}

function titleOf(dynamicId: string) {
  return TEAM_DYNAMICS.find((d) => d.id === dynamicId)?.title ?? ''
}

/** Al entrar en una dinámica, el chat abre con la primera pregunta */
function openDynamic() {
  if (inThisDynamic.value.length) return
  const first = props.dynamic.challenges[0]
  const isFirst = !messages.value.length
  if (isFirst) {
    addChat(props.teamId, props.dynamic.id, 'coach',
      'Hola, equipo. Estaré con vosotros el resto de la jornada para retaros con preguntas, una cada vez. El trabajo lo hacéis vosotros, en el papel.')
  }
  const intro = props.dynamic.research
    ? `Unidad de Investigación · ${props.dynamic.title}. No os daré soluciones: os haré preguntas para que afinéis.`
    : `Seguimos con «${props.dynamic.title}».`
  addChat(props.teamId, props.dynamic.id, 'coach', intro)
  if (first) addChat(props.teamId, props.dynamic.id, 'coach', first)
}

function send() {
  const value = text.value.trim()
  if (!value) return
  addChat(props.teamId, props.dynamic.id, 'team', value)
  text.value = ''
  // Las preguntas avanzan solo con respuestas, no con peticiones de ayuda
  const answered = inThisDynamic.value.filter((m) => m.from === 'team' && !isStuck(m.text)).length
  const next = props.dynamic.challenges[answered]
  // Sin IA conectada el chat no entiende lo que escriben: si piden ayuda, se lo decimos claro
  const stuck = isStuck(value)
  const reply = stuck
    ? 'Si estáis atascados, pulsad «Pedir ayuda» (abajo a la derecha) y vendrá alguien del equipo facilitador. Mientras, releed la explicación de la izquierda.'
    : next ?? 'Apuntado. Seguid trabajando en el papel y, cuando acabe el tiempo, subid la foto. Si os atascáis, pulsad «Pedir ayuda».'
  typing.value = true
  window.setTimeout(() => {
    typing.value = false
    addChat(props.teamId, props.dynamic.id, 'coach', reply)
  }, 700)
}

async function scrollToEnd() {
  await nextTick()
  list.value?.scrollTo({ top: list.value.scrollHeight, behavior: 'smooth' })
}

onMounted(() => { openDynamic(); scrollToEnd() })
watch(() => props.dynamic.id, openDynamic)
watch(() => messages.value.length, scrollToEnd)
</script>

<template>
  <section class="chat card" aria-label="Chat que os reta">
    <header class="chat__cab">
      <span class="kicker">{{ dynamic.research ? 'Unidad de Investigación' : 'Os reta' }}</span>
      <small>Preguntas para pensar mejor. No hace el trabajo por vosotros.</small>
    </header>
    <ol ref="list" class="chat__lista">
      <template v-for="(m, i) in messages" :key="m.id">
        <li v-if="i === 0 || messages[i - 1].dynamicId !== m.dynamicId" class="chat__separador">
          {{ titleOf(m.dynamicId) }}
        </li>
        <li class="burbuja" :class="m.from === 'team' ? 'burbuja--equipo' : 'burbuja--reto'">{{ m.text }}</li>
      </template>
      <li v-if="typing" class="burbuja burbuja--reto burbuja--escribe" aria-label="Escribiendo">
        <i></i><i></i><i></i>
      </li>
    </ol>
    <form class="chat__form" @submit.prevent="send">
      <input v-model="text" type="text" placeholder="Escribid vuestra respuesta…" aria-label="Vuestra respuesta" />
      <button class="boton" type="submit">Enviar</button>
    </form>
  </section>
</template>

<style scoped>
.chat{grid-template-rows:auto 1fr auto;gap:.8rem;min-height:26rem;max-height:34rem;background:var(--c-white)}
.chat__cab{display:grid;gap:.2rem}
.chat__cab small{font-size:.8rem}
.chat__lista{list-style:none;margin:0;padding:0 .2rem;display:flex;flex-direction:column;gap:.5rem;overflow-y:auto;min-height:0}
.chat__separador{align-self:center;font-size:.68rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--c-innova-dark);margin:.6rem 0 .2rem}
.burbuja{max-width:85%;padding:.7rem 1rem;font-size:.92rem;line-height:1.45;white-space:pre-wrap}
.burbuja--reto{align-self:flex-start;background:var(--c-green-light);color:var(--c-ink);border-radius:1.1rem 1.1rem 1.1rem .3rem}
.burbuja--equipo{align-self:flex-end;background:var(--c-innova-dark);color:var(--c-white);border-radius:1.1rem 1.1rem .3rem 1.1rem}
.burbuja--escribe{display:flex;gap:.3rem}
.burbuja--escribe i{width:.45rem;height:.45rem;border-radius:50%;background:var(--c-innova-dark);opacity:.4;animation:punto 1s infinite ease-in-out}
.burbuja--escribe i:nth-child(2){animation-delay:.15s}.burbuja--escribe i:nth-child(3){animation-delay:.3s}
@keyframes punto{30%{opacity:1;transform:translateY(-3px)}}
.chat__form{display:flex;gap:.5rem}
.chat__form input{flex:1;min-width:0;font:inherit;font-size:.92rem;padding:.65rem .9rem;border:1.5px solid var(--c-green-mid);border-radius:99px;color:var(--c-ink)}
.chat__form input:focus-visible{outline:3px solid var(--c-innova-dark);outline-offset:1px}
</style>
