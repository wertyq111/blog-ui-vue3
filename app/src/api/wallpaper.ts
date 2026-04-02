import type { PaginatedResult } from '@/types/api'
import type {
  WallpaperClassifyOption,
  WallpaperFormValue,
  WallpaperQuery,
  WallpaperRow,
} from '@/types/wallpaper'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function normalizeAssetUrl(value: string): string {
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

function sanitizeTags(tags: string[]): string[] {
  return tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

function serializeFormValue(payload: WallpaperFormValue) {
  const nickname = payload.nickname.trim()
  const description = payload.description.trim()

  return {
    classId: payload.classId,
    nickname,
    url: normalizeAssetUrl(payload.url),
    smallPicUrl: normalizeAssetUrl(payload.smallPicUrl),
    description: description.length > 0 ? description : nickname,
    tags: sanitizeTags(payload.tags),
    score: Math.round(payload.score),
  }
}

export async function fetchWallpaperList(
  query: WallpaperQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<WallpaperRow>> {
  const response = await apiClient.get('/wallpaper/index', {
    params: {
      include: 'classify',
      classId: query.classId === '' ? undefined : query.classId,
      nickname: trimQueryValue(query.nickname),
      page: pagination.page,
    },
  })

  return extractCollectionPayload<WallpaperRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })
}

export async function fetchWallpaperClassifyOptions(): Promise<WallpaperClassifyOption[]> {
  const response = await apiClient.get('/wallpaper-classify/list')
  const payload = extractPayload<Array<{ id: number | string; name: string }> | undefined>(response)

  return Array.isArray(payload) ? payload.map((item) => ({ id: item.id, name: item.name })) : []
}

export async function createWallpaper(payload: WallpaperFormValue): Promise<WallpaperRow> {
  const response = await apiClient.post('/wallpaper/add', serializeFormValue(payload))

  return extractPayload<WallpaperRow>(response)
}

export async function updateWallpaper(id: number | string, payload: WallpaperFormValue): Promise<WallpaperRow> {
  const response = await apiClient.post(`/wallpaper/${id}`, serializeFormValue(payload))

  return extractPayload<WallpaperRow>(response)
}

export async function deleteWallpaper(id: number | string): Promise<void> {
  await apiClient.delete(`/wallpaper/${id}`)
}
