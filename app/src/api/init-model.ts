import type { PaginatedResult } from '@/types/api'
import type {
  InitModelConvertValue,
  InitModelFormValue,
  InitModelQuery,
  InitModelRow,
} from '@/types/init-model'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function trimRequiredValue(value: string): string {
  return value.trim()
}

function normalizeInitModelRow(row: InitModelRow): InitModelRow {
  return {
    ...row,
    code: row.code ?? '',
    name: row.name ?? '',
    tip: row.tip ?? '',
    template: row.template ?? '',
  }
}

function serializeFormValue(payload: InitModelFormValue) {
  return {
    code: trimRequiredValue(payload.code),
    name: trimRequiredValue(payload.name),
    tip: trimRequiredValue(payload.tip),
    template: trimRequiredValue(payload.template),
  }
}

function serializeConvertValue(payload: InitModelConvertValue) {
  return {
    columns: payload.column
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  }
}

export async function fetchInitModelList(
  query: InitModelQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<InitModelRow>> {
  const response = await apiClient.get('/init-model/index', {
    params: {
      code: trimQueryValue(query.code),
      name: trimQueryValue(query.name),
      page: pagination.page,
    },
  })

  const result = extractCollectionPayload<InitModelRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })

  return {
    items: result.items.map((row) => normalizeInitModelRow(row)),
    meta: result.meta,
  }
}

export async function fetchInitModelDetail(id: number | string): Promise<InitModelRow> {
  const response = await apiClient.get(`/init-model/${id}`)

  return normalizeInitModelRow(extractPayload<InitModelRow>(response))
}

export async function createInitModel(payload: InitModelFormValue): Promise<InitModelRow> {
  const response = await apiClient.post('/init-model/add', serializeFormValue(payload))

  return normalizeInitModelRow(extractPayload<InitModelRow>(response))
}

export async function updateInitModel(id: number | string, payload: InitModelFormValue): Promise<InitModelRow> {
  const response = await apiClient.post(`/init-model/${id}`, serializeFormValue(payload))

  return normalizeInitModelRow(extractPayload<InitModelRow>(response))
}

export async function convertInitModel(id: number | string, payload: InitModelConvertValue): Promise<string> {
  const response = await apiClient.post(`/init-model/convert/${id}`, serializeConvertValue(payload))

  return extractPayload<string>(response)
}

export async function deleteInitModel(id: number | string): Promise<void> {
  await apiClient.delete(`/init-model/${id}`)
}
