<script setup lang="ts">
// /equipo · El enlace que el equipo facilitador manda por correo a todos.
// El ordenador de cada equipo (lo trae el propio equipo) abre este enlace en la sala:
// «¿Qué equipo sois?» → /equipo/:id («¿Quién es vuestro digital owner?» → reto → dinámicas).
// El ordenador se acuerda del equipo: si vuelven a abrir el enlace, entran directamente.
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { recallOnDevice, rememberOnDevice, useStore } from '../data/store'
import { askConfirm } from '../composables/useConfirm'

const store = useStore()
const router = useRouter()
const KEY = 'lr2040-equipo-del-ordenador'

const equipos = computed(() => store.db.teams)
/** Digital owner del equipo, si ya ha entrado otro ordenador */
const ownerDe = (id: string) => store.setup(id)?.digitalOwner ?? ''
async function elegir(id: string) {
  const owner = ownerDe(id)
  if (owner && !(await askConfirm(`El equipo ${id} ya tiene ordenador (digital owner: ${owner}). ¿Seguro que sois el equipo ${id}? Si es así, ${owner.split(' ')[0]} puede seguir desde aquí.`, undefined, `Sí, somos el equipo ${id}`))) return
  rememberOnDevice(KEY, id)
  router.push(`/equipo/${id}`)
}
onMounted(() => {
  const ya = recallOnDevice<string>(KEY)
  if (ya && store.team(ya)) router.replace(`/equipo/${ya}`)
})
</script>

<template>
  <main class="section s-claro">
    <div class="wrap elegir">
      <span class="kicker">Las Rozas 2040 · Ordenador del equipo</span>
      <h1 class="titular">¿Qué equipo sois?</h1>
      <p class="intro">Elegid la letra de vuestra mesa.</p>
      <div class="letras">
        <button v-for="t in equipos" :key="t.id" type="button" class="letra" :class="{ 'letra--escogido': ownerDe(t.id) }" @click="elegir(t.id)">
          <strong>{{ t.id }}</strong>
          <span>{{ store.areaName(t.area) }}</span>
          <small v-if="ownerDe(t.id)" class="letra__ya">✓ ¡Ya escogido!</small>
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.elegir{display:grid;gap:1rem}
.letras{display:grid;grid-template-columns:repeat(auto-fill,minmax(9.5rem,1fr));gap:.8rem;margin-top:.5rem}
.letra{display:grid;gap:.3rem;justify-items:center;text-align:center;font:inherit;background:var(--c-white);border:0;border-radius:var(--radius-card);padding:1.2rem .8rem;cursor:pointer;transition:transform .2s var(--ease-out),box-shadow .2s}
.letra:hover,.letra:focus-visible{transform:translateY(-3px);box-shadow:inset 0 0 0 3px var(--c-innova);outline:none}
.letra strong{display:grid;place-items:center;width:3.6rem;height:3.6rem;border-radius:50%;background:var(--gradient-anio);color:var(--c-white);font-size:2rem;font-weight:700;line-height:1}
/* Equipo que ya tiene ordenador: más apagado, pero se puede elegir (pide confirmación) */
.letra--escogido{opacity:.5;background:color-mix(in srgb,var(--c-white) 60%,transparent)}
.letra--escogido:hover,.letra--escogido:focus-visible{opacity:.85}
.letra__ya{font-size:.75rem;font-weight:600;color:var(--c-green-deep);background:var(--c-green-light);border-radius:99px;padding:.15em .7em}
.letra span{font-size:.85rem;color:var(--c-green-dark);line-height:1.3}
</style>
