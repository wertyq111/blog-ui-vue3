import type { PaginatedResult } from '@/types/api'
import type {
  NotebookArticleCategoryOption,
  NotebookArticleFormValue,
  NotebookArticleQuery,
  NotebookArticleRow,
} from '@/types/notebook-article'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function serializeFormValue(payload: NotebookArticleFormValue) {
  return {
    title: payload.title.trim(),
    content: payload.content.trim(),
    cover: payload.cover.trim(),
    categoryId: payload.categoryId,
    labelId: payload.labelId === '' ? undefined : payload.labelId,
    viewStatus: payload.viewStatus,
    commentStatus: payload.commentStatus,
    recommendStatus: payload.recommendStatus,
    password: payload.password.trim(),
  }
}

export async function fetchNotebookArticleList(
  query: NotebookArticleQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<NotebookArticleRow>> {
  const response = await apiClient.get('/articles/index', {
    params: {
      include: 'member,category,label',
      title: trimQueryValue(query.title),
      categoryId: query.categoryId === '' ? undefined : query.categoryId,
      labelId: query.labelId === '' ? undefined : query.labelId,
      page: pagination.page,
    },
  })

  return extractCollectionPayload<NotebookArticleRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })
}

export async function fetchNotebookArticleCategoryOptions(): Promise<NotebookArticleCategoryOption[]> {
  const response = await apiClient.get('/categories/list', {
    params: {
      include: 'labels',
      perPage: 200,
    },
  })

  return extractCollectionPayload<NotebookArticleCategoryOption>(response).items
}

export async function createNotebookArticle(payload: NotebookArticleFormValue): Promise<NotebookArticleRow> {
  const response = await apiClient.post('/articles/add', serializeFormValue(payload))

  return extractPayload<NotebookArticleRow>(response)
}

export async function updateNotebookArticle(
  id: number | string,
  payload: NotebookArticleFormValue,
): Promise<NotebookArticleRow> {
  const response = await apiClient.post(`/articles/${id}`, serializeFormValue(payload))

  return extractPayload<NotebookArticleRow>(response)
}

export async function deleteNotebookArticle(id: number | string): Promise<void> {
  await apiClient.delete(`/articles/${id}`)
}
