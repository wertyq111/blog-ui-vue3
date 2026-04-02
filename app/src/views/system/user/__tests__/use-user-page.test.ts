import { describe, expect, it, vi } from 'vitest'

import type { SystemRoleOption, SystemUserRow } from '@/types/system-user'

import { useUserPage } from '../use-user-page'

function createListResponse(items: SystemUserRow[]) {
  return {
    items,
    meta: {
      currentPage: 1,
      perPage: 10,
      total: items.length,
      lastPage: 1,
    },
  }
}

describe('useUserPage', () => {
  it('opens the edit dialog with mapped role ids and an empty password field', async () => {
    const fetchUsers = vi.fn().mockResolvedValue(createListResponse([]))
    const fetchRoles = vi.fn<() => Promise<SystemRoleOption[]>>().mockResolvedValue([
      {
        id: 1,
        name: '管理员',
      },
    ])

    const page = useUserPage({
      fetchUsers,
      fetchRoles,
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      updateUserStatus: vi.fn(),
      resetUserPassword: vi.fn(),
      checkUsernameAvailable: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openEdit({
      id: 7,
      username: 'root',
      email: 'root@example.com',
      phone: '13800000000',
      status: 2,
      roles: [
        {
          id: 2,
          name: '编辑',
        },
      ],
    })

    expect(fetchRoles).toHaveBeenCalledTimes(1)
    expect(page.roleOptions.value).toEqual([
      {
        id: 1,
        name: '管理员',
      },
    ])
    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.isEditing.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 7,
      username: 'root',
      email: 'root@example.com',
      phone: '13800000000',
      password: '',
      roleIds: [2],
      status: 2,
    })
  })

  it('creates a user, closes the dialog, and refreshes the list on success', async () => {
    const fetchUsers = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(createListResponse([{ id: 1, username: 'new-user' }]))
    const createUser = vi.fn().mockResolvedValue({
      id: 1,
      username: 'new-user',
    })
    const showSuccess = vi.fn()

    const page = useUserPage({
      fetchUsers,
      fetchRoles: vi.fn().mockResolvedValue([]),
      createUser,
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      updateUserStatus: vi.fn(),
      resetUserPassword: vi.fn(),
      checkUsernameAvailable: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.openCreate()

    page.dialog.value.value.username = 'new-user'
    page.dialog.value.value.email = 'new@example.com'
    page.dialog.value.value.phone = '13800000000'
    page.dialog.value.value.password = 'secret123'
    page.dialog.value.value.roleIds = [1]

    await page.submitDialog()

    expect(createUser).toHaveBeenCalledWith({
      username: 'new-user',
      email: 'new@example.com',
      phone: '13800000000',
      password: 'secret123',
      roleIds: [1],
      status: 1,
    })
    expect(showSuccess).toHaveBeenCalledWith('用户保存成功')
    expect(page.dialog.visible.value).toBe(false)
    expect(fetchUsers).toHaveBeenCalledTimes(2)
    expect(page.list.items.value).toEqual([{ id: 1, username: 'new-user' }])
  })

  it('keeps the dialog open and reports the error when updating fails', async () => {
    const updateUser = vi.fn().mockRejectedValue(new Error('保存失败'))
    const showError = vi.fn()

    const page = useUserPage({
      fetchUsers: vi.fn().mockResolvedValue(createListResponse([])),
      fetchRoles: vi.fn().mockResolvedValue([]),
      createUser: vi.fn(),
      updateUser,
      deleteUser: vi.fn(),
      updateUserStatus: vi.fn(),
      resetUserPassword: vi.fn(),
      checkUsernameAvailable: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError,
      withLoading: async (task) => task(),
    })

    await page.openEdit({
      id: 9,
      username: 'editor',
      status: 1,
      roles: [],
    })

    await expect(page.submitDialog()).rejects.toThrow('保存失败')

    expect(updateUser).toHaveBeenCalledWith(9, {
      id: 9,
      username: 'editor',
      email: '',
      phone: '',
      password: '',
      roleIds: [],
      status: 1,
    })
    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.submitting.value).toBe(false)
    expect(showError).toHaveBeenCalledWith('保存失败')
  })
})
