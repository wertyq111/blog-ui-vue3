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
  batchDeleteMemberLevel,
  createMemberLevel,
  deleteMemberLevel,
  fetchMemberLevelList,
  updateMemberLevel,
} from '../member-level'

describe('member level api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the current backend list endpoint with flat name filters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 3,
            name: '白银会员',
            sort: 20,
          },
        ],
        count: 1,
      },
    } as never)

    const result = await fetchMemberLevelList(
      {
        name: '白银',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/member-level/index', {
      params: {
        name: '白银',
        page: 2,
      },
    })
    expect(result.items).toEqual([
      {
        id: 3,
        name: '白银会员',
        sort: 20,
      },
    ])
  })

  it('omits blank name filters for the member level list endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchMemberLevelList(
      {
        name: '   ',
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/member-level/index', {
      params: {
        name: undefined,
        page: 1,
      },
    })
  })

  it('creates member levels on the verified add path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 9,
          name: '黄金会员',
          sort: 30,
        },
      },
    } as never)

    await createMemberLevel({
      name: '黄金会员',
      sort: 30,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/member-level/add', {
      name: '黄金会员',
      sort: 30,
    })
  })

  it('updates member levels on the verified resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 5,
          name: '钻石会员',
          sort: 50,
        },
      },
    } as never)

    await updateMemberLevel(5, {
      id: 5,
      name: '钻石会员',
      sort: 50,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/member-level/5', {
      name: '钻石会员',
      sort: 50,
    })
  })

  it('deletes member levels on the verified resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteMemberLevel(7)

    expect(apiClient.delete).toHaveBeenCalledWith('/member-level/7')
  })

  it('batch deletes member levels through the backend batchDelete path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await batchDeleteMemberLevel([3, 5])

    expect(apiClient.delete).toHaveBeenCalledWith('/member-level/batchDelete', {
      params: {
        id: [3, 5],
      },
    })
  })
})
