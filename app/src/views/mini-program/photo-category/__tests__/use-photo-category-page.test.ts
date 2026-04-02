import { describe, expect, it, vi } from 'vitest'

import type { PhotoCategoryRow } from '@/types/photo-category'

import { usePhotoCategoryPage } from '../use-photo-category-page'

function createListResponse(items: PhotoCategoryRow[]) {
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

describe('usePhotoCategoryPage', () => {
  it('opens the edit dialog with the category name mapped into form state', () => {
    const page = usePhotoCategoryPage({
      fetchCategories: vi.fn().mockResolvedValue(createListResponse([])),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    page.openEdit({
      id: 8,
      name: '旅行相册',
    })

    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.isEditing.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 8,
      name: '旅行相册',
    })
  })

  it('creates a category, closes the dialog, and refreshes the list on success', async () => {
    const fetchCategories = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(createListResponse([{ id: 1, name: '新相册' }]))
    const createCategory = vi.fn().mockResolvedValue({
      id: 1,
      name: '新相册',
    })
    const showSuccess = vi.fn()

    const page = usePhotoCategoryPage({
      fetchCategories,
      createCategory,
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value.name = '新相册'

    await page.submitDialog()

    expect(createCategory).toHaveBeenCalledWith({
      name: '新相册',
    })
    expect(showSuccess).toHaveBeenCalledWith('相册保存成功')
    expect(page.dialog.visible.value).toBe(false)
    expect(fetchCategories).toHaveBeenCalledTimes(2)
    expect(page.list.items.value).toEqual([{ id: 1, name: '新相册' }])
  })

  it('deletes categories through the confirmed backend path and reloads the list', async () => {
    const deleteCategory = vi.fn().mockResolvedValue(undefined)
    const confirmWarning = vi.fn().mockResolvedValue(undefined)
    const fetchCategories = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([{ id: 3, name: '旧相册' }]))
      .mockResolvedValueOnce(createListResponse([]))

    const page = usePhotoCategoryPage({
      fetchCategories,
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory,
      confirmWarning,
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.removeCategory({
      id: 3,
      name: '旧相册',
    })

    expect(confirmWarning).toHaveBeenCalledWith('确定要删除此相册吗？')
    expect(deleteCategory).toHaveBeenCalledWith(3)
    expect(fetchCategories).toHaveBeenCalledTimes(2)
  })
})
