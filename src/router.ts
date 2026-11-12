// Rutas de la plataforma (CLAUDE.md, apartado 6)
import { createRouter, createWebHistory } from 'vue-router'
import PortadaView from './views/PortadaView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** Pantalla completa, sin cabecera ni pie (la sala del proyector) */
    fullscreen?: boolean
    title?: string
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'portada', component: PortadaView },
    { path: '/equipo/:id', name: 'equipo', component: () => import('./views/EquipoView.vue'), props: true, meta: { title: 'App del equipo' } },
    { path: '/subir/:id', name: 'subir', component: () => import('./views/SubirView.vue'), props: true, meta: { title: 'Subir una foto' } },
    { path: '/votar', name: 'votar', component: () => import('./views/VotarView.vue'), meta: { title: 'Votación' } },
    { path: '/sala', name: 'sala', component: () => import('./views/SalaView.vue'), meta: { title: 'Sala', fullscreen: true } },
    { path: '/panel', name: 'panel', component: () => import('./views/PanelView.vue'), meta: { title: 'Panel' } },
    { path: '/:pathMatch(.*)*', name: 'no-encontrada', component: () => import('./views/NoEncontradaView.vue'), meta: { title: 'Página no encontrada' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Las Rozas 2040` : 'Las Rozas 2040 · Plataforma de la jornada'
})
