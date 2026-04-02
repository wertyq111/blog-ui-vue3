import { describe, expect, it, vi } from 'vitest'

import { usePhotoPage } from '../use-photo-page'

function createListResponse(items: unknown[], count = items.length) {
  return {
    items,
    meta: {
      currentPage: 1,
      perPage: 10,
      total: count,
      lastPage: Math.max(1, Math.ceil(count / 10)),
    },
  }
}

describe('usePhotoPage', () => {
  it('loads category options for filters and edit dialog', async () => {
    const fetchCategories = vi.fn().mockResolvedValue([{ id: 1, name: '默认相册' }])

    const page = usePhotoPage({
      fetchPhotos: vi.fn().mockResolvedValue(createListResponse([])),
      fetchCategories,
      createPhoto: vi.fn(),
      updatePhoto: vi.fn(),
      deletePhoto: vi.fn(),
      deletePhotoBatch: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    await page.reloadCategoryOptions()

    expect(fetchCategories).toHaveBeenCalled()
    expect(page.categoryOptions.value).toEqual([{ id: 1, name: '默认相册' }])
  })

  it('creates photo and reloads list after submit', async () => {
    const createPhoto = vi.fn().mockResolvedValue({ id: 8 })
    const fetchPhotos = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(
        createListResponse([
          {
            id: 8,
            remark: '封面',
          },
        ]),
      )

    const page = usePhotoPage({
      fetchPhotos,
      fetchCategories: vi.fn().mockResolvedValue([]),
      createPhoto,
      updatePhoto: vi.fn(),
      deletePhoto: vi.fn(),
      deletePhotoBatch: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value.categoryId = 5
    page.dialog.value.value.url = 'https://img.example.com/cover.jpg'
    page.dialog.value.value.remark = '封面图'

    await page.submitDialog()

    expect(createPhoto).toHaveBeenCalledWith({
      categoryId: 5,
      url: 'https://img.example.com/cover.jpg',
      remark: '封面图',
    })
    expect(page.list.items.value).toEqual([{ id: 8, remark: '封面' }])
  })

  it('removes selected photos in batch', async () => {
    const deletePhotoBatch = vi.fn().mockResolvedValue(undefined)

    const page = usePhotoPage({
      fetchPhotos: vi.fn().mockResolvedValue(createListResponse([])),
      fetchCategories: vi.fn().mockResolvedValue([]),
      createPhoto: vi.fn(),
      updatePhoto: vi.fn(),
      deletePhoto: vi.fn(),
      deletePhotoBatch,
      confirmWarning: vi.fn().mockResolvedValue(undefined),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    page.list.setSelection([
      { id: 1 },
      { id: 2 },
    ] as never)

    await page.removeBatch()

    expect(deletePhotoBatch).toHaveBeenCalledWith([1, 2])
  })
})
