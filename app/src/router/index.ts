import { createRouter, createWebHistory, type Router, type RouterHistory } from 'vue-router'

import type { useAuthStore } from '@/stores/auth'

import { createStaticRoutes } from './static'
import { createAuthGuard } from './guards'

export function createAppRouter(history: RouterHistory = createWebHistory()): Router {
  return createRouter({
    history,
    routes: createStaticRoutes(),
  })
}

export function installAppGuards(router: Router, authStore: ReturnType<typeof useAuthStore>): void {
  router.beforeEach(
    createAuthGuard({
      isAuthenticated: () => authStore.isAuthenticated,
      restoreSession: () => {
        authStore.restoreSession()
      },
      routesReady: () => authStore.routesReady,
      bootstrap: async () => {
        await authStore.bootstrap(router)
      },
      homePath: () => authStore.homePath,
    }),
  )
}
