import type { LocationQuery, RouteLocationRaw } from 'vue-router'

export interface AuthGuardContext {
  isAuthenticated: () => boolean
  restoreSession: () => void
  routesReady: () => boolean
  bootstrap: () => Promise<void>
  homePath: () => string
}

function normalizeRedirectValue(value: unknown): string | null {
  return typeof value === 'string' && value.startsWith('/') ? value : null
}

export function resolveAuthRedirect(query: LocationQuery, fallbackPath: string): string {
  return normalizeRedirectValue(query.from) ?? normalizeRedirectValue(query.form) ?? fallbackPath
}

export function createAuthGuard(auth: AuthGuardContext) {
  return async (to: { path: string; fullPath: string; meta?: Record<string, unknown> }): Promise<RouteLocationRaw | true> => {
    auth.restoreSession()

    if (auth.isAuthenticated() && to.path === '/login') {
      return auth.homePath()
    }

    if (to.meta?.public === true) {
      return true
    }

    if (!auth.isAuthenticated()) {
      return {
        path: '/login',
        query: to.path === '/' ? {} : { from: to.fullPath },
      }
    }

    if (!auth.routesReady()) {
      try {
        await auth.bootstrap()
      } catch {
        return {
          path: '/login',
          query: to.path === '/' ? {} : { from: to.fullPath },
        }
      }

      return to.fullPath
    }

    return true
  }
}
