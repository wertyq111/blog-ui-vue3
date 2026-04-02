import type { PaginatedResult } from '@/types/api'
import type { PhotoCategoryOption, PhotoFormValue, PhotoQuery, PhotoRow } from '@/types/photo'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function serializeFormValue(payload: PhotoFormValue) {
  return {
    categoryId: payload.categoryId,
    url: payload.url.trim(),
    remark: payload.remark.trim(),
  }
}

export async function fetchPhotoList(
  query: PhotoQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<PhotoRow>> {
  const response = await apiClient.get('/photo/index', {
    params: {
      include: 'category,member',
      categoryId: query.categoryId === '' ? undefined : query.categoryId,
      remark: trimQueryValue(query.remark),
      page: pagination.page,
    },
  })

  return extractCollectionPayload<PhotoRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })
}

export async function fetchPhotoCategoryOptions(): Promise<PhotoCategoryOption[]> {
  const response = await apiClient.get('/photo-categories/list')
  const payload = extractPayload<PhotoCategoryOption[] | undefined>(response)

  return Array.isArray(payload) ? payload : []
}

export async function createPhoto(payload: PhotoFormValue): Promise<PhotoRow> {
  const response = await apiClient.post('/photo/add', serializeFormValue(payload))

  return extractPayload<PhotoRow>(response)
}

export async function updatePhoto(id: number | string, payload: PhotoFormValue): Promise<PhotoRow> {
  const response = await apiClient.post(`/photo/${id}`, serializeFormValue(payload))

  return extractPayload<PhotoRow>(response)
}

export async function deletePhoto(id: number | string): Promise<void> {
  await apiClient.delete(`/photo/${id}`)
}

export async function deletePhotoBatch(ids: Array<number | string>): Promise<void> {
  await apiClient.delete('/photo/batch-delete', {
    params: {
      id: ids,
    },
  })
}
