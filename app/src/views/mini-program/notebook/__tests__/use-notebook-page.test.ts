import { describe, expect, it, vi } from 'vitest'

import { useNotebookPage } from '../use-notebook-page'

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

describe('useNotebookPage', () => {
  it('loads category options and label linkage for selected category', async () => {
    const page = useNotebookPage({
      fetchArticles: vi.fn().mockResolvedValue(createListResponse([])),
      fetchCategories: vi.fn().mockResolvedValue([
        {
          id: 1,
          name: '分类 A',
          labels: [{ id: 11, name: '标签 A' }],
        },
      ]),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticle: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    await page.reloadCategoryOptions()
    page.openCreate()
    page.handleCategoryChange(1)

    expect(page.currentLabelOptions.value).toEqual([{ id: 11, name: '标签 A' }])
  })

  it('creates article and reloads list after submit', async () => {
    const createArticle = vi.fn().mockResolvedValue({ id: 8 })
    const fetchArticles = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(createListResponse([{ id: 8, title: '文章 X' }]))

    const page = useNotebookPage({
      fetchArticles,
      fetchCategories: vi.fn().mockResolvedValue([]),
      createArticle,
      updateArticle: vi.fn(),
      deleteArticle: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value.title = '文章 X'
    page.dialog.value.value.content = '内容 X'
    page.dialog.value.value.cover = 'https://img.example.com/x.jpg'
    page.dialog.value.value.categoryId = 1
    page.dialog.value.value.labelId = 2
    page.dialog.value.value.viewStatus = true
    page.dialog.value.value.commentStatus = true
    page.dialog.value.value.recommendStatus = false
    page.dialog.value.value.password = ''

    await page.submitDialog()

    expect(createArticle).toHaveBeenCalledWith({
      title: '文章 X',
      content: '内容 X',
      cover: 'https://img.example.com/x.jpg',
      categoryId: 1,
      labelId: 2,
      viewStatus: true,
      commentStatus: true,
      recommendStatus: false,
      password: '',
    })
    expect(page.list.items.value).toEqual([{ id: 8, title: '文章 X' }])
  })

  it('removes article after confirmation', async () => {
    const deleteArticle = vi.fn().mockResolvedValue(undefined)

    const page = useNotebookPage({
      fetchArticles: vi.fn().mockResolvedValue(createListResponse([])),
      fetchCategories: vi.fn().mockResolvedValue([]),
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      deleteArticle,
      confirmWarning: vi.fn().mockResolvedValue(undefined),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: (task) => task(),
    })

    await page.removeArticle({ id: 9, title: '删除文章' })

    expect(deleteArticle).toHaveBeenCalledWith(9)
  })
})
