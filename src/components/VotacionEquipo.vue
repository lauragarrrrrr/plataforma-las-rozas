<script setup lang="ts">
// Apartado de votación al final de la app del equipo.
// Se ve desde el final, pero bloqueado hasta que el equipo facilitador abre la votación.
// Abierta: un QR para que cada persona vote desde su móvil.
import { computed, ref, watchEffect } from 'vue'
import QRCode from 'qrcode'

const props = defineProps<{ teamId: string; open: boolean }>()

const link = computed(() => `${location.origin}/votar?equipo=${props.teamId}`)
const qr = ref('')
watchEffect(async () => {
  qr.value = await QRCode.toDataURL(link.value, { margin: 1, width: 320, color: { dark: '#000000', light: '#ffffff' } })
})
</script>

<template>
  <section class="card votacion" :class="{ 'votacion--cerrada': !open }">
    <span class="kicker">Votación</span>
    <template v-if="!open">
      <span class="candado" aria-hidden="true">🔒</span>
      <h2>¿Qué iniciativas os han gustado más?</h2>
      <p>La votación se abrirá al terminar el speed pitch. Entonces cada persona votará desde su móvil.</p>
    </template>
    <template v-else>
      <h2>¡Ya podéis votar!</h2>
      <div class="votacion__qr">
        <img v-if="qr" :src="qr" width="200" height="200" alt="Código QR para votar con el móvil" />
        <ol>
          <li>Cada persona abre la cámara de su móvil y apunta al código.</li>
          <li>Elige su nombre.</li>
          <li>Vota las <strong>tres</strong> iniciativas que más le han gustado. No se puede votar al propio equipo.</li>
        </ol>
      </div>
    </template>
  </section>
</template>

<style scoped>
.votacion{gap:.7rem;max-width:44rem}
.votacion h2{font-size:clamp(1.4rem,3vw,2rem);font-weight:500;letter-spacing:-.03em;line-height:1.1;color:var(--c-ink)}
.votacion--cerrada{opacity:.85;box-shadow:inset 0 0 0 2px var(--c-green-mid)}
.candado{font-size:2rem}
.votacion__qr{display:flex;flex-wrap:wrap;gap:1.2rem;align-items:center}
.votacion__qr img{width:200px;height:200px;border-radius:1rem;box-shadow:0 0 0 1px var(--c-gris-10)}
.votacion__qr ol{margin:0;padding-left:1.2rem;display:grid;gap:.3rem;flex:1;min-width:14rem;color:var(--c-ink)}
</style>
