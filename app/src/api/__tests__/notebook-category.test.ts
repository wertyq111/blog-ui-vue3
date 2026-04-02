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
  createNotebookCategory,
  deleteNotebookCategory,
  fetchNotebookCategoryList,
  updateNotebookCategory,
} from '../notebook-category'

describe('notebook category api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads list with flat name query and page param', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, name: '技术' }],
        count: 11,
      },
    } as never)

    const result = await fetchNotebookCategoryList(
      {
        name: '技术',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/categories/index', {
      params: {
        name: '技术',
        page: 2,
      },
    })
    expect(result.items).toEqual([{ id: 1, name: '技术' }])
    expect(result.meta.total).toBe(11)
  })

  it('omits blank search value', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchNotebookCategoryList(
      {
        name: '   ',
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/categories/index', {
      params: {
        name: undefined,
        page: 1,
      },
    })
  })

  it('creates category with serialized form payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 3,
        },
      },
    } as never)

    await createNotebookCategory({
      name: ' 技术 ',
      description: ' 编程经验 ',
      priority: 10,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/categories/add', {
      name: '技术',
      description: '编程经验',
      priority: 10,
    })
  })

  it('updates category on resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 4,
        },
      },
    } as never)

    await updateNotebookCategory(4, {
      name: '生活',
      description: '日常记录',
      priority: 1,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/categories/4', {
      name: '生活',
      description: '日常记录',
      priority: 1,
    })
  })

  it('falls back description to name when description is blank', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 5,
        },
      },
    } as never)

    await createNotebookCategory({
      name: ' 读书 ',
      description: '   ',
      priority: 0,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/categories/add', {
      name: '读书',
      description: '读书',
      priority: 0,
    })
  })

  it('deletes category on resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteNotebookCategory(8)

    expect(apiClient.delete).toHaveBeenCalledWith('/categories/8')
  })
})
