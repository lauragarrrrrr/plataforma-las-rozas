<script setup lang="ts">
// /facilitacion · Entrada del equipo facilitador
// La presentación de la sala va aparte (decidido por Laura el 17/11/2026): aquí solo panel y vista previa.
import { computed, ref } from 'vue'
import QRCode from 'qrcode'
import { PUBLIC_URL } from '../data/config'
import { RouterLink } from 'vue-router'
import { AGENDA } from '../data/agenda'
import { useStore } from '../data/store'
import QrParticipantes from '../components/QrParticipantes.vue'

const store = useStore()
const pendientes = computed(() => store.db.helpRequests.filter((h) => !h.attendedAt).length)
const paso = computed(() => AGENDA[store.db.room.step] ?? AGENDA[0])

// Enlace del correo (el ordenador de cada equipo)
const copiado = ref(false)
async function copiar() {
  try { await navigator.clipboard.writeText(PUBLIC_URL + '/equipo'); copiado.value = true; setTimeout(() => (copiado.value = false), 2000) } catch { /* sin portapapeles */ }
}

// QR de /avisos para el móvil de cada persona del equipo facilitador
const qrAvisos = ref('')
QRCode.toDataURL(PUBLIC_URL + '/avisos', { margin: 2, width: 600 }).then((u) => (qrAvisos.value = u))
</script>

<template>
  <main class="section s-claro">
    <div class="wrap">
      <span class="kicker">Equipo facilitador</span>
      <h1 class="titular">¿Qué queréis hacer?</h1>
      <div class="opciones">
        <RouterLink class="opcion" to="/panel">
          <span class="kicker">Seguimiento</span>
          <strong>Panel de los equipos</strong>
          <span>Por dónde va cada equipo, sus fotos y sus peticiones de ayuda.</span>
          <span class="ahora">Ahora en la jornada: {{ paso.title }}</span>
          <span v-if="pendientes" class="aviso">{{ pendientes }} {{ pendientes === 1 ? 'equipo pide' : 'equipos piden' }} ayuda</span>
        </RouterLink>
        <RouterLink class="opcion opcion--previa" to="/vista-previa">
          <span class="kicker">Para revisar</span>
          <strong>Vista previa de las dinámicas</strong>
          <span>Recorred todas las pantallas que verán los equipos, una a una, sin esperar cronómetros ni subir fotos. No se guarda nada.</span>
        </RouterLink>
      </div>

      <section class="correo">
        <span class="kicker">Enlace para el correo de los participantes</span>
        <p>Es el mismo para todos los equipos. En la sala, cada equipo lo abre en su ordenador: elige su letra y su digital owner.</p>
        <div class="correo__fila">
          <code>{{ PUBLIC_URL }}/equipo</code>
          <button class="boton" type="button" @click="copiar">{{ copiado ? '¡Copiado!' : 'Copiar enlace' }}</button>
        </div>
      </section>

      <section class="avisos-movil">
        <img v-if="qrAvisos" :src="qrAvisos" alt="Código QR de los avisos en el móvil" />
        <div>
          <span class="kicker">En vuestro móvil</span>
          <strong>Avisos de ayuda</strong>
          <span>Cada persona elige quién es y qué equipos lleva. Le suena y vibra cuando uno de sus equipos pide ayuda, y puede decir «Voy yo».</span>
          <RouterLink class="boton" to="/avisos">Abrir los avisos</RouterLink>
          <code>{{ PUBLIC_URL }}/avisos</code>
        </div>
      </section>

      <QrParticipantes />
    </div>
  </main>
</template>

<style scoped>
.opciones{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
@media(max-width:700px){.opciones{grid-template-columns:1fr}}
.opcion{display:grid;gap:.45rem;align-content:start;background:var(--c-white);border-radius:var(--radius-card);padding:clamp(1.4rem,3vw,2.2rem);text-decoration:none;color:var(--c-green-dark);transition:transform .2s var(--ease-out)}
.opcion:hover{transform:translateY(-4px)}
.opcion strong{font-size:clamp(1.4rem,2.6vw,2rem);font-weight:500;letter-spacing:-.03em;line-height:1.1;color:var(--c-ink)}
.opcion--previa{background:var(--c-white);box-shadow:inset 0 0 0 2px var(--c-green-mid)}
.correo{display:grid;gap:.5rem;background:var(--c-white);border-radius:var(--radius-card);padding:1.2rem;margin-top:1rem}
.correo p{margin:0;font-size:.9rem}
.correo__fila{display:flex;flex-wrap:wrap;gap:.8rem;align-items:center}
.correo code{font-size:1rem;font-weight:600;color:var(--c-ink);word-break:break-all}
.avisos-movil{display:grid;grid-template-columns:9rem 1fr;gap:1.2rem;align-items:center;background:var(--c-white);border-radius:var(--radius-card);padding:1.2rem;margin-block:1rem}
.avisos-movil img{width:9rem;height:9rem;border-radius:.8rem;box-shadow:0 0 0 1px var(--c-gris-10)}
.avisos-movil div{display:grid;gap:.4rem;justify-items:start}
.avisos-movil strong{font-size:1.3rem;font-weight:500;color:var(--c-ink)}
.avisos-movil code{font-size:.75rem;word-break:break-all}
@media(max-width:500px){.avisos-movil{grid-template-columns:1fr}}
.ahora{margin-top:.5rem;font-weight:600;color:var(--c-innova-dark)}
.aviso{justify-self:start;margin-top:.5rem;background:var(--c-rubi);color:var(--c-white);border-radius:99px;padding:.3em .9em;font-size:.85rem;font-weight:600}
</style>
