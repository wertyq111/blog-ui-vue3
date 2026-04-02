import type { Component } from 'vue'

export interface BackendMenuNode {
  id?: number | string
  title: string
  icon?: string
  path: string
  component?: string
  target?: string
  permission?: string
  type?: number
  status?: number
  hide?: number | boolean
  sort?: number
  children?: BackendMenuNode[]
}

export interface AppMenuNode extends BackendMenuNode {
  children: AppMenuNode[]
  hidden: boolean
}

export interface ResolvedMenuView {
  component: Component
  pending: boolean
  normalizedPath: string
}
