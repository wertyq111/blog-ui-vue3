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
  createPhotoCategory,
  deletePhotoCategory,
  fetchPhotoCategoryList,
  updatePhotoCategory,
} from '../photo-category'

describe('photo category api', () => {
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
            name: '旅行相册',
          },
        ],
        count: 1,
      },
    } as never)

    const result = await fetchPhotoCategoryList(
      {
        name: '旅行',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/photo-categories/index', {
      params: {
        name: '旅行',
        page: 2,
      },
    })
    expect(result.items).toEqual([
      {
        id: 3,
        name: '旅行相册',
      },
    ])
  })

  it('omits blank name filters for the photo category list endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchPhotoCategoryList(
      {
        name: '   ',
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/photo-categories/index', {
      params: {
        name: undefined,
        page: 1,
      },
    })
  })

  it('creates photo categories on the verified add path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 9,
          name: '新相册',
        },
      },
    } as never)

    await createPhotoCategory({
      name: '新相册',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/photo-categories/add', {
      name: '新相册',
    })
  })

  it('updates photo categories on the verified resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 5,
          name: '已改名相册',
        },
      },
    } as never)

    await updatePhotoCategory(5, {
      id: 5,
      name: '已改名相册',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/photo-categories/5', {
      name: '已改名相册',
    })
  })

  it('deletes photo categories on the backend plural resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deletePhotoCategory(7)

    expect(apiClient.delete).toHaveBeenCalledWith('/photo-categories/7')
  })
})
