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
  createWorkPlatform,
  deleteWorkPlatform,
  fetchWorkPlatformDetail,
  fetchWorkPlatformList,
  reorderWorkPlatform,
  updateWorkPlatform,
} from '../work-platform'

describe('work platform api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the current backend list endpoint with flat name and status filters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 3,
            name: 'Blog',
            status: 1,
            sort: 10,
          },
        ],
        count: 1,
      },
    } as never)

    const result = await fetchWorkPlatformList(
      {
        name: ' Blog ',
        status: 1,
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/work-platform/index', {
      params: {
        name: 'Blog',
        status: 1,
        page: 2,
        limit: 10,
      },
    })
    expect(result.items).toEqual([
      {
        id: 3,
        name: 'Blog',
        status: 1,
        sort: 10,
      },
    ])
  })

  it('fetches work platform detail from the resource endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 3,
          name: 'Blog',
          status: 1,
          sort: 10,
        },
      },
    } as never)

    const result = await fetchWorkPlatformDetail(3)

    expect(apiClient.get).toHaveBeenCalledWith('/work-platform/3')
    expect(result).toEqual({
      id: 3,
      name: 'Blog',
      status: 1,
      sort: 10,
    })
  })

  it('creates work platforms on the verified add path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 3,
          name: 'Blog',
          status: 1,
          sort: 10,
        },
      },
    } as never)

    await createWorkPlatform({
      name: ' Blog ',
      status: 1,
      sort: 10,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/work-platform/add', {
      name: 'Blog',
      status: 1,
      sort: 10,
    })
  })

  it('updates work platforms on the verified resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 3,
          name: 'Blog Updated',
          status: 0,
          sort: 20,
        },
      },
    } as never)

    await updateWorkPlatform(3, {
      id: 3,
      name: 'Blog Updated',
      status: 0,
      sort: 20,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/work-platform/3', {
      name: 'Blog Updated',
      status: 0,
      sort: 20,
    })
  })

  it('saves reordered work platforms through the reorder endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        msg: '排序已保存',
      },
    } as never)

    await reorderWorkPlatform([
      { id: 3, sort: 10 },
      { id: 7, sort: 20 },
    ])

    expect(apiClient.post).toHaveBeenCalledWith('/work-platform/reorder', {
      order: [
        { id: 3, sort: 10 },
        { id: 7, sort: 20 },
      ],
    })
  })

  it('deletes work platforms on the backend resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteWorkPlatform(3)

    expect(apiClient.delete).toHaveBeenCalledWith('/work-platform/3')
  })
})
