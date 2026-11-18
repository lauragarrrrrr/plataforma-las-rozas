<script setup lang="ts">
// Los QR que escanean los participantes, para proyectar o poner en la presentación:
// · «¿Quién eres?» (/participa): al llegar, para descubrir su ámbito, su equipo y su mesa.
// · Votación (/votar): al final, para votar desde el móvil aunque los ordenadores estén cerrados.
// Siempre llevan a la web pública (también si se abre desde el ordenador en local).
import { ref, watchEffect } from 'vue'
import QRCode from 'qrcode'
import { PUBLIC_URL } from '../data/config'

const QRS = [
  { id: 'participa', titulo: 'Al llegar: ¿Quién eres?', texto: 'Descubren su ámbito, su equipo y su mesa.', ruta: '/participa' },
  { id: 'votar', titulo: 'Al final: la votación', texto: 'Cada persona vota desde su móvil sus tres titulares favoritos.', ruta: '/votar' },
]
const imagenes = ref<Record<string, string>>({})
watchEffect(async () => {
  for (const q of QRS) {
    imagenes.value[q.id] = await QRCode.toDataURL(PUBLIC_URL + q.ruta, { margin: 2, width: 800, color: { dark: '#000000', light: '#ffffff' } })
  }
})
</script>

<template>
  <section class="qrs">
    <span class="kicker">QR para los participantes</span>
    <p class="nota">Proyectadlos o ponedlos en vuestra presentación. Llevan siempre a la web pública.</p>
    <div class="qrs__grid">
      <article v-for="q in QRS" :key="q.id" class="qr">
        <img v-if="imagenes[q.id]" :src="imagenes[q.id]" :alt="`Código QR: ${q.titulo}`" />
        <div class="qr__txt">
          <strong>{{ q.titulo }}</strong>
          <span>{{ q.texto }}</span>
          <code>{{ PUBLIC_URL + q.ruta }}</code>
          <a v-if="imagenes[q.id]" class="boton" :href="imagenes[q.id]" :download="`QR Las Rozas 2040 · ${q.id}.png`">Descargar el QR</a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.qrs{display:grid;gap:.8rem}
.nota{margin:0;font-size:.9rem}
.qrs__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
@media(max-width:800px){.qrs__grid{grid-template-columns:1fr}}
.qr{display:grid;grid-template-columns:10rem 1fr;gap:1rem;align-items:center;background:var(--c-white);border-radius:var(--radius-card);padding:1.2rem}
.qr img{width:10rem;height:10rem;border-radius:.8rem;box-shadow:0 0 0 1px var(--c-gris-10)}
.qr__txt{display:grid;gap:.4rem;justify-items:start}
.qr__txt strong{font-size:1.15rem;color:var(--c-ink)}
.qr__txt span{font-size:.9rem}
.qr__txt code{font-size:.75rem;word-break:break-all;color:var(--c-green-dark)}
</style>
