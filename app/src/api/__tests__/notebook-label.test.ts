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
  createNotebookLabel,
  deleteNotebookLabel,
  fetchNotebookLabelCategoryOptions,
  fetchNotebookLabelList,
  updateNotebookLabel,
} from '../notebook-label'

describe('notebook label api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads list with include category and flat name query', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, name: '前端' }],
        count: 3,
      },
    } as never)

    const result = await fetchNotebookLabelList(
      {
        name: '前端',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/labels/index', {
      params: {
        include: 'category',
        name: '前端',
        page: 2,
      },
    })
    expect(result.meta.total).toBe(3)
  })

  it('loads category options from categories/list', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 8, name: '技术' }],
      },
    } as never)

    await expect(fetchNotebookLabelCategoryOptions()).resolves.toEqual([{ id: 8, name: '技术' }])
    expect(apiClient.get).toHaveBeenCalledWith('/categories/list')
  })

  it('creates label with categoryId contract', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 2 },
      },
    } as never)

    await createNotebookLabel({
      categoryId: 8,
      name: ' 前端 ',
      description: ' JS ',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/labels/add', {
      categoryId: 8,
      name: '前端',
      description: 'JS',
    })
  })

  it('updates label on resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 9 },
      },
    } as never)

    await updateNotebookLabel(9, {
      categoryId: 8,
      name: '后端',
      description: 'PHP',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/labels/9', {
      categoryId: 8,
      name: '后端',
      description: 'PHP',
    })
  })

  it('falls back description to name when description is blank', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 10 },
      },
    } as never)

    await createNotebookLabel({
      categoryId: 8,
      name: ' 算法 ',
      description: '   ',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/labels/add', {
      categoryId: 8,
      name: '算法',
      description: '算法',
    })
  })

  it('deletes label on resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteNotebookLabel(5)

    expect(apiClient.delete).toHaveBeenCalledWith('/labels/5')
  })
})
