import type { PaginatedResult } from '@/types/api'
import type {
  WallpaperClassifyFormValue,
  WallpaperClassifyQuery,
  WallpaperClassifyRow,
} from '@/types/wallpaper-classify'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function normalizePicUrl(value: string): string {
  const nextValue = value.trim()

  if (nextValue.length === 0) {
    return nextValue
  }

  try {
    const parsedUrl = new URL(nextValue)
    const maybeNestedUrl = parsedUrl.pathname.startsWith('/') ? parsedUrl.pathname.slice(1) : parsedUrl.pathname
    const hasSignature = parsedUrl.searchParams.has('token') || parsedUrl.searchParams.has('e')

    if (hasSignature && /^https?:\/\//.test(maybeNestedUrl)) {
      return maybeNestedUrl
    }

    if (hasSignature) {
      parsedUrl.search = ''
      return parsedUrl.toString()
    }
  } catch {
    return nextValue
  }

  return nextValue
}

function serializeFormValue(payload: WallpaperClassifyFormValue) {
  return {
    name: payload.name.trim(),
    picUrl: normalizePicUrl(payload.picUrl),
    select: payload.select,
    sort: payload.sort,
  }
}

export async function fetchWallpaperClassifyList(
  query: WallpaperClassifyQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<WallpaperClassifyRow>> {
  const response = await apiClient.get('/wallpaper-classify/index', {
    params: {
      name: trimQueryValue(query.name),
      page: pagination.page,
    },
  })

  return extractCollectionPayload<WallpaperClassifyRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })
}

export async function createWallpaperClassify(payload: WallpaperClassifyFormValue): Promise<WallpaperClassifyRow> {
  const response = await apiClient.post('/wallpaper-classify/add', serializeFormValue(payload))

  return extractPayload<WallpaperClassifyRow>(response)
}

export async function updateWallpaperClassify(
  id: number | string,
  payload: WallpaperClassifyFormValue,
): Promise<WallpaperClassifyRow> {
  const response = await apiClient.post(`/wallpaper-classify/${id}`, serializeFormValue(payload))

  return extractPayload<WallpaperClassifyRow>(response)
}

export async function deleteWallpaperClassify(id: number | string): Promise<void> {
  await apiClient.delete(`/wallpaper-classify/${id}`)
}
