import { describe, expect, it, vi } from 'vitest'

import type { WallpaperClassifyRow } from '@/types/wallpaper-classify'

import { useWallpaperClassifyPage } from '../use-wallpaper-classify-page'

function createListResponse(items: WallpaperClassifyRow[]) {
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

describe('useWallpaperClassifyPage', () => {
  it('opens edit dialog and maps row fields to form state', () => {
    const page = useWallpaperClassifyPage({
      fetchClassifies: vi.fn().mockResolvedValue(createListResponse([])),
      createClassify: vi.fn(),
      updateClassify: vi.fn(),
      deleteClassify: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    page.openEdit({
      id: 6,
      name: '风景',
      picUrl: 'https://img.example.com/a.jpg',
      select: true,
      sort: 3,
    })

    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.isEditing.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 6,
      name: '风景',
      picUrl: 'https://img.example.com/a.jpg',
      select: true,
      sort: 3,
    })
  })

  it('creates classify, closes dialog and reloads list on success', async () => {
    const fetchClassifies = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(createListResponse([{ id: 1, name: '默认分类' }]))
    const createClassify = vi.fn().mockResolvedValue({ id: 1, name: '默认分类' })
    const showSuccess = vi.fn()

    const page = useWallpaperClassifyPage({
      fetchClassifies,
      createClassify,
      updateClassify: vi.fn(),
      deleteClassify: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value = {
      name: '默认分类',
      picUrl: 'https://img.example.com/default.jpg',
      select: false,
      sort: 0,
    }

    await page.submitDialog()

    expect(createClassify).toHaveBeenCalledWith({
      name: '默认分类',
      picUrl: 'https://img.example.com/default.jpg',
      select: false,
      sort: 0,
    })
    expect(showSuccess).toHaveBeenCalledWith('壁纸分类保存成功')
    expect(page.dialog.visible.value).toBe(false)
    expect(fetchClassifies).toHaveBeenCalledTimes(2)
  })

  it('removes classify through confirm flow and reloads list', async () => {
    const deleteClassify = vi.fn().mockResolvedValue(undefined)
    const confirmWarning = vi.fn().mockResolvedValue(undefined)
    const fetchClassifies = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([{ id: 7, name: '待删除分类' }]))
      .mockResolvedValueOnce(createListResponse([]))

    const page = useWallpaperClassifyPage({
      fetchClassifies,
      createClassify: vi.fn(),
      updateClassify: vi.fn(),
      deleteClassify,
      confirmWarning,
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.removeClassify({
      id: 7,
      name: '待删除分类',
    })

    expect(confirmWarning).toHaveBeenCalledWith('确定要删除此壁纸分类吗？')
    expect(deleteClassify).toHaveBeenCalledWith(7)
    expect(fetchClassifies).toHaveBeenCalledTimes(2)
  })
})
