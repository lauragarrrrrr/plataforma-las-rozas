<script setup lang="ts">
// /equipo/:id · App del equipo (hito 1: lectura de datos; fases y formularios en el hito 2)
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { PHASES } from '../data/config'
import { useStore } from '../data/store'
import PhaseStateTag from '../components/PhaseStateTag.vue'
import DemoNotice from '../components/DemoNotice.vue'

const props = defineProps<{ id: string }>()
const store = useStore()

const team = computed(() => store.team(props.id))
const headline = computed(() => store.headline(props.id))
const dossier = computed(() => store.dossier(props.id))
const initiative = computed(() => store.initiative(props.id))
const signals = computed(() => store.signals(props.id))
</script>

<template>
  <main v-if="team" class="section s-claro">
    <div class="wrap">
      <div class="cabeza">
        <span class="kicker">App del equipo</span>
        <h1 class="titular">{{ team.name }}</h1>
        <p v-if="store.db.event.areasRevealed" class="ambito">{{ store.areaName(team.area) }}</p>
        <p v-else class="ambito ambito--oculto">Vuestro ámbito se revelará durante la jornada</p>
        <DemoNotice v-if="store.isDemo(team.id)" />
      </div>

      <ol class="fases">
        <li v-for="f in PHASES" :key="f.id" class="card fase">
          <span class="fase__num">{{ f.number }}</span>
          <h3>{{ f.name }}</h3>
          <PhaseStateTag :state="team.phases[f.id]" />
        </li>
      </ol>

      <section class="card expediente">
        <span class="kicker">Mi expediente</span>
        <p v-if="!headline && !dossier && !initiative" class="vacio">Todavía no habéis registrado nada. Empezaréis con vuestro titular para Las Rozas Times 2040.</p>
        <dl v-else>
          <template v-if="headline"><dt>Titular</dt><dd class="periodico">«{{ headline.headline }}»</dd></template>
          <template v-if="signals.length"><dt>Señales de cambio</dt><dd>{{ signals.length }} registradas</dd></template>
          <template v-if="dossier"><dt>Reto</dt><dd>{{ dossier.challenge }}</dd></template>
          <template v-if="initiative"><dt>Iniciativa</dt><dd>{{ initiative.name }}</dd></template>
        </dl>
      </section>
    </div>
  </main>

  <main v-else class="section">
    <div class="wrap">
      <p class="alerta">No existe el equipo «{{ id }}».</p>
      <RouterLink class="boton" to="/">Volver a la portada</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.cabeza{display:grid;gap:.8rem}
.ambito{font-size:clamp(1.1rem,2vw,1.4rem);font-weight:500;color:var(--c-ink)}
.ambito--oculto{color:var(--c-green-dark);font-weight:400;font-style:italic}
.fases{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}
@media(max-width:860px){.fases{grid-template-columns:1fr 1fr}}
.fase__num{font-size:2rem;font-weight:700;letter-spacing:-.06em;line-height:1;color:var(--c-innova-dark)}
.fase h3{font-size:1.1rem}
.expediente dl{margin:0;display:grid;grid-template-columns:minmax(0,9rem) 1fr;gap:.6rem 1rem}
.expediente dt{font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--c-innova-dark);padding-top:.25rem}
.expediente dd{margin:0;color:var(--c-ink);min-width:0}
.periodico{font-family:var(--font-paper);font-size:1.15rem}
.vacio{font-style:italic}
@media(max-width:520px){.expediente dl{grid-template-columns:1fr;gap:.1rem}.expediente dd{margin-bottom:.6rem}}
</style>
