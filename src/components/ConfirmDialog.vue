<script setup lang="ts">
// Ventana de confirmación de la plataforma (ver src/composables/useConfirm.ts)
import { computed, nextTick, ref, watch } from 'vue'
import { answerConfirm, confirmState as c } from '../composables/useConfirm'

const canAccept = computed(() => !c.word || c.typed.trim().toUpperCase() === c.word.toUpperCase())
const okBtn = ref<HTMLButtonElement>()
const input = ref<HTMLInputElement>()

watch(() => c.open, async (open) => {
  if (!open) return
  await nextTick()
  const main = c.choices.length ? document.querySelector<HTMLButtonElement>('.caja .botones .boton:last-child') : okBtn.value
  ;(c.word ? input.value : main)?.focus()
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') answerConfirm(false)
  // Intro = el botón principal (el último)
  if (e.key === 'Enter' && canAccept.value) answerConfirm(c.choices.length ? c.choices.length - 1 : true)
}
</script>

<template>
  <div v-if="c.open" class="capa" role="dialog" aria-modal="true" aria-labelledby="confirmar-texto" @keydown="onKey" @click.self="answerConfirm(false)">
    <div class="caja">
      <p id="confirmar-texto" class="texto">{{ c.text }}</p>
      <label v-if="c.word" class="palabra">
        <span>Escribid <strong>{{ c.word }}</strong> para confirmar</span>
        <input ref="input" v-model="c.typed" type="text" autocomplete="off" />
      </label>
      <div class="botones">
        <button class="boton boton--sec" type="button" @click="answerConfirm(false)">Cancelar</button>
        <template v-if="c.choices.length">
          <button
            v-for="(label, n) in c.choices"
            :key="label"
            class="boton"
            :class="{ 'boton--sec': n < c.choices.length - 1 }"
            type="button"
            @click="answerConfirm(n)"
          >{{ label }}</button>
        </template>
        <button v-else ref="okBtn" class="boton" type="button" :disabled="!canAccept" @click="answerConfirm(true)">{{ c.okLabel }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.capa{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:1rem;background:color-mix(in srgb,var(--c-green-deep) 55%,transparent)}
.caja{display:grid;gap:1.2rem;width:min(30rem,100%);background:var(--c-white);border-radius:var(--radius-card);padding:clamp(1.4rem,4vw,2rem)}
.texto{margin:0;font-size:1.1rem;color:var(--c-ink);white-space:pre-line}
.palabra{display:grid;gap:.4rem;font-size:.9rem}
.palabra input{font:inherit;font-size:1.05rem;padding:.6em 1em;border:2px solid var(--c-paper-line);border-radius:99px}
.palabra input:focus{outline:none;border-color:var(--c-rubi)}
.botones{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:flex-end}
.boton--sec{background:var(--c-white);box-shadow:inset 0 0 0 1.5px var(--c-ink)}
.boton:disabled{opacity:.45;cursor:not-allowed;transform:none}
</style>
