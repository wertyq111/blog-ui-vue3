import type { PaginatedResult } from '@/types/api'
import type {
  ServerPathConvertValue,
  ServerPathFormValue,
  ServerPathQuery,
  ServerPathRow,
} from '@/types/server-path'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function trimRequiredValue(value: string): string {
  return value.trim()
}

function parseSources(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0)
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    try {
      return parseSources(JSON.parse(value))
    } catch {
      return [value.trim()]
    }
  }

  return []
}

function normalizeServerPathRow(row: ServerPathRow & { sources?: unknown }): ServerPathRow {
  return {
    ...row,
    url: row.url ?? '',
    sources: parseSources(row.sources),
    sort: Number(row.sort ?? 0),
  }
}

function serializeFormValue(payload: ServerPathFormValue) {
  return {
    code: trimRequiredValue(payload.code),
    name: trimRequiredValue(payload.name),
    url: trimRequiredValue(payload.url),
    target: trimRequiredValue(payload.target),
    sources: parseSources(payload.sources),
    sort: payload.sort,
  }
}

function serializeConvertValue(payload: ServerPathConvertValue) {
  return {
    paths: payload.path
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  }
}

export async function fetchServerPathList(
  query: ServerPathQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<ServerPathRow>> {
  const response = await apiClient.get('/server-path/index', {
    params: {
      name: trimQueryValue(query.name),
      page: pagination.page,
    },
  })

  const result = extractCollectionPayload<ServerPathRow & { sources?: unknown }>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })

  return {
    items: result.items.map((row) => normalizeServerPathRow(row)),
    meta: result.meta,
  }
}

export async function fetchServerPathDetail(id: number | string): Promise<ServerPathRow> {
  const response = await apiClient.get(`/server-path/${id}`)

  return normalizeServerPathRow(extractPayload<ServerPathRow & { sources?: unknown }>(response))
}

export async function createServerPath(payload: ServerPathFormValue): Promise<ServerPathRow> {
  const response = await apiClient.post('/server-path/add', serializeFormValue(payload))

  return normalizeServerPathRow(extractPayload<ServerPathRow & { sources?: unknown }>(response))
}

export async function updateServerPath(id: number | string, payload: ServerPathFormValue): Promise<ServerPathRow> {
  const response = await apiClient.post(`/server-path/${id}`, serializeFormValue(payload))

  return normalizeServerPathRow(extractPayload<ServerPathRow & { sources?: unknown }>(response))
}

export async function convertServerPath(id: number | string, payload: ServerPathConvertValue): Promise<string[]> {
  const response = await apiClient.post(`/server-path/convert/${id}`, serializeConvertValue(payload))

  return extractPayload<string[]>(response)
}

export async function deleteServerPath(id: number | string): Promise<void> {
  await apiClient.delete(`/server-path/${id}`)
}
