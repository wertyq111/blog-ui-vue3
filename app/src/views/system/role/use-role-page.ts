import { ref } from 'vue'

import {
  createSystemRole,
  deleteSystemRole,
  deleteSystemRoleBatch,
  fetchSystemRoleList,
  fetchSystemRolePermissionList,
  saveSystemRolePermissionList,
  updateSystemRole,
  updateSystemRoleStatus,
} from '@/api/system-role'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type { SystemRoleFormValue, SystemRolePermissionNode, SystemRoleQuery, SystemRoleRow } from '@/types/system-role'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface RolePageDependencies {
  fetchRoles: (
    query: SystemRoleQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<SystemRoleRow>>
  createRole: (payload: SystemRoleFormValue) => Promise<SystemRoleRow>
  updateRole: (id: number | string, payload: SystemRoleFormValue) => Promise<SystemRoleRow>
  deleteRole: (id: number | string) => Promise<void>
  deleteRoleBatch: (ids: Array<number | string>) => Promise<void>
  updateRoleStatus: (id: number | string, status: number) => Promise<SystemRoleRow>
  fetchRolePermissions: (roleId: number | string) => Promise<SystemRolePermissionNode[]>
  saveRolePermissions: (roleId: number | string, menuIds: Array<number | string>) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function createEmptyFormValue(): SystemRoleFormValue {
  return {
    name: '',
    code: '',
    status: 1,
    sort: 0,
    note: '',
  }
}

function mapRowToFormValue(row: SystemRoleRow): SystemRoleFormValue {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    status: row.status ?? 1,
    sort: row.sort ?? 0,
    note: row.note ?? '',
  }
}

function buildPermissionTree(nodes: SystemRolePermissionNode[]): SystemRolePermissionNode[] {
  const nodeMap = new Map<number | string, SystemRolePermissionNode>()
  const roots: SystemRolePermissionNode[] = []

  for (const node of nodes) {
    nodeMap.set(node.id, {
      ...node,
      children: [],
    })
  }

  for (const node of nodeMap.values()) {
    const parentId = node.pid
    const parent = parentId !== undefined && parentId !== null ? nodeMap.get(parentId) : undefined

    if (!parent || parentId === 0 || parentId === '0') {
      roots.push(node)
      continue
    }

    parent.children?.push(node)
  }

  return roots
}

export function useRolePage(overrides: Partial<RolePageDependencies> = {}) {
  const dependencies: RolePageDependencies = {
    fetchRoles: fetchSystemRoleList,
    createRole: createSystemRole,
    updateRole: updateSystemRole,
    deleteRole: deleteSystemRole,
    deleteRoleBatch: deleteSystemRoleBatch,
    updateRoleStatus: updateSystemRoleStatus,
    fetchRolePermissions: fetchSystemRolePermissionList,
    saveRolePermissions: saveSystemRolePermissionList,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<SystemRoleRow, SystemRoleQuery>({
    createInitialQuery: () => ({
      name: '',
    }),
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchRoles(query, {
        page,
        perPage,
      })

      return {
        data: {
          data: result.items,
          meta: {
            current_page: result.meta.currentPage,
            per_page: result.meta.perPage,
            total: result.meta.total,
            last_page: result.meta.lastPage,
          },
        },
      }
    },
  })

  const dialog = useDialogForm<SystemRoleFormValue, SystemRoleRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  const permissionVisible = ref(false)
  const permissionLoading = ref(false)
  const permissionSubmitting = ref(false)
  const permissionTree = ref<SystemRolePermissionNode[]>([])
  const permissionRole = ref<SystemRoleRow | null>(null)

  function openCreate(): void {
    dialog.openCreate()
  }

  function openEdit(row: SystemRoleRow): void {
    dialog.openEdit(row)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateRole(source.id, value)
          } else {
            await dependencies.createRole(value)
          }

          dependencies.showSuccess('角色保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeRole(row: SystemRoleRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此角色吗？')
      await dependencies.withLoading(() => dependencies.deleteRole(row.id))
      dependencies.showSuccess('角色删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  async function removeBatch(): Promise<void> {
    const selectedRows = list.selection.value

    if (selectedRows.length === 0) {
      dependencies.showError('请至少选择一条角色数据')
      return
    }

    try {
      await dependencies.confirmWarning('确定要删除选中的角色吗？')
      await dependencies.withLoading(() => dependencies.deleteRoleBatch(selectedRows.map((row) => row.id)))
      dependencies.showSuccess('角色批量删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  async function changeStatus(row: SystemRoleRow, status: number): Promise<void> {
    const previousStatus = row.status ?? 1
    row.status = status

    try {
      await dependencies.withLoading(() => dependencies.updateRoleStatus(row.id, status))
      dependencies.showSuccess('状态更新成功')
    } catch (error) {
      row.status = previousStatus
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function openPermission(row: SystemRoleRow): Promise<void> {
    permissionRole.value = row
    permissionVisible.value = true
    permissionLoading.value = true

    try {
      const nodes = await dependencies.fetchRolePermissions(row.id)
      permissionTree.value = buildPermissionTree(nodes)
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      permissionTree.value = []
      throw error
    } finally {
      permissionLoading.value = false
    }
  }

  async function savePermissions(menuIds: Array<number | string>): Promise<void> {
    if (!permissionRole.value) {
      return
    }

    permissionSubmitting.value = true

    try {
      await dependencies.saveRolePermissions(permissionRole.value.id, menuIds)
      dependencies.showSuccess('角色权限更新成功')
      permissionVisible.value = false
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      permissionSubmitting.value = false
    }
  }

  function closePermission(): void {
    permissionVisible.value = false
    permissionRole.value = null
    permissionTree.value = []
    permissionLoading.value = false
    permissionSubmitting.value = false
  }

  return {
    list,
    dialog,
    openCreate,
    openEdit,
    submitDialog,
    removeRole,
    removeBatch,
    changeStatus,
    permissionVisible,
    permissionLoading,
    permissionSubmitting,
    permissionTree,
    permissionRole,
    openPermission,
    savePermissions,
    closePermission,
  }
}
