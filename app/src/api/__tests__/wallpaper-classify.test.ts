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
  createWallpaperClassify,
  deleteWallpaperClassify,
  fetchWallpaperClassifyList,
  updateWallpaperClassify,
} from '../wallpaper-classify'

describe('wallpaper classify api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads wallpaper classify list with name filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, name: '默认分类' }],
        count: 3,
      },
    } as never)

    const result = await fetchWallpaperClassifyList(
      {
        name: '默认',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/wallpaper-classify/index', {
      params: {
        name: '默认',
        page: 2,
      },
    })
    expect(result.meta.total).toBe(3)
  })

  it('omits blank wallpaper classify name filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchWallpaperClassifyList(
      {
        name: '   ',
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/wallpaper-classify/index', {
      params: {
        name: undefined,
        page: 1,
      },
    })
  })

  it('creates wallpaper classify with serialized payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 8 },
      },
    } as never)

    await createWallpaperClassify({
      name: ' 风景 ',
      picUrl: ' https://img.example.com/cover.jpg ',
      select: true,
      sort: 5,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/wallpaper-classify/add', {
      name: '风景',
      picUrl: 'https://img.example.com/cover.jpg',
      select: true,
      sort: 5,
    })
  })

  it('normalizes signed wallpaper classify pic url before update', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 10 },
      },
    } as never)

    await updateWallpaperClassify(10, {
      name: '签名回写测试',
      picUrl: 'https://cdn.chouy.xyz/https://img.example.com/cover.jpg?e=1775033470&token=abc123',
      select: true,
      sort: 7,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/wallpaper-classify/10', {
      name: '签名回写测试',
      picUrl: 'https://img.example.com/cover.jpg',
      select: true,
      sort: 7,
    })
  })

  it('updates and deletes wallpaper classify by id', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 9 },
      },
    } as never)
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await updateWallpaperClassify(9, {
      name: '简约',
      picUrl: 'https://img.example.com/simple.jpg',
      select: false,
      sort: 3,
    })
    await deleteWallpaperClassify(9)

    expect(apiClient.post).toHaveBeenCalledWith('/wallpaper-classify/9', {
      name: '简约',
      picUrl: 'https://img.example.com/simple.jpg',
      select: false,
      sort: 3,
    })
    expect(apiClient.delete).toHaveBeenCalledWith('/wallpaper-classify/9')
  })
})
