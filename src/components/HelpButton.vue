<script setup lang="ts">
// «Pedir ayuda»: en la esquina, siempre visible. Avisa al equipo facilitador en el panel.
import { computed } from 'vue'
import { requestHelp, useStore } from '../data/store'
import { useNow } from '../composables/useNow'

const props = defineProps<{ teamId: string; dynamicId: string }>()
const store = useStore()
const now = useNow()

const pending = computed(() => store.pendingHelp(props.teamId))
/** Aviso atendido hace menos de un minuto: se lo enseñamos al equipo */
const justAttended = computed(() =>
  store.db.helpRequests.some(
    (h) => h.teamId === props.teamId && h.attendedAt && now.value - new Date(h.attendedAt).getTime() < 60_000,
  ),
)
</script>

<template>
  <div class="ayuda" role="status" aria-live="polite">
    <p v-if="pending" class="ayuda__nota ayuda__nota--enviada">
      <strong>Aviso enviado</strong>
      <span>El equipo facilitador viene a vuestra mesa.</span>
    </p>
    <template v-else>
      <p v-if="justAttended" class="ayuda__nota">
        <strong>Aviso atendido</strong>
      </p>
      <button class="ayuda__boton" type="button" @click="requestHelp(teamId, dynamicId)">
        <span class="ayuda__icono" aria-hidden="true">!</span> Pedir ayuda
      </button>
    </template>
  </div>
</template>

<style scoped>
.ayuda{position:fixed;right:max(16px,2vw);bottom:max(16px,2vw);z-index:40;display:grid;justify-items:end;gap:.5rem}
.ayuda__boton{display:inline-flex;align-items:center;gap:.6rem;border:0;border-radius:99px;padding:.8em 1.3em;background:var(--c-rubi);color:var(--c-white);font:inherit;font-weight:600;cursor:pointer;box-shadow:0 14px 30px -14px var(--c-rubi)}
.ayuda__icono{display:grid;place-items:center;width:1.5em;height:1.5em;border-radius:50%;background:var(--c-white);color:var(--c-rubi);font-weight:700}
.ayuda__nota{display:grid;background:var(--c-white);border:2px solid var(--c-green-mid);border-radius:1rem;padding:.6rem 1rem;max-width:16rem;font-size:.85rem;color:var(--c-ink)}
.ayuda__nota--enviada{border-color:var(--c-rubi)}
.ayuda__nota--enviada strong{color:var(--c-rubi)}
</style>
