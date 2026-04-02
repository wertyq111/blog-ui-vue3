import type { PaginatedResult } from '@/types/api'
import type {
  WorkDailyFormValue,
  WorkDailyImportPayload,
  WorkDailyImportResult,
  WorkDailyPlatformEntry,
  WorkDailyPlatformOption,
  WorkDailyQuery,
  WorkDailyReportModelOptions,
  WorkDailyReportRequest,
  WorkDailyReportType,
  WorkDailyRow,
} from '@/types/work-daily'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function trimOptionalValue(value?: string | null): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function normalizePlatformEntry(source: Partial<WorkDailyPlatformEntry> & Record<string, unknown>): WorkDailyPlatformEntry {
  return {
    platformId: (source.platformId ?? source.platform_id ?? null) as number | string | null,
    platformName: String(source.platformName ?? source.platform_name ?? ''),
    content: String(source.content ?? ''),
  }
}

function normalizeWorkDailyRow(row: WorkDailyRow & Record<string, unknown>): WorkDailyRow {
  const contentSource = row.content
  const platformsSource = Array.isArray(contentSource)
    ? contentSource
    : Array.isArray(contentSource?.platforms)
      ? contentSource.platforms
      : []

  return {
    ...row,
    logDate: String(row.logDate ?? row.log_date ?? ''),
    content: {
      platforms: platformsSource.map((entry) => normalizePlatformEntry(entry as Record<string, unknown>)),
    },
  }
}

function serializePlatformEntry(entry: WorkDailyPlatformEntry) {
  return {
    platform_id: entry.platformId === '' ? null : entry.platformId ?? null,
    platform_name: trimOptionalValue(entry.platformName),
    content: entry.content.trim(),
  }
}

function serializeFormValue(payload: WorkDailyFormValue) {
  return {
    log_date: payload.logDate,
    platforms: payload.platforms.map((entry) => serializePlatformEntry(entry)),
  }
}

export async function fetchWorkDailyList(
  query: WorkDailyQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<WorkDailyRow>> {
  const response = await apiClient.get('/work-daily/index', {
    params: {
      platform_id: query.platformId ?? undefined,
      start_date: query.dateRange[0],
      end_date: query.dateRange[1],
      content: trimQueryValue(query.content),
      page: pagination.page,
      limit: pagination.perPage,
    },
  })

  const result = extractCollectionPayload<WorkDailyRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })

  return {
    items: result.items.map((row) => normalizeWorkDailyRow(row as WorkDailyRow & Record<string, unknown>)),
    meta: result.meta,
  }
}

export async function fetchWorkDailyDetail(id: number | string): Promise<WorkDailyRow> {
  const response = await apiClient.get(`/work-daily/${id}`)

  return normalizeWorkDailyRow(extractPayload<WorkDailyRow & Record<string, unknown>>(response))
}

export async function createWorkDailyLog(payload: WorkDailyFormValue): Promise<WorkDailyRow> {
  const response = await apiClient.post('/work-daily/add', serializeFormValue(payload))

  return normalizeWorkDailyRow(extractPayload<WorkDailyRow & Record<string, unknown>>(response))
}

export async function updateWorkDailyLog(id: number | string, payload: WorkDailyFormValue): Promise<WorkDailyRow> {
  const response = await apiClient.post(`/work-daily/${id}`, serializeFormValue(payload))

  return normalizeWorkDailyRow(extractPayload<WorkDailyRow & Record<string, unknown>>(response))
}

export async function deleteWorkDailyLog(id: number | string): Promise<void> {
  await apiClient.delete(`/work-daily/${id}`)
}

export async function fetchWorkDailyPlatforms(): Promise<WorkDailyPlatformOption[]> {
  const response = await apiClient.get('/work-platform/list', {
    params: {
      status: 1,
    },
  })

  const result = extractPayload<Array<WorkDailyPlatformOption & Record<string, unknown>>>(response)

  return (result ?? []).map((item) => ({
    id: item.id,
    name: String(item.name ?? ''),
    status: typeof item.status === 'number' ? item.status : Number(item.status ?? 1),
    sort: typeof item.sort === 'number' ? item.sort : Number(item.sort ?? 0),
  }))
}

export async function fetchWorkDailyReportModels(): Promise<WorkDailyReportModelOptions> {
  const response = await apiClient.get('/work-daily/report/models')
  const payload = extractPayload<Record<string, unknown>>(response) ?? {}

  return {
    models: Array.isArray(payload.models) ? payload.models.map((item) => String(item)) : [],
    currentModel: String(payload.currentModel ?? payload.current_model ?? ''),
  }
}

function createReportPath(type: WorkDailyReportType): string {
  if (type === 'month') {
    return '/work-daily/report/month'
  }

  if (type === 'week') {
    return '/work-daily/report/week'
  }

  return '/work-daily/report/year'
}

function serializeReportParams(type: WorkDailyReportType, request: WorkDailyReportRequest) {
  if (type === 'month') {
    return {
      month: request.month,
      model: request.model,
    }
  }

  if (type === 'week') {
    return {
      start_date: request.startDate,
      end_date: request.endDate,
      model: request.model,
    }
  }

  return {
    year: request.year,
    model: request.model,
  }
}

export async function exportWorkDailyReport(type: WorkDailyReportType, request: WorkDailyReportRequest): Promise<Blob> {
  const response = await apiClient.get(createReportPath(type), {
    params: serializeReportParams(type, request),
    responseType: 'blob',
  })

  return response.data as Blob
}

export async function importWorkDailyMarkdown(payload: WorkDailyImportPayload): Promise<WorkDailyImportResult> {
  const formData = new FormData()
  formData.append('file', payload.file)

  if (payload.year) {
    formData.append('year', payload.year)
  }

  const response = await apiClient.post('/work-daily/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  const result = extractPayload<{ count?: number }>(response)

  return {
    count: Number(result?.count ?? 0),
  }
}
