import { ref } from 'vue'

import {
  checkSystemUsernameAvailable,
  createSystemUser,
  deleteSystemUser,
  fetchSystemRoleOptions,
  fetchSystemUserList,
  resetSystemUserPassword,
  updateSystemUser,
  updateSystemUserStatus,
} from '@/api/system-user'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type { SystemRoleOption, SystemUserFormValue, SystemUserQuery, SystemUserRow } from '@/types/system-user'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface UserPageDependencies {
  fetchUsers: (
    query: SystemUserQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<SystemUserRow>>
  fetchRoles: () => Promise<SystemRoleOption[]>
  createUser: (payload: SystemUserFormValue) => Promise<SystemUserRow>
  updateUser: (id: number | string, payload: SystemUserFormValue) => Promise<SystemUserRow>
  deleteUser: (id: number | string) => Promise<void>
  updateUserStatus: (id: number | string, status: number) => Promise<SystemUserRow>
  resetUserPassword: (id: number | string) => Promise<SystemUserRow>
  checkUsernameAvailable: (username: string) => Promise<boolean>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function createEmptyFormValue(): SystemUserFormValue {
  return {
    username: '',
    email: '',
    phone: '',
    password: '',
    roleIds: [],
    status: 1,
  }
}

function mapRowToFormValue(row: SystemUserRow): SystemUserFormValue {
  return {
    id: row.id,
    username: row.username,
    email: row.email ?? '',
    phone: row.phone ?? '',
    password: '',
    roleIds: (row.roles ?? []).map((role) => role.id),
    status: row.status ?? 1,
  }
}

export function useUserPage(overrides: Partial<UserPageDependencies> = {}) {
  const dependencies: UserPageDependencies = {
    fetchUsers: fetchSystemUserList,
    fetchRoles: fetchSystemRoleOptions,
    createUser: createSystemUser,
    updateUser: updateSystemUser,
    deleteUser: deleteSystemUser,
    updateUserStatus: updateSystemUserStatus,
    resetUserPassword: resetSystemUserPassword,
    checkUsernameAvailable: checkSystemUsernameAvailable,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const roleOptions = ref<SystemRoleOption[]>([])
  const roleLoading = ref(false)

  const list = useCrudList<SystemUserRow, SystemUserQuery>({
    createInitialQuery: () => ({
      username: '',
      phone: '',
      status: '',
      include: ['roles'],
    }),
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchUsers(query, {
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

  const dialog = useDialogForm<SystemUserFormValue, SystemUserRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  async function ensureRoleOptions(): Promise<void> {
    if (roleOptions.value.length > 0 || roleLoading.value) {
      return
    }

    roleLoading.value = true

    try {
      roleOptions.value = await dependencies.fetchRoles()
    } finally {
      roleLoading.value = false
    }
  }

  async function openCreate(): Promise<void> {
    await ensureRoleOptions()
    dialog.openCreate()
  }

  async function openEdit(row: SystemUserRow): Promise<void> {
    await ensureRoleOptions()
    dialog.openEdit(row)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateUser(source.id, value)
          } else {
            await dependencies.createUser(value)
          }

          dependencies.showSuccess('用户保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeUser(row: SystemUserRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此用户吗？')
      await dependencies.withLoading(() => dependencies.deleteUser(row.id))
      dependencies.showSuccess('用户删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  async function resetPassword(row: SystemUserRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要重置密码吗？')
      await dependencies.withLoading(() => dependencies.resetUserPassword(row.id))
      dependencies.showSuccess('密码已重置')
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  async function changeStatus(row: SystemUserRow, status: number): Promise<void> {
    const previousStatus = row.status ?? 1
    row.status = status

    try {
      await dependencies.withLoading(() => dependencies.updateUserStatus(row.id, status))
      dependencies.showSuccess('状态更新成功')
    } catch (error) {
      row.status = previousStatus
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  return {
    list,
    dialog,
    roleOptions,
    roleLoading,
    openCreate,
    openEdit,
    submitDialog,
    removeUser,
    resetPassword,
    changeStatus,
    checkUsernameAvailable: dependencies.checkUsernameAvailable,
  }
}
