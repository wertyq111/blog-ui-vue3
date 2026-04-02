import { describe, expect, it, vi } from 'vitest'

import { useNotebookLabelPage } from '../use-notebook-label-page'

describe('useNotebookLabelPage', () => {
  it('loads list and maps returned rows', async () => {
    const page = useNotebookLabelPage({
      fetchLabels: vi.fn().mockResolvedValue({
        items: [
          {
            id: 1,
            name: '前端',
            category: { id: 2, name: '技术' },
          },
        ],
        meta: {
          currentPage: 1,
          perPage: 10,
          total: 1,
          lastPage: 1,
        },
      }),
      fetchCategoryOptions: vi.fn().mockResolvedValue([]),
      createLabel: vi.fn(),
      updateLabel: vi.fn(),
      deleteLabel: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()

    expect(page.list.items.value[0]?.name).toBe('前端')
    expect(page.list.meta.value.total).toBe(1)
  })

  it('loads category options before opening create dialog', async () => {
    const fetchCategoryOptions = vi.fn().mockResolvedValue([{ id: 2, name: '技术' }])
    const page = useNotebookLabelPage({
      fetchLabels: vi.fn().mockResolvedValue({
        items: [],
        meta: {
          currentPage: 1,
          perPage: 10,
          total: 0,
          lastPage: 1,
        },
      }),
      fetchCategoryOptions,
      createLabel: vi.fn(),
      updateLabel: vi.fn(),
      deleteLabel: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openCreate()

    expect(fetchCategoryOptions).toHaveBeenCalledTimes(1)
    expect(page.categoryOptions.value).toEqual([{ id: 2, name: '技术' }])
    expect(page.dialog.visible.value).toBe(true)
  })

  it('submits create flow and handles delete flow', async () => {
    const createLabel = vi.fn().mockResolvedValue({
      id: 3,
      name: '后端',
    })
    const deleteLabel = vi.fn().mockResolvedValue(undefined)
    const confirmWarning = vi.fn().mockResolvedValue(undefined)
    const showSuccess = vi.fn()

    const page = useNotebookLabelPage({
      fetchLabels: vi.fn().mockResolvedValue({
        items: [],
        meta: {
          currentPage: 1,
          perPage: 10,
          total: 0,
          lastPage: 1,
        },
      }),
      fetchCategoryOptions: vi.fn().mockResolvedValue([{ id: 2, name: '技术' }]),
      createLabel,
      updateLabel: vi.fn(),
      deleteLabel,
      confirmWarning,
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openCreate()
    page.dialog.value.value = {
      categoryId: 2,
      name: '后端',
      description: 'PHP',
    }
    await page.submitDialog()

    expect(createLabel).toHaveBeenCalledWith({
      categoryId: 2,
      name: '后端',
      description: 'PHP',
    })
    expect(showSuccess).toHaveBeenCalledWith('标签保存成功')

    await page.removeLabel({
      id: 3,
      name: '后端',
    })

    expect(confirmWarning).toHaveBeenCalledWith('确定要删除此标签吗？')
    expect(deleteLabel).toHaveBeenCalledWith(3)
    expect(showSuccess).toHaveBeenCalledWith('标签删除成功')
  })
})
