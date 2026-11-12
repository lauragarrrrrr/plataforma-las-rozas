// Rutas de la plataforma (CLAUDE.md, apartado 6)
import { createRouter, createWebHistory } from 'vue-router'
import PortadaView from './views/PortadaView.vue'
import { facilitator, whenAuthReady } from './data/store'

declare module 'vue-router' {
  interface RouteMeta {
    /** Pantalla completa, sin cabecera ni pie (la sala del proyector) */
    fullscreen?: boolean
    title?: string
    /** Solo para el equipo facilitador: pide iniciar sesión */
    facilitator?: boolean
    /** Pantalla de participantes: el logo de la cabecera lleva a /participa */
    participant?: boolean
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'portada', component: PortadaView },
    // Parte de participantes
    { path: '/participa', name: 'participa', component: () => import('./views/ParticipaView.vue'), meta: { title: 'Participantes', participant: true } },
    { path: '/equipo', redirect: '/participa' },
    { path: '/equipo/:id', name: 'equipo', component: () => import('./views/EquipoView.vue'), props: true, meta: { title: 'App del equipo', participant: true } },
    { path: '/subir/:id', name: 'subir', component: () => import('./views/SubirView.vue'), props: true, meta: { title: 'Subir una foto', participant: true } },
    { path: '/votar', name: 'votar', component: () => import('./views/VotarView.vue'), meta: { title: 'Votación', participant: true } },
    // Parte del equipo facilitador (con inicio de sesión)
    { path: '/acceso', name: 'acceso', component: () => import('./views/AccesoView.vue'), meta: { title: 'Acceso' } },
    { path: '/facilitacion', name: 'facilitacion', component: () => import('./views/FacilitacionView.vue'), meta: { title: 'Equipo facilitador', facilitator: true } },
    { path: '/vista-previa', name: 'vista-previa', component: () => import('./views/VistaPreviaView.vue'), meta: { title: 'Vista previa de las dinámicas', facilitator: true } },
    { path: '/sala', name: 'sala', component: () => import('./views/SalaView.vue'), meta: { title: 'Sala', fullscreen: true, facilitator: true } },
    { path: '/panel', name: 'panel', component: () => import('./views/PanelView.vue'), meta: { title: 'Panel', facilitator: true } },
    { path: '/:pathMatch(.*)*', name: 'no-encontrada', component: () => import('./views/NoEncontradaView.vue'), meta: { title: 'Página no encontrada' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

// Las pantallas del equipo facilitador piden iniciar sesión
router.beforeEach(async (to) => {
  if (!to.meta.facilitator) return true
  await whenAuthReady()
  if (facilitator.value) return true
  return { name: 'acceso', query: { vuelta: to.fullPath } }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Las Rozas 2040` : 'Las Rozas 2040 · Plataforma de la jornada'
})
