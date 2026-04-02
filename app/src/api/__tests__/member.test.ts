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
  deleteMember,
  fetchMemberLevelOptions,
  fetchMemberList,
  updateMember,
  updateMemberStatus,
} from '../member'

describe('member api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the members list endpoint with include and flat query params', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 3,
            nickname: '测试会员',
            gender: 1,
            user: {
              id: 9,
              username: 'member_user',
            },
          },
        ],
        count: 1,
      },
    } as never)

    const result = await fetchMemberList(
      {
        username: 'member',
        nickname: '测试',
        gender: '1',
        include: ['user'],
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/members/index', {
      params: {
        include: ['user'],
        username: 'member',
        nickname: '测试',
        gender: '1',
        page: 2,
      },
    })
    expect(result.items[0]).toMatchObject({
      id: 3,
      nickname: '测试会员',
      gender: 1,
      userId: 9,
    })
  })

  it('omits blank member filters while preserving include params', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchMemberList(
      {
        username: '   ',
        nickname: ' ',
        gender: '',
        include: ['user'],
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/members/index', {
      params: {
        include: ['user'],
        username: undefined,
        nickname: undefined,
        gender: undefined,
        page: 1,
      },
    })
  })

  it('loads member level options from the verified list path', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 1,
            name: '青铜',
          },
        ],
      },
    } as never)

    await fetchMemberLevelOptions()

    expect(apiClient.get).toHaveBeenCalledWith('/member-level/list')
  })

  it('updates members on the verified resource path with normalized payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 5,
          nickname: '编辑后昵称',
          birthday: 652089600,
        },
      },
    } as never)

    await updateMember(5, {
      id: 5,
      userId: 7,
      username: 'member_user',
      memberLevel: 1,
      realname: '测试会员',
      nickname: '编辑后昵称',
      gender: 1,
      avatar: '',
      birthday: '1990-09-12',
      city: ['330000', '330100', '330106'],
      address: '西湖区',
      intro: '',
      signature: '',
      device: 5,
      source: 2,
      status: 1,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/members/5', {
      id: 5,
      userId: 7,
      memberLevel: 1,
      realname: '测试会员',
      nickname: '编辑后昵称',
      gender: 1,
      avatar: '',
      birthday: '1990-09-12',
      city: ['330000', '330100', '330106'],
      address: '西湖区',
      intro: null,
      signature: null,
      device: 5,
      source: 2,
      status: 1,
      appVersion: '',
    })
  })

  it('updates member status on the verified status path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 5,
          status: 2,
        },
      },
    } as never)

    await updateMemberStatus(5, 2)

    expect(apiClient.post).toHaveBeenCalledWith('/members/status/5', {
      status: 2,
    })
  })

  it('deletes members on the verified delete path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteMember(7)

    expect(apiClient.delete).toHaveBeenCalledWith('/members/7')
  })
})
