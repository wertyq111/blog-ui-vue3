import { describe, expect, it } from 'vitest'

import { createStaticRoutes } from '../static'

describe('static routes', () => {
  it('provides the minimum public route plus shell-owned dashboard routes', () => {
    const routes = createStaticRoutes()
    const paths = routes.map((route) => route.path)
    const shellRoute = routes.find((route) => route.path === '/')
    const shellChildren = shellRoute?.children ?? []
    const dashboardRedirect = shellChildren.find((route) => route.path === 'dashboard')
    const workplaceRoute = shellChildren.find((route) => route.path === 'dashboard/workplace')

    expect(paths).toEqual(expect.arrayContaining(['/login', '/', '/:pathMatch(.*)*']))
    expect(shellRoute?.name).toBe('app-shell')
    expect(dashboardRedirect?.meta?.title).toBe('工作台')
    expect(workplaceRoute?.name).toBe('dashboard:workplace')
  })
})
