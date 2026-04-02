import type { PaginatedResult } from '@/types/api'
import type {
  WorkPlatformFormValue,
  WorkPlatformQuery,
  WorkPlatformReorderItem,
  WorkPlatformRow,
} from '@/types/work-platform'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function trimRequiredValue(value: string): string {
  return value.trim()
}

function normalizeWorkPlatformRow(row: WorkPlatformRow): WorkPlatformRow {
  return {
    ...row,
    name: row.name ?? '',
    status: Number(row.status ?? 1),
    sort: Number(row.sort ?? 0),
  }
}

function serializeFormValue(payload: WorkPlatformFormValue) {
  return {
    name: trimRequiredValue(payload.name),
    status: payload.status,
    sort: payload.sort,
  }
}

export async function fetchWorkPlatformList(
  query: WorkPlatformQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<WorkPlatformRow>> {
  const response = await apiClient.get('/work-platform/index', {
    params: {
      name: trimQueryValue(query.name),
      status: query.status ?? undefined,
      page: pagination.page,
      limit: pagination.perPage,
    },
  })

  const result = extractCollectionPayload<WorkPlatformRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })

  return {
    items: result.items.map((row) => normalizeWorkPlatformRow(row)),
    meta: result.meta,
  }
}

export async function fetchWorkPlatformDetail(id: number | string): Promise<WorkPlatformRow> {
  const response = await apiClient.get(`/work-platform/${id}`)

  return normalizeWorkPlatformRow(extractPayload<WorkPlatformRow>(response))
}

export async function createWorkPlatform(payload: WorkPlatformFormValue): Promise<WorkPlatformRow> {
  const response = await apiClient.post('/work-platform/add', serializeFormValue(payload))

  return normalizeWorkPlatformRow(extractPayload<WorkPlatformRow>(response))
}

export async function updateWorkPlatform(id: number | string, payload: WorkPlatformFormValue): Promise<WorkPlatformRow> {
  const response = await apiClient.post(`/work-platform/${id}`, serializeFormValue(payload))

  return normalizeWorkPlatformRow(extractPayload<WorkPlatformRow>(response))
}

export async function reorderWorkPlatform(order: WorkPlatformReorderItem[]): Promise<void> {
  await apiClient.post('/work-platform/reorder', {
    order,
  })
}

export async function deleteWorkPlatform(id: number | string): Promise<void> {
  await apiClient.delete(`/work-platform/${id}`)
}
