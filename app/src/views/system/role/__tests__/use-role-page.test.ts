import { describe, expect, it, vi } from 'vitest'

import { useRolePage } from '../use-role-page'

function createListResponse(items: unknown[], count = items.length) {
  return {
    items,
    meta: {
      currentPage: 1,
      perPage: 10,
      total: count,
      lastPage: Math.max(1, Math.ceil(count / 10)),
    },
  }
}

describe('useRolePage', () => {
  it('opens edit dialog with mapped role form value', async () => {
    const page = useRolePage({
      fetchRoles: vi.fn().mockResolvedValue(createListResponse([])),
      createRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      deleteRoleBatch: vi.fn(),
      updateRoleStatus: vi.fn(),
      fetchRolePermissions: vi.fn(),
      saveRolePermissions: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    page.openEdit({
      id: 2,
      name: '管理员',
      code: 'admin',
      status: 1,
      sort: 1,
      note: '默认角色',
    })

    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 2,
      name: '管理员',
      code: 'admin',
      status: 1,
      sort: 1,
      note: '默认角色',
    })
  })

  it('creates a role and reloads list after submit', async () => {
    const createRole = vi.fn().mockResolvedValue({ id: 9 })
    const fetchRoles = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(createListResponse([{ id: 9, name: '审核' }]))

    const page = useRolePage({
      fetchRoles,
      createRole,
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      deleteRoleBatch: vi.fn(),
      updateRoleStatus: vi.fn(),
      fetchRolePermissions: vi.fn(),
      saveRolePermissions: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value.name = '审核'
    page.dialog.value.value.code = 'reviewer'
    page.dialog.value.value.status = 1
    page.dialog.value.value.sort = 2
    page.dialog.value.value.note = '审核角色'

    await page.submitDialog()

    expect(createRole).toHaveBeenCalledWith({
      name: '审核',
      code: 'reviewer',
      status: 1,
      sort: 2,
      note: '审核角色',
    })
    expect(page.list.items.value).toEqual([{ id: 9, name: '审核' }])
  })

  it('rolls back status when update fails', async () => {
    const updateRoleStatus = vi.fn().mockRejectedValue(new Error('状态更新失败'))

    const page = useRolePage({
      fetchRoles: vi.fn().mockResolvedValue(createListResponse([])),
      createRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      deleteRoleBatch: vi.fn(),
      updateRoleStatus,
      fetchRolePermissions: vi.fn(),
      saveRolePermissions: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    const row = {
      id: 3,
      name: '运营',
      code: 'ops',
      status: 1,
      sort: 3,
      note: '',
    }

    await expect(page.changeStatus(row, 2)).rejects.toThrow('状态更新失败')
    expect(row.status).toBe(1)
  })

  it('loads role permission tree and submits checked plus half-checked ids', async () => {
    const fetchRolePermissions = vi.fn().mockResolvedValue([
      { id: 1, pid: 0, title: '系统管理', checked: true },
      { id: 2, pid: 1, title: '角色管理', checked: true },
      { id: 3, pid: 1, title: '角色删除', checked: false },
    ])
    const saveRolePermissions = vi.fn().mockResolvedValue(undefined)

    const page = useRolePage({
      fetchRoles: vi.fn().mockResolvedValue(createListResponse([])),
      createRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      deleteRoleBatch: vi.fn(),
      updateRoleStatus: vi.fn(),
      fetchRolePermissions,
      saveRolePermissions,
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    await page.openPermission({
      id: 5,
      name: '管理员',
      code: 'admin',
      status: 1,
      sort: 1,
      note: '',
    })

    expect(page.permissionVisible.value).toBe(true)
    expect(page.permissionTree.value).toHaveLength(1)
    expect(page.permissionTree.value[0].children).toHaveLength(2)

    await page.savePermissions([1, 2])

    expect(saveRolePermissions).toHaveBeenCalledWith(5, [1, 2])
    expect(page.permissionVisible.value).toBe(false)
  })
})
