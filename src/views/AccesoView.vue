<script setup lang="ts">
// /acceso · Inicio de sesión del equipo facilitador.
// Las cuentas se crean en Supabase → Authentication → Users. Aquí solo se comprueban.
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { loginFacilitator } from '../data/store'

const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const entrando = ref(false)

async function entrar() {
  error.value = ''
  entrando.value = true
  try {
    await loginFacilitator(email.value.trim(), password.value)
    const vuelta = typeof route.query.vuelta === 'string' && route.query.vuelta.startsWith('/') ? route.query.vuelta : '/facilitacion'
    router.replace(vuelta)
  } catch {
    error.value = 'El correo o la contraseña no son correctos.'
  } finally {
    entrando.value = false
  }
}
</script>

<template>
  <main class="section s-claro">
    <div class="wrap acceso">
      <span class="kicker">Equipo facilitador</span>
      <h1 class="titular">Acceso</h1>
      <p class="intro">Esta parte es solo para el equipo facilitador.</p>
      <form class="card" @submit.prevent="entrar">
        <label class="campo">
          <span>Correo</span>
          <input v-model="email" type="email" autocomplete="username" required />
        </label>
        <label class="campo">
          <span>Contraseña</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>
        <p v-if="error" class="alerta" role="alert">{{ error }}</p>
        <button class="boton" type="submit" :disabled="entrando">{{ entrando ? 'Entrando…' : 'Entrar' }}</button>
      </form>
      <RouterLink class="volver" to="/participa">¿Eres participante? Entra aquí</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.acceso{max-width:30rem;display:grid;gap:1rem}
.campo{display:grid;gap:.25rem}
.campo span{font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--c-innova-dark)}
.campo input{font:inherit;padding:.7rem .9rem;border:1.5px solid var(--c-green-mid);border-radius:.9rem;color:var(--c-ink)}
.volver{font-size:.9rem}
.boton:disabled{opacity:.5}
</style>
