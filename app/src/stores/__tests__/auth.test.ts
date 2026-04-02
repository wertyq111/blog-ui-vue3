import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { BackendMenuNode } from '@/types/menu'

vi.mock('@/api/auth', () => ({
  fetchCurrentUser: vi.fn(),
  fetchMenuTree: vi.fn(),
  loginByPassword: vi.fn(),
}))

vi.mock('@/router/dynamic', () => ({
  registerDynamicMenuRoutes: vi.fn(),
}))

import { fetchCurrentUser, fetchMenuTree, loginByPassword } from '@/api/auth'
import { registerDynamicMenuRoutes } from '@/router/dynamic'

import { AUTH_STORAGE_KEY, useAuthStore } from '../auth'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

describe('auth store', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMemoryStorage(),
      configurable: true,
    })
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: createMemoryStorage(),
      configurable: true,
    })
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('restores a remembered session snapshot from storage', () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'Bearer restored-token',
        user: { id: 1, username: 'admin' },
        menus: [],
        permissions: ['sys:user:index'],
      }),
    )

    const store = useAuthStore()

    store.restoreSession()

    expect(store.token).toBe('Bearer restored-token')
    expect(store.user?.username).toBe('admin')
    expect(store.permissions).toEqual(['sys:user:index'])
  })

  it('persists login tokens and bootstraps user info plus menu routes', async () => {
    vi.mocked(loginByPassword).mockResolvedValue({
      accessToken: 'Bearer login-token',
    })
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 7,
      username: 'root',
      permissions: ['sys:user:index'],
    })
    vi.mocked(fetchMenuTree).mockResolvedValue([
      {
        title: '工作台',
        path: '/dashboard/workplace',
        component: '/dashboard/workplace',
      },
      {
        title: '用户管理',
        path: '/system/user',
        component: '/system/user',
      },
    ] satisfies BackendMenuNode[])
    vi.mocked(registerDynamicMenuRoutes).mockReturnValue('/dashboard/workplace')

    const store = useAuthStore()

    await store.login({
      username: 'root',
      password: 'secret',
      captcha: '1234',
      captchaKey: 'captcha-key',
      remember: true,
    })
    await store.bootstrap({} as never)

    expect(store.token).toBe('Bearer login-token')
    expect(store.user?.id).toBe(7)
    expect(store.permissions).toEqual(['sys:user:index'])
    expect(store.routesReady).toBe(true)
    expect(store.homePath).toBe('/dashboard/workplace')
    expect(registerDynamicMenuRoutes).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain('Bearer login-token')
  })

  it('clears all persisted auth state after unauthorized invalidation', () => {
    const store = useAuthStore()

    store.$patch({
      token: 'Bearer stale-token',
      user: { id: 1, username: 'admin' },
      permissions: ['sys:user:index'],
      routesReady: true,
    })
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'Bearer stale-token',
        user: { id: 1, username: 'admin' },
        menus: [],
        permissions: ['sys:user:index'],
      }),
    )

    store.handleUnauthorized()

    expect(store.token).toBe('')
    expect(store.user).toBeNull()
    expect(store.permissions).toEqual([])
    expect(store.routesReady).toBe(false)
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })
})
