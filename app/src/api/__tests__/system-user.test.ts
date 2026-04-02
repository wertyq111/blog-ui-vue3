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
  checkSystemUsernameAvailable,
  createSystemUser,
  fetchCurrentSystemUserProfile,
  fetchSystemRoleOptions,
  fetchSystemUserList,
  updateCurrentSystemUserProfile,
  updateSystemUser,
} from '../system-user'

describe('system user api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps verified list filters onto the current users list endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 7,
            username: 'root',
          },
        ],
        count: 21,
      },
    } as never)

    const result = await fetchSystemUserList(
      {
        username: 'root',
        phone: '13800000000',
        status: 1,
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/users/list', {
      params: {
        include: 'roles',
        filter: {
          username: 'root',
          phone: '13800000000',
          status: 1,
        },
        page: 2,
      },
    })
    expect(result.items).toEqual([
      {
        id: 7,
        username: 'root',
      },
    ])
    expect(result.meta).toEqual({
      currentPage: 2,
      perPage: 10,
      total: 21,
      lastPage: 3,
    })
  })

  it('omits blank list filters so remote query builder receives only active constraints', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchSystemUserList(
      {
        username: '   ',
        phone: '',
        status: '',
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/users/list', {
      params: {
        include: 'roles',
        filter: {},
        page: 1,
      },
    })
  })

  it('uses the current backend add path and maps roleIds to role_ids', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 7,
        },
      },
    } as never)

    await createSystemUser({
      username: 'new-user',
      email: 'new@example.com',
      phone: '13800000000',
      password: 'secret123',
      roleIds: [1, 2],
      status: 1,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/users/add', {
      username: 'new-user',
      email: 'new@example.com',
      phone: '13800000000',
      password: 'secret123',
      role_ids: [1, 2],
      status: 1,
    })
  })

  it('updates existing users on the resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 9,
        },
      },
    } as never)

    await updateSystemUser(9, {
      username: 'editor',
      email: 'editor@example.com',
      phone: '13900000000',
      password: '',
      roleIds: [3],
      status: 2,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/users/9', {
      username: 'editor',
      email: 'editor@example.com',
      phone: '13900000000',
      password: '',
      role_ids: [3],
      status: 2,
    })
  })

  it('treats the historical username-check failure as an unavailable username', async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      response: {
        data: {
          data: {
            message: '用户已存在',
          },
        },
      },
    })

    await expect(checkSystemUsernameAvailable('taken')).resolves.toBe(false)
  })

  it('loads role options from the verified role endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 1,
            name: '管理员',
          },
        ],
      },
    } as never)

    await expect(fetchSystemRoleOptions()).resolves.toEqual([
      {
        id: 1,
        name: '管理员',
      },
    ])
    expect(apiClient.get).toHaveBeenCalledWith('/role/getRoleList')
  })

  it('loads current user profile with member include for the info page', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 1,
          username: 'zxf',
          member: {
            nickname: '子曰',
          },
        },
      },
    } as never)

    await expect(fetchCurrentSystemUserProfile()).resolves.toMatchObject({
      id: 1,
      username: 'zxf',
    })
    expect(apiClient.get).toHaveBeenCalledWith('/users/getUserInfo', {
      params: {
        include: 'member',
      },
    })
  })

  it('serializes profile updates to the current backend updateUserInfo contract', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 1,
        },
      },
    } as never)

    await updateCurrentSystemUserProfile({
      avatar: '  avatar-key  ',
      realname: ' 周许峰 ',
      nickname: ' 子曰 ',
      gender: 1,
      email: ' zxf@example.com ',
      mobile: ' 13800000000 ',
      address: ' 杭州 ',
      intro: ' 你好 ',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/index/updateUserInfo', {
      avatar: 'avatar-key',
      realname: '周许峰',
      nickname: '子曰',
      gender: 1,
      email: 'zxf@example.com',
      mobile: '13800000000',
      address: '杭州',
      intro: '你好',
    })
  })
})
