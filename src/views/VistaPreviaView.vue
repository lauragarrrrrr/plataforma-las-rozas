<script setup lang="ts">
// /vista-previa · Para el equipo facilitador: recorrer todas las pantallas que verán
// los equipos, una a una, sin cronómetros, sin fotos y SIN GUARDAR NADA.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { backToRoomAfter, PREMORTEM, TEAM_DYNAMICS, photoOf, type TeamDynamic } from '../data/dynamics'
import { formatClock } from '../composables/useNow'

/** Pasos: el reto del digital owner y las 8 dinámicas */
const pasos: { tipo: 'reto' | 'dinamica'; d: TeamDynamic }[] = [
  { tipo: 'reto', d: PREMORTEM },
  ...TEAM_DYNAMICS.map((d) => ({ tipo: 'dinamica' as const, d })),
]
const i = ref(0)
const paso = computed(() => pasos[i.value])
const d = computed(() => paso.value.d)

function ir(n: number) {
  if (n >= 0 && n < pasos.length) i.value = n
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') ir(i.value + 1)
  if (e.key === 'ArrowLeft') ir(i.value - 1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

/** Cómo se vería el chat: la bienvenida, la presentación de la dinámica y sus preguntas */
const chat = computed(() => {
  const msgs: string[] = []
  if (d.value.research) msgs.push(`Unidad de Investigación · ${d.value.title}. No os daré soluciones: os haré preguntas para que afinéis.`)
  else msgs.push(`Seguimos con «${d.value.title}».`)
  return [...msgs, ...d.value.challenges]
})
</script>

<template>
  <main class="vista">
    <!-- Barra de la vista previa -->
    <div class="barra">
      <div class="wrap barra__in">
        <span class="kicker">Vista previa para el equipo facilitador · no se guarda nada</span>
        <div class="barra__nav">
          <button class="nav" type="button" :disabled="i === 0" @click="ir(i - 1)">‹ Anterior</button>
          <ol class="pasos">
            <li v-for="(p, n) in pasos" :key="p.d.id">
              <button type="button" :class="{ actual: n === i, hecho: n < i }" :title="p.d.title" @click="ir(n)">{{ n === 0 ? '★' : n }}</button>
            </li>
          </ol>
          <button class="nav" type="button" :disabled="i === pasos.length - 1" @click="ir(i + 1)">Siguiente ›</button>
          <RouterLink class="salir" to="/facilitacion">Salir</RouterLink>
        </div>
      </div>
    </div>

    <!-- Reto del digital owner -->
    <section v-if="paso.tipo === 'reto'" class="wrap pantalla">
      <span class="kicker">Equipo A · Primer reto</span>
      <h1 class="titular">¡Lucía, digital owner!</h1>
      <p class="lema">Te ponemos un reto:</p>
      <p class="intro">Sube las fichas individuales de <strong>«{{ PREMORTEM.title }}»</strong> que ha rellenado cada persona de tu equipo. Una foto por ficha, una detrás de otra.</p>
      <div class="grid2">
        <div class="card"><span class="kicker">Con el móvil</span><div class="qr-falso">QR</div><p>Las fichas aparecen aquí según llegan.</p></div>
        <div class="card"><span class="kicker">Fichas subidas</span><strong class="cifra">0 <small>de 5</small></strong><button class="boton" type="button" disabled>¡Reto superado! Seguir →</button></div>
      </div>
    </section>

    <!-- Dinámica -->
    <section v-else class="wrap dinamica" :class="{ 'dinamica--sin-chat': d.noChat }">
      <div class="izq">
        <div class="card">
          <span class="kicker">Dinámica {{ i }} de {{ TEAM_DYNAMICS.length }} · {{ d.minutes }} min</span>
          <h1 class="titulo">{{ d.title }}</h1>
          <p class="que">{{ d.what }}</p>
          <dl class="qpco">
            <div><dt>Para qué</dt><dd>{{ d.why }}</dd></div>
            <div><dt>Cómo</dt><dd><ol class="como"><li v-for="h in d.how" :key="h">{{ h }}</li></ol></dd></div>
            <div><dt>Qué obtenemos</dt><dd>{{ d.output }}</dd></div>
          </dl>
        </div>
        <div class="card reloj">
          <span class="kicker">Tiempo</span>
          <strong class="reloj__cifra">{{ formatClock(d.minutes * 60_000) }}</strong>
        </div>
        <div class="card">
          <span class="kicker">Al terminar</span>
          <p>Subid una foto {{ photoOf(d) }}. Sin la foto no podéis pasar a la siguiente dinámica.</p>
          <p v-if="backToRoomAfter(d)" class="aviso-sala">Después de la foto les sale: <strong>«¡Volved a la sala principal!»</strong></p>
        </div>
      </div>

      <section v-if="!d.noChat" class="card chat">
        <span class="kicker">{{ d.research ? 'Unidad de Investigación' : 'Os reta' }}</span>
        <small>Así preguntará el chat, una pregunta cada vez, según respondan.</small>
        <ol class="burbujas">
          <li v-for="(m, n) in chat" :key="n">{{ m }}</li>
        </ol>
      </section>
    </section>
  </main>
</template>

<style scoped>
.vista{background:var(--c-green-light);min-height:80vh;padding-bottom:3rem}
.barra{background:var(--gradient-dark);color:var(--c-white);position:sticky;top:0;z-index:20}
.barra__in{display:grid;gap:.5rem;padding-block:.8rem}
.barra .kicker{color:var(--c-green-mid)}
.barra__nav{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.nav,.salir{border:0;border-radius:99px;padding:.45em 1em;background:color-mix(in srgb,var(--c-white) 15%,transparent);color:var(--c-white);font:inherit;font-size:.85rem;cursor:pointer;text-decoration:none}
.nav:disabled{opacity:.35;cursor:default}
.salir{margin-left:auto}
.pasos{list-style:none;margin:0;padding:0;display:flex;gap:.3rem;flex-wrap:wrap}
.pasos button{width:2rem;height:2rem;border-radius:50%;border:0;font:inherit;font-size:.8rem;font-weight:700;cursor:pointer;background:var(--c-white);color:var(--c-green-dark)}
.pasos .hecho{background:var(--c-green-mid);color:var(--c-green-deep)}
.pasos .actual{background:var(--c-innova);color:var(--c-ink);box-shadow:0 0 0 3px var(--c-white)}

.pantalla{display:grid;gap:1rem;padding-block:2rem}
.lema{font-size:clamp(1.3rem,2.6vw,2rem);font-weight:500;color:var(--c-innova-dark)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
@media(max-width:800px){.grid2{grid-template-columns:1fr}}
.qr-falso{width:9rem;height:9rem;border:3px dashed var(--c-green-mid);border-radius:1rem;display:grid;place-items:center;font-weight:700;color:var(--c-green-mid)}
.cifra{font-size:3rem;font-weight:600;line-height:1;color:var(--c-ink)}
.cifra small{font-size:1.2rem;color:var(--c-green-dark)}
.boton:disabled{opacity:.45}

.dinamica{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:1.25rem;padding-block:1.5rem;align-items:start}
.dinamica--sin-chat{grid-template-columns:1fr}
@media(max-width:960px){.dinamica{grid-template-columns:1fr}}
.izq{display:grid;gap:1.25rem}
.titulo{font-size:clamp(1.8rem,3.4vw,2.8rem);font-weight:500;letter-spacing:-.04em;line-height:1.05}
.que{font-size:1.1rem;color:var(--c-ink)}
.qpco{margin:.4rem 0 0;display:grid;border-top:1px solid var(--c-gris-10)}
.qpco > div{display:grid;grid-template-columns:7.5rem 1fr;gap:.8rem;padding:.6rem 0;border-bottom:1px solid var(--c-gris-10)}
.qpco dt{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--c-innova-dark);padding-top:.2rem}
.qpco dd{margin:0}
.como{margin:0;padding-left:1.1rem;display:grid;gap:.25rem}
.reloj__cifra{font-size:3rem;font-weight:600;color:var(--c-ink);font-variant-numeric:tabular-nums;line-height:1}
.chat small{font-size:.8rem}
.aviso-sala{background:var(--c-rubi);color:var(--c-white);border-radius:1rem;padding:.7rem 1rem}
.aviso-sala strong{color:var(--c-white)}
.burbujas{list-style:none;margin:.4rem 0 0;padding:0;display:grid;gap:.5rem}
.burbujas li{justify-self:start;max-width:90%;background:var(--c-green-light);color:var(--c-ink);border-radius:1.1rem 1.1rem 1.1rem .3rem;padding:.7rem 1rem;font-size:.92rem}
</style>
