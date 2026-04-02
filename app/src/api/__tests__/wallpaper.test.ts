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
  createWallpaper,
  deleteWallpaper,
  fetchWallpaperClassifyOptions,
  fetchWallpaperList,
  updateWallpaper,
} from '../wallpaper'

describe('wallpaper api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads wallpaper list with class and nickname filters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, nickname: 'tester' }],
        count: 2,
      },
    } as never)

    await fetchWallpaperList(
      {
        classId: 8,
        nickname: 'zxf',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/wallpaper/index', {
      params: {
        include: 'classify',
        classId: 8,
        nickname: 'zxf',
        page: 2,
      },
    })
  })

  it('omits blank wallpaper nickname query and empty class id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchWallpaperList(
      {
        classId: '',
        nickname: '   ',
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/wallpaper/index', {
      params: {
        include: 'classify',
        classId: undefined,
        nickname: undefined,
        page: 1,
      },
    })
  })

  it('loads wallpaper classify options from wallpaper-classify list endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          { id: 1, name: '风景', select: true },
          { id: 2, name: '动漫', select: false },
        ],
      },
    } as never)

    const result = await fetchWallpaperClassifyOptions()

    expect(apiClient.get).toHaveBeenCalledWith('/wallpaper-classify/list')
    expect(result).toEqual([
      { id: 1, name: '风景' },
      { id: 2, name: '动漫' },
    ])
  })

  it('creates wallpaper with normalized payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 9 },
      },
    } as never)

    await createWallpaper({
      classId: 3,
      nickname: ' 发布者 ',
      url: 'https://cdn.chouy.xyz/https://img.example.com/origin.jpg?e=1775033470&token=abc123',
      smallPicUrl: ' https://img.example.com/thumb.jpg ',
      description: ' 海报 ',
      tags: [' 风景 ', '', '夜空'],
      score: 4.6,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/wallpaper/add', {
      classId: 3,
      nickname: '发布者',
      url: 'https://img.example.com/origin.jpg',
      smallPicUrl: 'https://img.example.com/thumb.jpg',
      description: '海报',
      tags: ['风景', '夜空'],
      score: 5,
    })
  })

  it('updates and deletes wallpaper by id', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 7 },
      },
    } as never)
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await updateWallpaper(7, {
      classId: 2,
      nickname: 'editor',
      url: 'https://img.example.com/a.jpg',
      smallPicUrl: 'https://img.example.com/a-small.jpg',
      description: '',
      tags: [],
      score: 3,
    })
    await deleteWallpaper(7)

    expect(apiClient.post).toHaveBeenCalledWith('/wallpaper/7', {
      classId: 2,
      nickname: 'editor',
      url: 'https://img.example.com/a.jpg',
      smallPicUrl: 'https://img.example.com/a-small.jpg',
      description: 'editor',
      tags: [],
      score: 3,
    })
    expect(apiClient.delete).toHaveBeenCalledWith('/wallpaper/7')
  })
})
