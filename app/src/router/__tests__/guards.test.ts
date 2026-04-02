import { describe, expect, it, vi } from 'vitest'

import { createAuthGuard, resolveAuthRedirect } from '../guards'

describe('auth guard', () => {
  it('redirects unauthenticated navigation to login with a from query', async () => {
    const guard = createAuthGuard({
      isAuthenticated: () => false,
      restoreSession: vi.fn(),
      routesReady: () => false,
      bootstrap: vi.fn(),
      homePath: () => '/dashboard/workplace',
    })

    const result = await guard({
      path: '/system/user',
      fullPath: '/system/user?page=2',
      meta: {},
    } as never)

    expect(result).toEqual({
      path: '/login',
      query: {
        from: '/system/user?page=2',
      },
    })
  })

  it('bootstraps dynamic routes on first authenticated navigation', async () => {
    const bootstrap = vi.fn().mockResolvedValue(undefined)
    const guard = createAuthGuard({
      isAuthenticated: () => true,
      restoreSession: vi.fn(),
      routesReady: () => false,
      bootstrap,
      homePath: () => '/dashboard/workplace',
    })

    const result = await guard({
      path: '/dashboard/workplace',
      fullPath: '/dashboard/workplace',
      meta: {},
    } as never)

    expect(bootstrap).toHaveBeenCalledTimes(1)
    expect(result).toBe('/dashboard/workplace')
  })

  it('redirects authenticated users away from the login page', async () => {
    const guard = createAuthGuard({
      isAuthenticated: () => true,
      restoreSession: vi.fn(),
      routesReady: () => true,
      bootstrap: vi.fn(),
      homePath: () => '/dashboard/workplace',
    })

    const result = await guard({
      path: '/login',
      fullPath: '/login',
      meta: {
        public: true,
      },
    } as never)

    expect(result).toBe('/dashboard/workplace')
  })

  it('resolves legacy login redirect queries with from first and form as fallback', () => {
    expect(resolveAuthRedirect({ from: '/system/user' }, '/dashboard/workplace')).toBe('/system/user')
    expect(resolveAuthRedirect({ form: '/mini-program/photo-category' }, '/dashboard/workplace')).toBe(
      '/mini-program/photo-category',
    )
    expect(resolveAuthRedirect({}, '/dashboard/workplace')).toBe('/dashboard/workplace')
  })
})
