import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/api/client'

import {
  createSystemRole,
  deleteSystemRole,
  deleteSystemRoleBatch,
  fetchSystemRoleList,
  fetchSystemRolePermissionList,
  saveSystemRolePermissionList,
  updateSystemRole,
  updateSystemRoleStatus,
} from '../system-role'

describe('system role api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads role list by current backend role index endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, name: '管理员' }],
        count: 3,
      },
    } as never)

    const result = await fetchSystemRoleList(
      {
        name: '管理',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/role/index', {
      params: {
        name: '管理',
        page: 2,
      },
    })
    expect(result.meta.total).toBe(3)
  })

  it('omits blank role name filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchSystemRoleList(
      {
        name: '   ',
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/role/index', {
      params: {
        name: undefined,
        page: 1,
      },
    })
  })

  it('creates role with current add contract', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 3 },
      },
    } as never)

    await createSystemRole({
      name: ' 编辑 ',
      code: ' editor ',
      status: 1,
      sort: 10,
      note: ' 内容编辑 ',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/role/add', {
      name: '编辑',
      code: 'editor',
      status: 1,
      sort: 10,
      note: '内容编辑',
    })
  })

  it('updates role on resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 8 },
      },
    } as never)

    await updateSystemRole(8, {
      name: '审核',
      code: 'reviewer',
      status: 2,
      sort: 20,
      note: '审核角色',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/role/8', {
      name: '审核',
      code: 'reviewer',
      status: 2,
      sort: 20,
      note: '审核角色',
    })
  })

  it('updates role status with role status endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 9, status: false },
      },
    } as never)

    await expect(updateSystemRoleStatus(9, 2)).resolves.toMatchObject({
      id: 9,
      status: 2,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/role/status/9', {
      id: 9,
      status: false,
    })
  })

  it('deletes role with role resource endpoint', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteSystemRole(7)

    expect(apiClient.delete).toHaveBeenCalledWith('/role/7')
  })

  it('deletes roles in batch with id array payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({} as never)

    await deleteSystemRoleBatch([1, 2, 3])

    expect(apiClient.post).toHaveBeenCalledWith('/role/batchDelete', {
      id: [1, 2, 3],
    })
  })

  it('loads and saves role permission list on permission endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [{ id: 1, pid: 0, title: '系统管理', checked: true }],
    } as never)
    vi.mocked(apiClient.post).mockResolvedValue({} as never)

    await expect(fetchSystemRolePermissionList(5)).resolves.toEqual([
      { id: 1, pid: 0, title: '系统管理', checked: true },
    ])

    await saveSystemRolePermissionList(5, [1, 2])

    expect(apiClient.get).toHaveBeenCalledWith('/role/permission/5')
    expect(apiClient.post).toHaveBeenCalledWith('/role/permission/5', {
      menu_id: [1, 2],
    })
  })
})
