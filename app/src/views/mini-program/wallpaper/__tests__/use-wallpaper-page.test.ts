import { describe, expect, it, vi } from 'vitest'

import type { WallpaperRow } from '@/types/wallpaper'

import { useWallpaperPage } from '../use-wallpaper-page'

function createListResponse(items: WallpaperRow[]) {
  return {
    items,
    meta: {
      currentPage: 1,
      perPage: 10,
      total: items.length,
      lastPage: 1,
    },
  }
}

describe('useWallpaperPage', () => {
  it('loads classify options and maps values for edit form', async () => {
    const fetchClassifies = vi.fn().mockResolvedValue([{ id: 2, name: '风景' }])
    const page = useWallpaperPage({
      fetchWallpapers: vi.fn().mockResolvedValue(createListResponse([])),
      fetchClassifies,
      createWallpaper: vi.fn(),
      updateWallpaper: vi.fn(),
      deleteWallpaper: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.reloadClassifyOptions()
    page.openEdit({
      id: 8,
      classId: 2,
      nickname: 'tester',
      url: 'https://img.example.com/origin.jpg',
      smallPicUrl: 'https://img.example.com/small.jpg',
      description: '描述',
      tags: '["风景"]',
      score: 4,
    })

    expect(fetchClassifies).toHaveBeenCalledTimes(1)
    expect(page.classifyOptions.value).toEqual([{ id: 2, name: '风景' }])
    expect(page.dialog.value.value.tags).toEqual(['风景'])
    expect(page.dialog.value.value.score).toBe(4)
  })

  it('creates wallpaper and reloads list after submit', async () => {
    const fetchWallpapers = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(createListResponse([{ id: 1, nickname: '发布者' }]))
    const createWallpaper = vi.fn().mockResolvedValue({ id: 1, nickname: '发布者' })
    const showSuccess = vi.fn()

    const page = useWallpaperPage({
      fetchWallpapers,
      fetchClassifies: vi.fn().mockResolvedValue([]),
      createWallpaper,
      updateWallpaper: vi.fn(),
      deleteWallpaper: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value = {
      classId: 3,
      nickname: '发布者',
      url: 'https://img.example.com/origin.jpg',
      smallPicUrl: 'https://img.example.com/small.jpg',
      description: '封面',
      tags: ['风景'],
      score: 5,
    }

    await page.submitDialog()

    expect(createWallpaper).toHaveBeenCalledWith({
      classId: 3,
      nickname: '发布者',
      url: 'https://img.example.com/origin.jpg',
      smallPicUrl: 'https://img.example.com/small.jpg',
      description: '封面',
      tags: ['风景'],
      score: 5,
    })
    expect(showSuccess).toHaveBeenCalledWith('壁纸保存成功')
    expect(page.dialog.visible.value).toBe(false)
    expect(fetchWallpapers).toHaveBeenCalledTimes(2)
  })

  it('removes wallpaper through confirm flow and reloads list', async () => {
    const deleteWallpaper = vi.fn().mockResolvedValue(undefined)
    const confirmWarning = vi.fn().mockResolvedValue(undefined)
    const fetchWallpapers = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([{ id: 7, nickname: 'old' }]))
      .mockResolvedValueOnce(createListResponse([]))

    const page = useWallpaperPage({
      fetchWallpapers,
      fetchClassifies: vi.fn().mockResolvedValue([]),
      createWallpaper: vi.fn(),
      updateWallpaper: vi.fn(),
      deleteWallpaper,
      confirmWarning,
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.removeWallpaper({
      id: 7,
      nickname: 'old',
    })

    expect(confirmWarning).toHaveBeenCalledWith('确定要删除此壁纸吗？')
    expect(deleteWallpaper).toHaveBeenCalledWith(7)
    expect(fetchWallpapers).toHaveBeenCalledTimes(2)
  })
})
