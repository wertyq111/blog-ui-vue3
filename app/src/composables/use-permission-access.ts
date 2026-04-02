import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { hasAnyPermission, hasPermission } from '@/utils/access'

export function usePermissionAccess() {
  const authStore = useAuthStore()
  const { permissions } = storeToRefs(authStore)

  return {
    permissions,
    can: (required: string | string[]) => hasPermission(permissions.value, required),
    canAny: (required: string | string[]) => hasAnyPermission(permissions.value, required),
    hasPermission: (required: string | string[]) => hasPermission(permissions.value, required),
    hasAnyPermission: (required: string | string[]) => hasAnyPermission(permissions.value, required),
    isReady: computed(() => permissions.value.length > 0),
  }
}
