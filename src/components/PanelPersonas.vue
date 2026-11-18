<script setup lang="ts">
// Panel · Personas de cada equipo
// La lista se guarda en Supabase (event.roster) y la ven todos los móviles y ordenadores:
// «¿Quién eres?» (/participa), el digital owner (/equipo) y la votación (/votar).
// Se puede pegar desde Excel (dos columnas: equipo y nombre) o escribir equipo a equipo.
// Recomendado: nombre de pila e inicial del apellido («Lucía M.»).
import { computed, ref } from 'vue'
import { saveRoster, useStore } from '../data/store'
import { askConfirm } from '../composables/useConfirm'

const store = useStore()
const letras = computed(() => store.db.teams.map((t) => t.id))
const cargada = computed(() => !!store.db.event.roster && Object.keys(store.db.event.roster).length > 0)
const total = computed(() => Object.values(store.roster()).reduce((n, v) => n + v.length, 0))

// Un cuadro por equipo, una persona por línea
const textos = ref<Record<string, string>>({})
function rellenar() {
  const r = store.roster()
  textos.value = Object.fromEntries(letras.value.map((l) => [l, (r[l] ?? []).join('\n')]))
}
rellenar()

// Pegar desde Excel: cada línea con la letra del equipo y el nombre, en cualquier orden
const pegado = ref('')
const avisoPegado = ref('')
function repartirPegado() {
  const nuevo: Record<string, string[]> = Object.fromEntries(letras.value.map((l) => [l, []]))
  let sinEquipo = 0
  for (const linea of pegado.value.split(/\r?\n/)) {
    const partes = linea.split(/\t|;|,/).map((x) => x.trim()).filter(Boolean)
    if (!partes.length) continue
    const i = partes.findIndex((x) => /^[A-La-l]$/.test(x))
    if (i < 0) { sinEquipo++; continue }
    const letra = partes[i].toUpperCase()
    const nombre = partes.filter((_, n) => n !== i).join(' ')
    if (nombre) nuevo[letra].push(nombre)
  }
  textos.value = Object.fromEntries(letras.value.map((l) => [l, nuevo[l].join('\n')]))
  const n = Object.values(nuevo).reduce((a, v) => a + v.length, 0)
  avisoPegado.value = `${n} personas repartidas.` + (sinEquipo ? ` ${sinEquipo} líneas sin letra de equipo no se han usado.` : '') + ' Revisadlo abajo y pulsad «Guardar».'
}

const guardado = ref(false)
async function guardar() {
  const roster = Object.fromEntries(letras.value.map((l) => [l, (textos.value[l] ?? '').split(/\r?\n/)]))
  const n = Object.values(roster).reduce((a, v) => a + v.filter((x) => x.trim()).length, 0)
  if (!(await askConfirm(`¿Guardar ${n} personas en los 12 equipos? Las verán todos los móviles y ordenadores («¿Quién eres?», el digital owner y la votación).`, '', 'Sí, guardar'))) return
  saveRoster(roster)
  guardado.value = true
  setTimeout(() => (guardado.value = false), 3000)
}
</script>

<template>
  <details class="card personas">
    <summary>
      <span class="kicker">Personas de cada equipo</span>
      <span class="estado">{{ cargada ? `Lista cargada · ${total} personas` : 'Todavía con la lista de ejemplo' }}</span>
    </summary>

    <p class="nota">Cargadla cuando cerréis los equipos. Mejor con nombre de pila e inicial del apellido («Lucía M.»). Si un equipo ya ha elegido digital owner, sus personas se cambian desde su ordenador («Cambiar»).</p>

    <label class="pegar">
      <span>Pegar desde Excel: copiad dos columnas (letra del equipo y nombre) y pegadlas aquí</span>
      <textarea v-model="pegado" rows="4" placeholder="A	Lucía M.&#10;A	Marcos R.&#10;B	Elena P."></textarea>
    </label>
    <button class="boton boton--sec" type="button" :disabled="!pegado.trim()" @click="repartirPegado">Repartir en los equipos</button>
    <p v-if="avisoPegado" class="aviso">{{ avisoPegado }}</p>

    <div class="equipos">
      <label v-for="l in letras" :key="l" class="equipo">
        <span>Equipo {{ l }} · {{ (textos[l] ?? '').split('\n').filter((x) => x.trim()).length }}</span>
        <textarea v-model="textos[l]" rows="6" :placeholder="'Una persona por línea'"></textarea>
      </label>
    </div>

    <div class="botones">
      <button class="boton" type="button" @click="guardar">Guardar para todos</button>
      <button class="enlace" type="button" @click="rellenar">Deshacer cambios sin guardar</button>
      <span v-if="guardado" class="ok">✓ Guardado</span>
    </div>
  </details>
</template>

<style scoped>
.personas{gap:.8rem}
.personas summary{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.4rem 1rem;cursor:pointer;list-style:none}
.personas summary::-webkit-details-marker{display:none}
.estado{font-size:.85rem;font-weight:600;color:var(--c-innova-dark)}
.nota{margin:0;font-size:.85rem}
.pegar{display:grid;gap:.3rem;font-size:.85rem}
textarea{font:inherit;font-size:.9rem;color:var(--c-ink);border:1.5px solid var(--c-paper-line);border-radius:.8rem;padding:.5rem .7rem;resize:vertical;width:100%;box-sizing:border-box}
textarea:focus{outline:none;border-color:var(--c-innova)}
.aviso{margin:0;font-size:.85rem;font-weight:600;color:var(--c-innova-dark)}
.equipos{display:grid;grid-template-columns:repeat(auto-fill,minmax(11rem,1fr));gap:.7rem}
.equipo{display:grid;gap:.25rem;font-size:.8rem;font-weight:700;color:var(--c-ink)}
.botones{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1rem}
.boton--sec{justify-self:start;background:var(--c-green-light)}
.boton:disabled{opacity:.45;cursor:not-allowed}
.enlace{border:0;background:none;padding:0;font:inherit;font-size:.85rem;color:var(--c-innova-dark);text-decoration:underline;cursor:pointer}
.ok{font-weight:600;color:var(--c-innova-dark)}
</style>
