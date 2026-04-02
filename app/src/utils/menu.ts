import { defineComponent, h } from 'vue'
import { RouterView, type RouteRecordRaw } from 'vue-router'

import type { AppMenuNode, BackendMenuNode, ResolvedMenuView } from '@/types/menu'

const MenuRouteOutlet = defineComponent({
  name: 'MenuRouteOutlet',
  setup() {
    return () => h(RouterView)
  },
})

function resolveComponentPath(node: AppMenuNode): string {
  const componentPath = node.component?.trim()

  return componentPath && componentPath.length > 0 ? componentPath : node.path
}

export function normalizeMenuTree(nodes: BackendMenuNode[]): AppMenuNode[] {
  return nodes.map((node) => ({
    ...node,
    hidden: node.hide === true || node.hide === 1,
    children: normalizeMenuTree(node.children ?? []),
  }))
}

export function buildMenuRoutes(
  menuTree: AppMenuNode[],
  resolveView: (componentPath: string) => ResolvedMenuView,
): RouteRecordRaw[] {
  return menuTree.map((node) => {
    const usesOutlet = node.children.length > 0 && (!node.component || node.component.trim().length === 0)
    const resolvedView = usesOutlet
      ? {
          component: MenuRouteOutlet,
          normalizedPath: node.path,
          pending: false,
        }
      : resolveView(resolveComponentPath(node))

    return {
      path: node.path,
      name: resolvedView.normalizedPath.replace(/^\//, '').replace(/\//g, ':') || 'root',
      component: resolvedView.component,
      meta: {
        title: node.title,
        icon: node.icon,
        hidden: node.hidden,
        pending: resolvedView.pending,
        permission: node.permission,
        target: node.target,
      },
      children: buildMenuRoutes(node.children, resolveView),
    }
  })
}
