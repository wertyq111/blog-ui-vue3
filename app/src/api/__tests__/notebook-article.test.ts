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
  createNotebookArticle,
  deleteNotebookArticle,
  fetchNotebookArticleCategoryOptions,
  fetchNotebookArticleList,
  updateNotebookArticle,
} from '../notebook-article'

describe('notebook article api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads article list with include and filters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, title: '文章 A' }],
        count: 3,
      },
    } as never)

    const result = await fetchNotebookArticleList(
      {
        title: '文章',
        categoryId: 2,
        labelId: 5,
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/articles/index', {
      params: {
        include: 'member,category,label',
        title: '文章',
        categoryId: 2,
        labelId: 5,
        page: 2,
      },
    })
    expect(result.meta.total).toBe(3)
  })

  it('omits empty filters when query values are blank', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
        count: 0,
      },
    } as never)

    await fetchNotebookArticleList(
      {
        title: '   ',
        categoryId: '',
        labelId: '',
      },
      {
        page: 1,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/articles/index', {
      params: {
        include: 'member,category,label',
        title: undefined,
        categoryId: undefined,
        labelId: undefined,
        page: 1,
      },
    })
  })

  it('loads category options with labels', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, name: '分类 A', labels: [{ id: 9, name: '标签 A' }] }],
        count: 1,
      },
    } as never)

    await expect(fetchNotebookArticleCategoryOptions()).resolves.toEqual([
      { id: 1, name: '分类 A', labels: [{ id: 9, name: '标签 A' }] },
    ])

    expect(apiClient.get).toHaveBeenCalledWith('/categories/list', {
      params: {
        include: 'labels',
        perPage: 200,
      },
    })
  })

  it('creates article with serialized payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 10 },
      },
    } as never)

    await createNotebookArticle({
      title: ' 标题 ',
      content: ' 内容 ',
      cover: ' https://img.example.com/cover.jpg ',
      categoryId: 1,
      labelId: '',
      viewStatus: true,
      commentStatus: true,
      recommendStatus: false,
      password: ' ',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/articles/add', {
      title: '标题',
      content: '内容',
      cover: 'https://img.example.com/cover.jpg',
      categoryId: 1,
      labelId: undefined,
      viewStatus: true,
      commentStatus: true,
      recommendStatus: false,
      password: '',
    })
  })

  it('updates and deletes article by id', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 12 },
      },
    } as never)
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await updateNotebookArticle(12, {
      title: '更新',
      content: '更新内容',
      cover: '',
      categoryId: 2,
      labelId: 3,
      viewStatus: false,
      commentStatus: false,
      recommendStatus: true,
      password: '123456',
    })
    await deleteNotebookArticle(12)

    expect(apiClient.post).toHaveBeenCalledWith('/articles/12', {
      title: '更新',
      content: '更新内容',
      cover: '',
      categoryId: 2,
      labelId: 3,
      viewStatus: false,
      commentStatus: false,
      recommendStatus: true,
      password: '123456',
    })
    expect(apiClient.delete).toHaveBeenCalledWith('/articles/12')
  })
})
