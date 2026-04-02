import { describe, expect, it, vi } from 'vitest'

import { useNotebookCategoryPage } from '../use-notebook-category-page'

describe('useNotebookCategoryPage', () => {
  it('loads list and maps backend collection payload', async () => {
    const page = useNotebookCategoryPage({
      fetchCategories: vi.fn().mockResolvedValue({
        items: [{ id: 1, name: '技术' }],
        meta: {
          currentPage: 1,
          perPage: 10,
          total: 1,
          lastPage: 1,
        },
      }),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()

    expect(page.list.items.value).toEqual([{ id: 1, name: '技术' }])
    expect(page.list.meta.value.total).toBe(1)
  })

  it('creates category on submit when dialog has no source row', async () => {
    const createCategory = vi.fn().mockResolvedValue({
      id: 2,
      name: '生活',
    })
    const showSuccess = vi.fn()
    const page = useNotebookCategoryPage({
      fetchCategories: vi.fn().mockResolvedValue({
        items: [],
        meta: {
          currentPage: 1,
          perPage: 10,
          total: 0,
          lastPage: 1,
        },
      }),
      createCategory,
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    page.dialog.openCreate()
    page.dialog.value.value = {
      name: '生活',
      description: '日常',
      priority: 1,
    }

    await page.submitDialog()

    expect(createCategory).toHaveBeenCalledWith({
      name: '生活',
      description: '日常',
      priority: 1,
    })
    expect(showSuccess).toHaveBeenCalledWith('分类保存成功')
  })

  it('confirms and deletes category', async () => {
    const deleteCategory = vi.fn().mockResolvedValue(undefined)
    const confirmWarning = vi.fn().mockResolvedValue(undefined)
    const showSuccess = vi.fn()
    const page = useNotebookCategoryPage({
      fetchCategories: vi.fn().mockResolvedValue({
        items: [],
        meta: {
          currentPage: 1,
          perPage: 10,
          total: 0,
          lastPage: 1,
        },
      }),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory,
      confirmWarning,
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.removeCategory({
      id: 9,
      name: '待删除分类',
    })

    expect(confirmWarning).toHaveBeenCalledWith('确定要删除此分类吗？')
    expect(deleteCategory).toHaveBeenCalledWith(9)
    expect(showSuccess).toHaveBeenCalledWith('分类删除成功')
  })
})
