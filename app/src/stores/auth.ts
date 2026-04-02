import { defineStore } from 'pinia'
import type { Router } from 'vue-router'

import { fetchCurrentUser, fetchMenuTree, loginByPassword, type LoginPayload } from '@/api/auth'
import { setTokenRefreshHandler, setUnauthorizedHandler } from '@/api/client'
import { registerDynamicMenuRoutes } from '@/router/dynamic'
import type { AuthStateSnapshot, CurrentUser } from '@/types/auth'
import type { BackendMenuNode } from '@/types/menu'
import { normalizePermissionCodes } from '@/utils/access'

import {
  AUTH_STORAGE_KEY,
  clearStoredAuthSnapshot,
  readStoredAuthSnapshot,
  replaceStoredAuthSnapshot,
  writeStoredAuthSnapshot,
} from './auth-storage'

const DEFAULT_HOME_PATH = '/dashboard/workplace'

function createEmptySnapshot(token = ''): AuthStateSnapshot {
  return {
    token,
    user: null,
    menus: [],
    permissions: [],
  }
}

function derivePermissions(user: CurrentUser | null): string[] {
  if (!user) {
    return []
  }

  if (user.permissions?.length) {
    return user.permissions
  }

  return normalizePermissionCodes((user.authorities ?? []) as Array<string | { permission?: string }>)
}

export { AUTH_STORAGE_KEY }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    user: null as CurrentUser | null,
    menus: [] as BackendMenuNode[],
    permissions: [] as string[],
    routesReady: false,
    homePath: DEFAULT_HOME_PATH,
  }),
  getters: {
    isAuthenticated: (state) => state.token.length > 0,
  },
  actions: {
    attachClientHandlers(): void {
      setUnauthorizedHandler(() => {
        this.handleUnauthorized()
      })
      setTokenRefreshHandler((token) => {
        this.token = token
      })
    },
    restoreSession(): boolean {
      const snapshot = readStoredAuthSnapshot()

      if (!snapshot) {
        return false
      }

      this.token = snapshot.token
      this.user = snapshot.user
      this.menus = snapshot.menus
      this.permissions = snapshot.permissions

      return snapshot.token.length > 0
    },
    persistSnapshot(remember: boolean): void {
      writeStoredAuthSnapshot(
        {
          token: this.token,
          user: this.user,
          menus: this.menus,
          permissions: this.permissions,
        },
        remember,
      )
    },
    replaceSnapshot(): void {
      replaceStoredAuthSnapshot({
        token: this.token,
        user: this.user,
        menus: this.menus,
        permissions: this.permissions,
      })
    },
    async login(payload: LoginPayload): Promise<void> {
      const tokens = await loginByPassword(payload)

      this.token = tokens.accessToken
      this.user = null
      this.menus = []
      this.permissions = []
      this.routesReady = false
      this.homePath = DEFAULT_HOME_PATH

      this.persistSnapshot(payload.remember)
    },
    async bootstrap(router: Router): Promise<void> {
      if (!this.token) {
        this.restoreSession()
      }

      if (!this.token) {
        throw new Error('Missing auth token')
      }

      const [user, menus] = await Promise.all([fetchCurrentUser(), fetchMenuTree()])
      const permissions = derivePermissions(user)
      const homePath = registerDynamicMenuRoutes(router, menus)

      this.user = user
      this.menus = menus
      this.permissions = permissions
      this.routesReady = true
      this.homePath = homePath || DEFAULT_HOME_PATH

      this.replaceSnapshot()
    },
    handleUnauthorized(): void {
      clearStoredAuthSnapshot()
      const emptySnapshot = createEmptySnapshot()

      this.token = emptySnapshot.token
      this.user = emptySnapshot.user
      this.menus = emptySnapshot.menus
      this.permissions = emptySnapshot.permissions
      this.routesReady = false
      this.homePath = DEFAULT_HOME_PATH
    },
    logout(): void {
      this.handleUnauthorized()
    },
  },
})
