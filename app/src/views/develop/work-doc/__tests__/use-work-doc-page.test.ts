import { describe, expect, it, vi } from 'vitest'

import type { WorkDocCategoryRow, WorkDocRow } from '@/types/work-doc'

import { useWorkDocPage } from '../use-work-doc-page'

function createDocListResponse(items: WorkDocRow[]) {
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

describe('useWorkDocPage', () => {
  it('initializes category tree and selects the first category for doc filtering', async () => {
    const fetchCategories = vi.fn().mockResolvedValue([
      {
        id: 3,
        parentId: 0,
        name: '开发规范',
        icon: 'el-icon-folder',
        description: '',
        sort: 10,
        status: 1,
      },
      {
        id: 5,
        parentId: 3,
        name: '接口文档',
        icon: 'el-icon-document',
        description: '',
        sort: 20,
        status: 1,
      },
    ] satisfies WorkDocCategoryRow[])
    const fetchDocs = vi.fn().mockResolvedValue(createDocListResponse([]))

    const page = useWorkDocPage({
      fetchCategories,
      fetchCategoryDetail: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      reorderCategories: vi.fn(),
      fetchDocs,
      fetchDocDetail: vi.fn(),
      createDoc: vi.fn(),
      updateDoc: vi.fn(),
      deleteDoc: vi.fn(),
      fetchPlatforms: vi.fn().mockResolvedValue([]),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.initialize()

    expect(fetchCategories).toHaveBeenCalled()
    expect(page.categoryTree.value).toHaveLength(1)
    expect(page.currentCategory.value?.id).toBe(3)
    expect(page.list.query.value.categoryId).toBe(3)
    expect(fetchDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 3,
      }),
      { page: 1, perPage: 10 },
    )
  })

  it('opens the doc edit dialog with backend detail mapped into form state', async () => {
    const fetchDocDetail = vi.fn().mockResolvedValue({
      id: 21,
      categoryId: 5,
      title: '接口幂等设计',
      content: '# 幂等设计',
      templateType: 'design',
      tags: ['接口', '幂等'],
      status: 1,
      priority: 8,
      source: 'Blog Admin',
      isPin: 1,
    } satisfies WorkDocRow)

    const page = useWorkDocPage({
      fetchCategories: vi.fn().mockResolvedValue([]),
      fetchCategoryDetail: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      reorderCategories: vi.fn(),
      fetchDocs: vi.fn().mockResolvedValue(createDocListResponse([])),
      fetchDocDetail,
      createDoc: vi.fn(),
      updateDoc: vi.fn(),
      deleteDoc: vi.fn(),
      fetchPlatforms: vi.fn().mockResolvedValue([]),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openEditDoc({
      id: 21,
      categoryId: 5,
      title: '',
      content: '',
      templateType: '',
      tags: [],
      status: 1,
      priority: 0,
      source: '',
      isPin: 0,
    })

    expect(fetchDocDetail).toHaveBeenCalledWith(21)
    expect(page.docDialog.visible.value).toBe(true)
    expect(page.docDialog.value.value).toEqual({
      id: 21,
      categoryId: 5,
      title: '接口幂等设计',
      content: '# 幂等设计',
      templateType: 'design',
      tags: ['接口', '幂等'],
      status: 1,
      priority: 8,
      source: 'Blog Admin',
      isPin: 1,
    })
  })

  it('saves category reorder payload and reloads categories afterwards', async () => {
    const reorderCategories = vi.fn().mockResolvedValue(undefined)
    const fetchCategories = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: 3,
          parentId: 0,
          name: '开发规范',
          icon: '',
          description: '',
          sort: 10,
          status: 1,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 3,
          parentId: 0,
          name: '开发规范',
          icon: '',
          description: '',
          sort: 20,
          status: 1,
        },
      ])

    const page = useWorkDocPage({
      fetchCategories,
      fetchCategoryDetail: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      reorderCategories,
      fetchDocs: vi.fn().mockResolvedValue(createDocListResponse([])),
      fetchDocDetail: vi.fn(),
      createDoc: vi.fn(),
      updateDoc: vi.fn(),
      deleteDoc: vi.fn(),
      fetchPlatforms: vi.fn().mockResolvedValue([]),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.initialize()
    await page.saveCategoryOrder([
      { id: 3, parentId: 0, sort: 20 },
    ])

    expect(reorderCategories).toHaveBeenCalledWith([
      { id: 3, parentId: 0, sort: 20 },
    ])
    expect(fetchCategories).toHaveBeenCalledTimes(2)
  })

  it('deletes a doc after confirmation and reloads the list', async () => {
    const deleteDoc = vi.fn().mockResolvedValue(undefined)
    const fetchDocs = vi
      .fn()
      .mockResolvedValueOnce(
        createDocListResponse([
          {
            id: 21,
            categoryId: 5,
            title: '接口幂等设计',
            content: '# 幂等设计',
            templateType: 'design',
            tags: ['接口'],
            status: 1,
            priority: 8,
            source: 'Blog Admin',
            isPin: 1,
          },
        ]),
      )
      .mockResolvedValueOnce(createDocListResponse([]))

    const page = useWorkDocPage({
      fetchCategories: vi.fn().mockResolvedValue([]),
      fetchCategoryDetail: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      reorderCategories: vi.fn(),
      fetchDocs,
      fetchDocDetail: vi.fn(),
      createDoc: vi.fn(),
      updateDoc: vi.fn(),
      deleteDoc,
      fetchPlatforms: vi.fn().mockResolvedValue([]),
      confirmWarning: vi.fn().mockResolvedValue(undefined),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.removeDoc({
      id: 21,
      categoryId: 5,
      title: '接口幂等设计',
      content: '# 幂等设计',
      templateType: 'design',
      tags: ['接口'],
      status: 1,
      priority: 8,
      source: 'Blog Admin',
      isPin: 1,
    })

    expect(deleteDoc).toHaveBeenCalledWith(21)
    expect(page.list.items.value).toEqual([])
  })
})
