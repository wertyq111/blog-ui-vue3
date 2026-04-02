import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

import type { BackendMenuNode, ResolvedMenuView } from '@/types/menu'

import { buildMenuRoutes, normalizeMenuTree } from '../menu'

describe('menu utilities', () => {
  it('normalizes menu visibility and child arrays', () => {
    const tree = normalizeMenuTree([
      {
        title: '系统管理',
        path: '/system',
        children: [{ title: '用户管理', path: '/system/user', hide: 1 }],
      },
    ])

    expect(tree[0].children[0].hidden).toBe(true)
  })

  it('builds dynamic routes and marks missing views as pending', () => {
    const routes = buildMenuRoutes(
      normalizeMenuTree([
        {
          title: '用户管理',
          path: '/system/user',
          component: '/system/user',
        },
        {
          title: '未迁移页面',
          path: '/system/role',
          component: '/system/role',
        },
      ] satisfies BackendMenuNode[]),
      (componentPath): ResolvedMenuView => {
        if (componentPath === '/system/user') {
          return {
            component: defineComponent({ name: 'ResolvedView' }),
            normalizedPath: '/system/user',
            pending: false,
          }
        }

        return {
          component: defineComponent({ name: 'PendingView' }),
          normalizedPath: '/system/role',
          pending: true,
        }
      },
    )

    expect(routes).toHaveLength(2)
    expect(routes[0].meta?.title).toBe('用户管理')
    expect(routes[1].meta?.pending).toBe(true)
  })

  it('uses a router outlet for menu groups without an explicit component view', () => {
    const routes = buildMenuRoutes(
      normalizeMenuTree([
        {
          title: '系统管理',
          path: '/system',
          component: '',
          children: [
            {
              title: '用户管理',
              path: '/system/user',
              component: '/system/user',
            },
          ],
        },
      ] satisfies BackendMenuNode[]),
      (componentPath): ResolvedMenuView => ({
        component: defineComponent({ name: componentPath.replace(/\W/g, '') || 'FallbackView' }),
        normalizedPath: componentPath,
        pending: false,
      }),
    )

    const routeComponent = routes[0].component as { name?: string }

    expect(routes[0].children).toHaveLength(1)
    expect(routes[0].meta?.pending).toBe(false)
    expect(routeComponent.name).toBe('MenuRouteOutlet')
  })
})
