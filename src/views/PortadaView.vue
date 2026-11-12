<script setup lang="ts">
// Portada «/»: presenta la jornada y da acceso a cada pantalla.
// Sin datos sensibles. Los enlaces se activan en el hito 1, con el router.

interface Pantalla {
  ruta: string
  nombre: string
  quien: string
  descripcion: string
}

const pantallas: Pantalla[] = [
  { ruta: '/equipo', nombre: 'App del equipo', quien: 'Ordenador del equipo', descripcion: 'Vuestro espacio de trabajo, fase a fase: misión, tareas y lo que registráis.' },
  { ruta: '/subir', nombre: 'Subir una foto', quien: 'Móvil, con el QR', descripcion: 'Haced la foto de vuestras fichas y enviadla al expediente del equipo.' },
  { ruta: '/votar', nombre: 'Votación', quien: 'Móvil', descripcion: 'Con vuestro código, elegid las tres iniciativas que más os convencen.' },
  { ruta: '/sala', nombre: 'Pantalla de sala', quien: 'Proyector', descripcion: 'Fase actual, cronómetro, alertas, speed pitch y resultados.' },
  { ruta: '/panel', nombre: 'Panel', quien: 'Equipo facilitador', descripcion: 'Control de la jornada y cuadro de mando.' },
]

const fases = [
  { num: '01', nombre: 'Foresight', min: 55 },
  { num: '02', nombre: 'Investigación', min: 50 },
  { num: '03', nombre: 'Ideación', min: 60 },
  { num: '04', nombre: 'Pitch y cierre', min: 100 },
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
        <ul class="pantallas">
          <li v-for="p in pantallas" :key="p.ruta" class="card pantalla">
            <span class="kicker">{{ p.quien }}</span>
            <h3>{{ p.nombre }}</h3>
            <p>{{ p.descripcion }}</p>
            <span class="pantalla__estado">En construcción</span>
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
          <li v-for="f in fases" :key="f.num" class="fase">
            <span class="fase__num">{{ f.num }}</span>
            <strong>{{ f.nombre }}</strong>
            <span class="fase__min">{{ f.min }} min</span>
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
.pantalla p{font-size:.92rem}
.pantalla__estado{justify-self:start;margin-top:.3rem;border:1.5px dashed var(--c-innova);border-radius:99px;padding:.2em .8em;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-green-deep)}

.fases{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}
.fase{display:grid;gap:.2rem;border:1px solid color-mix(in srgb,var(--c-white) 20%,transparent);border-radius:var(--radius-card);padding:1.3rem}
.fase__num{font-size:2.6rem;font-weight:700;letter-spacing:-.06em;line-height:1;color:var(--c-green-mid)}
.fase strong{font-size:1.2rem;color:var(--c-white)}
.fase__min{font-size:.85rem;color:var(--c-green-light)}
@media(max-width:860px){.fases{grid-template-columns:1fr 1fr}}
</style>
