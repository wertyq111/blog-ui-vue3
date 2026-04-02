type PermissionSource = string | { permission?: string | null | undefined } | null | undefined

export function normalizePermissionCodes(sources: PermissionSource[]): string[] {
  return sources.flatMap((source) => {
    if (typeof source === 'string') {
      return source ? [source] : []
    }

    if (source?.permission) {
      return [source.permission]
    }

    return []
  })
}

export function hasPermission(currentPermissions: string[], required: string | string[]): boolean {
  const permissionSet = new Set(currentPermissions)
  const requiredPermissions = Array.isArray(required) ? required : [required]

  return requiredPermissions.every((code) => permissionSet.has(code))
}

export function hasAnyPermission(currentPermissions: string[], required: string | string[]): boolean {
  const permissionSet = new Set(currentPermissions)
  const requiredPermissions = Array.isArray(required) ? required : [required]

  if (requiredPermissions.length === 0) {
    return true
  }

  return requiredPermissions.some((code) => permissionSet.has(code))
}
