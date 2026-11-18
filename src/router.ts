// Rutas de la plataforma (CLAUDE.md, apartado 6)
import { createRouter, createWebHistory } from 'vue-router'
import PortadaView from './views/PortadaView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** Pantalla completa, sin cabecera ni pie (la sala del proyector) */
    fullscreen?: boolean
    title?: string
    /** Pantalla del equipo facilitador (sin contraseña): el logo lleva a /facilitacion */
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
    { path: '/equipo', name: 'equipo-elegir', component: () => import('./views/EquipoElegirView.vue'), meta: { title: 'Ordenador del equipo', participant: true, compact: true } },
    { path: '/equipo/:id', name: 'equipo', component: () => import('./views/EquipoView.vue'), props: true, meta: { title: 'App del equipo', participant: true, compact: true } },
    { path: '/subir/:id', name: 'subir', component: () => import('./views/SubirView.vue'), props: true, meta: { title: 'Subir una foto', participant: true } },
    { path: '/votar', name: 'votar', component: () => import('./views/VotarView.vue'), meta: { title: 'Votación', participant: true } },
    // Parte del equipo facilitador (sin contraseña)
    { path: '/acceso', redirect: '/facilitacion' },
    { path: '/facilitacion', name: 'facilitacion', component: () => import('./views/FacilitacionView.vue'), meta: { title: 'Equipo facilitador', facilitator: true } },
    { path: '/vista-previa', name: 'vista-previa', component: () => import('./views/VistaPreviaView.vue'), meta: { title: 'Vista previa de las dinámicas', facilitator: true } },
    { path: '/sala', name: 'sala', component: () => import('./views/SalaView.vue'), meta: { title: 'Sala', fullscreen: true, facilitator: true } },
    { path: '/avisos', name: 'avisos', component: () => import('./views/AvisosView.vue'), meta: { title: 'Avisos', facilitator: true } },
    { path: '/panel', name: 'panel', component: () => import('./views/PanelView.vue'), meta: { title: 'Panel', facilitator: true } },
    { path: '/resultados', name: 'resultados', component: () => import('./views/ResultadosView.vue'), meta: { title: 'Resultados', fullscreen: true, facilitator: true } },
    { path: '/:pathMatch(.*)*', name: 'no-encontrada', component: () => import('./views/NoEncontradaView.vue'), meta: { title: 'Página no encontrada' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Las Rozas 2040` : 'Las Rozas 2040 · Plataforma de la jornada'
})
