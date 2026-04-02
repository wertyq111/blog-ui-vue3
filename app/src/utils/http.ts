import type { PaginatedResult } from '@/types/api'

interface CollectionMetaSource {
  current_page?: number
  per_page?: number
  total?: number
  last_page?: number
}

interface LegacyCountCollectionSource<T> {
  code?: number
  data?: T[] | CollectionPayload<T>
  count?: number
}

interface CollectionPayload<T> {
  data?: T[]
  items?: T[]
  list?: T[]
  meta?: CollectionMetaSource
  count?: number
  total?: number
  current_page?: number
  per_page?: number
  last_page?: number
}

function unwrapResponse(source: unknown): unknown {
  if (source && typeof source === 'object' && 'data' in (source as Record<string, unknown>)) {
    return (source as { data: unknown }).data
  }

  return source
}

export function extractPayload<T>(source: unknown): T {
  const payload = unwrapResponse(source)

  if (
    payload &&
    typeof payload === 'object' &&
    'code' in (payload as Record<string, unknown>) &&
    'data' in (payload as Record<string, unknown>)
  ) {
    return (payload as { data: T }).data
  }

  return payload as T
}

function pickArray<T>(payload: CollectionPayload<T> | LegacyCountCollectionSource<T> | T[]): T[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  if (payload.data && typeof payload.data === 'object') {
    const nested = payload.data as CollectionPayload<T>

    if (Array.isArray(nested.data)) {
      return nested.data
    }

    if (Array.isArray(nested.items)) {
      return nested.items
    }

    if (Array.isArray(nested.list)) {
      return nested.list
    }
  }

  if (Array.isArray((payload as CollectionPayload<T>).items)) {
    return (payload as CollectionPayload<T>).items ?? []
  }

  if (Array.isArray((payload as CollectionPayload<T>).list)) {
    return (payload as CollectionPayload<T>).list ?? []
  }

  return []
}

function pickCollectionPayload<T>(source: unknown): CollectionPayload<T> | LegacyCountCollectionSource<T> | T[] {
  const payload = unwrapResponse(source)

  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    return payload as CollectionPayload<T> | LegacyCountCollectionSource<T>
  }

  return []
}

function pickNumber(...candidates: Array<number | undefined>): number | undefined {
  return candidates.find((value): value is number => typeof value === 'number' && Number.isFinite(value))
}

export function extractCollectionPayload<T>(
  source: unknown,
  fallback: {
    currentPage?: number
    perPage?: number
  } = {},
): PaginatedResult<T> {
  const payload = pickCollectionPayload<T>(source)
  const items = pickArray(payload)
  const nested = payload && typeof payload === 'object' && 'data' in payload && payload.data && typeof payload.data === 'object'
    ? (payload.data as CollectionPayload<T>)
    : null

  const currentPage = pickNumber(
    nested?.meta?.current_page,
    nested?.current_page,
    (payload as CollectionPayload<T>).meta?.current_page,
    (payload as CollectionPayload<T>).current_page,
    fallback.currentPage,
    1,
  ) ?? 1

  const perPage = pickNumber(
    nested?.meta?.per_page,
    nested?.per_page,
    (payload as CollectionPayload<T>).meta?.per_page,
    (payload as CollectionPayload<T>).per_page,
    fallback.perPage,
    items.length || 10,
  ) ?? Math.max(items.length, 1)

  const total = pickNumber(
    nested?.meta?.total,
    nested?.total,
    (payload as CollectionPayload<T>).meta?.total,
    (payload as CollectionPayload<T>).total,
    (payload as LegacyCountCollectionSource<T>).count,
    (payload as CollectionPayload<T>).count,
    items.length,
  ) ?? items.length

  const lastPage = pickNumber(
    nested?.meta?.last_page,
    nested?.last_page,
    (payload as CollectionPayload<T>).meta?.last_page,
    (payload as CollectionPayload<T>).last_page,
    Math.max(1, Math.ceil(total / Math.max(perPage, 1))),
  ) ?? 1

  return {
    items,
    meta: {
      currentPage,
      perPage,
      total,
      lastPage,
    },
  }
}

export function extractErrorMessage(error: unknown): string {
  const candidates = [
    (error as { response?: { data?: { data?: { message?: string } } } })?.response?.data?.data?.message,
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message,
    (error as { message?: string })?.message,
  ]

  return candidates.find((message): message is string => typeof message === 'string' && message.length > 0) ?? '请求失败'
}
