import type { App, DirectiveBinding, ObjectDirective, Plugin } from 'vue'

import { hasAnyPermission, hasPermission } from '@/utils/access'

type PermissionRequirement = string | string[]
type PermissionMode = 'all' | 'any'
type PermissionReader = () => string[]

type GuardedElement = HTMLElement & {
  __permissionPlaceholder__?: Comment
}

function normalizeRequirement(value: PermissionRequirement | undefined): string[] {
  if (!value) {
    return []
  }

  return (Array.isArray(value) ? value : [value]).filter((item) => item.length > 0)
}

function showElement(el: GuardedElement): void {
  const placeholder = el.__permissionPlaceholder__

  if (placeholder?.parentNode) {
    placeholder.parentNode.replaceChild(el, placeholder)
  }
}

function hideElement(el: GuardedElement): void {
  const placeholder = el.__permissionPlaceholder__ ?? document.createComment('permission-gated')
  el.__permissionPlaceholder__ = placeholder

  if (el.parentNode) {
    el.parentNode.replaceChild(placeholder, el)
  }
}

function isAllowed(currentPermissions: string[], value: PermissionRequirement | undefined, mode: PermissionMode): boolean {
  const required = normalizeRequirement(value)

  if (required.length === 0) {
    return true
  }

  return mode === 'all'
    ? hasPermission(currentPermissions, required)
    : hasAnyPermission(currentPermissions, required)
}

function applyPermission(
  el: GuardedElement,
  binding: DirectiveBinding<PermissionRequirement>,
  readPermissions: PermissionReader,
  mode: PermissionMode,
): void {
  if (isAllowed(readPermissions(), binding.value, mode)) {
    showElement(el)
    return
  }

  hideElement(el)
}

function createPermissionDirective(readPermissions: PermissionReader, mode: PermissionMode): ObjectDirective<GuardedElement, PermissionRequirement> {
  return {
    mounted(el, binding) {
      applyPermission(el, binding, readPermissions, mode)
    },
    updated(el, binding) {
      applyPermission(el, binding, readPermissions, mode)
    },
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $hasPermission: (value: PermissionRequirement) => boolean
    $hasAnyPermission: (value: PermissionRequirement) => boolean
  }
}

export function createPermissionPlugin(readPermissions: PermissionReader): Plugin {
  return {
    install(app: App) {
      app.directive('permission', createPermissionDirective(readPermissions, 'all'))
      app.directive('any-permission', createPermissionDirective(readPermissions, 'any'))

      app.config.globalProperties.$hasPermission = (value: PermissionRequirement) =>
        isAllowed(readPermissions(), value, 'all')
      app.config.globalProperties.$hasAnyPermission = (value: PermissionRequirement) =>
        isAllowed(readPermissions(), value, 'any')
    },
  }
}
