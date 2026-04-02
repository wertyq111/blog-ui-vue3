import { defineAsyncComponent, defineComponent, h, type Component } from 'vue'
import type { RouteRecordRaw, Router } from 'vue-router'

import type { BackendMenuNode, ResolvedMenuView } from '@/types/menu'

import { buildMenuRoutes, normalizeMenuTree } from '@/utils/menu'

import { APP_SHELL_ROUTE_NAME } from './static'

const viewModules = import.meta.glob('../views/**/*.vue')

function normalizeComponentPath(componentPath: string): string {
  return componentPath.startsWith('/') ? componentPath : `/${componentPath}`
}

function resolveMenuView(componentPath: string): ResolvedMenuView {
  const normalizedPath = normalizeComponentPath(componentPath)
  const candidates = [
    `../views${normalizedPath}.vue`,
    `../views${normalizedPath}/index.vue`,
  ]

  const matchedPath = candidates.find((candidate) => candidate in viewModules)

  if (!matchedPath) {
    return {
      component: defineComponent({
        name: 'PendingRouteView',
        setup() {
          return () =>
            h('main', { class: 'pending-route-page' }, [
              h('h1', normalizedPath),
              h('p', '该页面已经出现在菜单中，但 Vue3 页面还没有迁移完成。'),
              h('code', normalizedPath),
            ])
        },
      }),
      normalizedPath,
      pending: true,
    }
  }

  return {
    component: defineAsyncComponent(viewModules[matchedPath] as () => Promise<{ default: Component }>),
    normalizedPath,
    pending: false,
  }
}

function resolveFirstVisibleLeaf(nodes: BackendMenuNode[]): string {
  for (const node of nodes) {
    if (node.hide === true || node.hide === 1) {
      continue
    }

    if (node.children?.length) {
      const childPath = resolveFirstVisibleLeaf(node.children)

      if (childPath) {
        return childPath
      }
    }

    if (node.path) {
      return node.path
    }
  }

  return '/dashboard/workplace'
}

function addRouteIfMissing(router: Router, route: RouteRecordRaw): void {
  const routeName = typeof route.name === 'string' ? route.name : null

  if (routeName && router.hasRoute(routeName)) {
    return
  }

  router.addRoute(APP_SHELL_ROUTE_NAME, route)
}

export function registerDynamicMenuRoutes(router: Router, rawMenus: BackendMenuNode[]): string {
  const normalizedMenus = normalizeMenuTree(rawMenus)
  const routes = buildMenuRoutes(normalizedMenus, resolveMenuView)

  for (const route of routes) {
    addRouteIfMissing(router, route)
  }

  return resolveFirstVisibleLeaf(rawMenus)
}
