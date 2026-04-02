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
  createPhoto,
  deletePhoto,
  deletePhotoBatch,
  fetchPhotoCategoryOptions,
  fetchPhotoList,
  updatePhoto,
} from '../photo'

describe('photo api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads photo list with include filters and current page', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, remark: '封面图' }],
        count: 2,
      },
    } as never)

    const result = await fetchPhotoList(
      {
        categoryId: 9,
        remark: '封面',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/photo/index', {
      params: {
        include: 'category,member',
        categoryId: 9,
        remark: '封面',
        page: 2,
      },
    })
    expect(result.meta.total).toBe(2)
  })

  it('omits blank remark and empty category filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchPhotoList(
      {
        categoryId: '',
        remark: '   ',
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/photo/index', {
      params: {
        include: 'category,member',
        categoryId: undefined,
        remark: undefined,
        page: 1,
      },
    })
  })

  it('loads photo category options from list endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, name: '默认相册' }],
      },
    } as never)

    await expect(fetchPhotoCategoryOptions()).resolves.toEqual([{ id: 1, name: '默认相册' }])
    expect(apiClient.get).toHaveBeenCalledWith('/photo-categories/list')
  })

  it('falls back to empty array when category list response has no data field', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        msg: '操作成功',
      },
    } as never)

    await expect(fetchPhotoCategoryOptions()).resolves.toEqual([])
  })

  it('creates photo with serialized payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 11 },
      },
    } as never)

    await createPhoto({
      categoryId: 3,
      url: ' https://img.example.com/cover.jpg ',
      remark: ' 首图 ',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/photo/add', {
      categoryId: 3,
      url: 'https://img.example.com/cover.jpg',
      remark: '首图',
    })
  })

  it('updates photo by id endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 12 },
      },
    } as never)

    await updatePhoto(12, {
      categoryId: 5,
      url: 'https://img.example.com/detail.jpg',
      remark: '详情图',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/photo/12', {
      categoryId: 5,
      url: 'https://img.example.com/detail.jpg',
      remark: '详情图',
    })
  })

  it('deletes photo and batch deletes photos by ids', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deletePhoto(5)
    await deletePhotoBatch([5, 6])

    expect(apiClient.delete).toHaveBeenNthCalledWith(1, '/photo/5')
    expect(apiClient.delete).toHaveBeenNthCalledWith(2, '/photo/batch-delete', {
      params: {
        id: [5, 6],
      },
    })
  })
})
