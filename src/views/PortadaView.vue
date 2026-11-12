<script setup lang="ts">
// Portada «/»: presenta la jornada y da acceso a cada pantalla.
// Sin datos sensibles: solo los números de equipo, sin nada de lo que registran.
import { RouterLink } from 'vue-router'
import { PHASES } from '../data/config'
import { useStore } from '../data/store'

const store = useStore()

interface Pantalla {
  ruta: string
  nombre: string
  quien: string
  descripcion: string
}

const pantallas: Pantalla[] = [
  { ruta: '/votar', nombre: 'Votación', quien: 'Móvil', descripcion: 'Con vuestro código, elegid las tres iniciativas que más os convencen.' },
  { ruta: '/sala', nombre: 'Pantalla de sala', quien: 'Proyector', descripcion: 'Fase actual, cronómetro, alertas, speed pitch y resultados.' },
  { ruta: '/panel', nombre: 'Panel', quien: 'Equipo facilitador', descripcion: 'Control de la jornada y cuadro de mando.' },
]
</script>

<template>
  <main>
    <section class="hero">
      <div class="wrap hero__in">
        <span class="hero__tipo">Plataforma de la jornada</span>
        <h1><span class="hero__nombre">Las Rozas</span><span class="hero__anio">2040</span></h1>
        <div class="hero__info">
          <p class="hero__lema">El futuro no se espera. Se construye juntos.</p>
          <div class="hero__der">
            <p>Una experiencia colaborativa para escuchar a quienes forman Las Rozas, <strong>imaginar la ciudad de 2040</strong> y transformar sus necesidades en oportunidades concretas de innovación.</p>
            <ul class="chips">
              <li>Sábado 21/11/2026</li>
              <li>De 9:30 a 14:30</li>
              <li>60 personas · 12 equipos</li>
              <li>6 ámbitos</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section s-claro">
      <div class="wrap">
        <div class="cabeza">
          <span class="kicker">Accesos</span>
          <h2 class="titular">¿Desde dónde entras?</h2>
          <p class="intro">Primero se conversa; después se contrasta; finalmente el equipo decide qué registrar. Las pantallas solo acompañan.</p>
        </div>
        <div class="card equipos">
          <span class="kicker">Ordenador del equipo</span>
          <h3>App del equipo</h3>
          <p>Vuestro espacio de trabajo, fase a fase. Elegid vuestro número de equipo.</p>
          <ul class="equipos__lista">
            <li v-for="t in store.db.teams" :key="t.id">
              <RouterLink class="equipo" :to="`/equipo/${t.id}`" :aria-label="t.name">{{ t.id }}</RouterLink>
            </li>
          </ul>
          <p class="nota">Para subir fotos desde el móvil, usad el QR de la app de vuestro equipo.</p>
        </div>
        <ul class="pantallas">
          <li v-for="p in pantallas" :key="p.ruta">
            <RouterLink class="card pantalla" :to="p.ruta">
              <span class="kicker">{{ p.quien }}</span>
              <h3>{{ p.nombre }}</h3>
              <p>{{ p.descripcion }}</p>
              <span class="pantalla__ir">Entrar →</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </section>

    <section class="section s-oscuro">
      <div class="wrap">
        <div class="cabeza">
          <span class="kicker">La jornada</span>
          <h2 class="titular">Del futuro que no queremos al que podemos hacer posible.</h2>
        </div>
        <ol class="fases">
          <li v-for="f in PHASES" :key="f.id" class="fase">
            <span class="fase__num">{{ f.number }}</span>
            <strong>{{ f.name }}</strong>
            <span class="fase__min">{{ f.minutes }} min</span>
          </li>
        </ol>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero__in{display:grid;gap:clamp(1.5rem,3.5vw,2.5rem);padding-block:clamp(2.5rem,6vw,4.5rem)}
.hero__tipo{justify-self:start;display:inline-flex;align-items:center;gap:.5em;background:var(--c-innova-dark);color:var(--c-white);border-radius:99px;padding:.55em 1.1em .55em .9em;font-size:clamp(.68rem,2.6vw,.85rem);font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.hero__tipo::before{content:"";width:.6em;aspect-ratio:1;border-radius:50%;background:var(--c-white);animation:latir 1.8s ease-in-out infinite}
@keyframes latir{50%{opacity:.35}}
h1{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:.25em;font-size:clamp(3rem,11.5vw,10rem);line-height:.92}
.hero__nombre{font-weight:300;letter-spacing:-.06em}
.hero__anio{font-weight:700;letter-spacing:-.05em;background:var(--gradient-anio);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero__info{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:1.2rem clamp(1.5rem,5vw,4rem)}
.hero__lema{font-size:clamp(1.25rem,2.3vw,1.85rem);line-height:1.2;letter-spacing:-.02em;color:var(--c-ink);max-width:24ch}
.hero__lema::after{content:"";display:block;width:3.5rem;height:3px;border-radius:2px;background:var(--c-innova-dark);margin-top:1.2rem}
.hero__der{display:grid;gap:1.2rem;align-content:start}
@media(max-width:760px){.hero__info{grid-template-columns:1fr}}

.cabeza{display:grid;gap:1rem}
.pantallas{list-style:none;margin:0;padding:0;display:grid;gap:clamp(.9rem,2vw,1.25rem);grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr))}
.pantalla{height:100%;text-decoration:none;color:inherit;transition:transform .2s var(--ease-out)}
.pantalla:hover{transform:translateY(-3px)}
.pantalla p{font-size:.92rem}
.pantalla__ir{margin-top:.3rem;font-size:.8rem;font-weight:600;color:var(--c-innova-dark)}
.equipos__lista{list-style:none;margin:.4rem 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(3.4rem,1fr));gap:.5rem}
.equipo{display:grid;place-items:center;aspect-ratio:1;border-radius:1rem;background:var(--c-green-light);color:var(--c-ink);font-size:1.25rem;font-weight:600;text-decoration:none;transition:background .2s}
.equipo:hover{background:var(--c-innova)}
.nota{font-size:.85rem;font-style:italic}

.fases{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}
.fase{display:grid;gap:.2rem;border:1px solid color-mix(in srgb,var(--c-white) 20%,transparent);border-radius:var(--radius-card);padding:1.3rem}
.fase__num{font-size:2.6rem;font-weight:700;letter-spacing:-.06em;line-height:1;color:var(--c-green-mid)}
.fase strong{font-size:1.2rem;color:var(--c-white)}
.fase__min{font-size:.85rem;color:var(--c-green-light)}
@media(max-width:860px){.fases{grid-template-columns:1fr 1fr}}
</style>
