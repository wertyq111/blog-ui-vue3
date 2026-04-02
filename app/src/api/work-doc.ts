import type { PaginatedResult } from '@/types/api'
import type {
  WorkDocCategoryFormValue,
  WorkDocCategoryQuery,
  WorkDocCategoryReorderItem,
  WorkDocCategoryRow,
  WorkDocFormValue,
  WorkDocQuery,
  WorkDocRow,
} from '@/types/work-doc'
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

function normalizeCategoryRow(row: WorkDocCategoryRow & Record<string, unknown>): WorkDocCategoryRow {
  const children = Array.isArray(row.children)
    ? row.children.map((item) => normalizeCategoryRow(item as WorkDocCategoryRow & Record<string, unknown>))
    : undefined

  const normalizedRow: WorkDocCategoryRow = {
    parentId: Number(row.parentId ?? row.parent_id ?? 0),
    name: String(row.name ?? ''),
    icon: String(row.icon ?? ''),
    description: String(row.description ?? ''),
    sort: Number(row.sort ?? 0),
    status: Number(row.status ?? 1),
    id: row.id,
  }

  if (children) {
    normalizedRow.children = children
  }

  return normalizedRow
}

function serializeCategoryFormValue(payload: WorkDocCategoryFormValue) {
  return {
    parent_id: payload.parentId,
    name: payload.name.trim(),
    icon: trimOptionalValue(payload.icon),
    description: trimOptionalValue(payload.description),
    sort: payload.sort,
    status: payload.status,
  }
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter((item) => item.length > 0)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return []
}

function normalizeCategoryOption(value: unknown): WorkDocRow['category'] | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const category = value as {
    id?: number | string
    name?: string
  }

  return {
    id: category.id ?? '',
    name: String(category.name ?? ''),
  }
}

function normalizeWorkDocRow(row: WorkDocRow & Record<string, unknown>): WorkDocRow {
  const category = normalizeCategoryOption(row.category)

  return {
    id: row.id,
    categoryId: (row.categoryId ?? row.category_id ?? null) as number | string | null,
    title: String(row.title ?? ''),
    content: String(row.content ?? ''),
    templateType: String(row.templateType ?? row.template_type ?? ''),
    tags: normalizeTags(row.tags),
    status: Number(row.status ?? 1),
    priority: Number(row.priority ?? 0),
    source: String(row.source ?? ''),
    isPin: Number(row.isPin ?? row.is_pin ?? 0),
    category,
  }
}

function serializeWorkDocFormValue(payload: WorkDocFormValue) {
  return {
    category_id: payload.categoryId,
    title: payload.title.trim(),
    content: payload.content.trim(),
    template_type: payload.templateType,
    tags: payload.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
    status: payload.status,
    priority: payload.priority,
    source: trimOptionalValue(payload.source),
    is_pin: payload.isPin,
  }
}

export async function fetchWorkDocCategories(query: WorkDocCategoryQuery): Promise<WorkDocCategoryRow[]> {
  const response = await apiClient.get('/work-doc-category/list', {
    params: {
      status: query.status ?? undefined,
    },
  })

  const result = extractPayload<Array<WorkDocCategoryRow & Record<string, unknown>>>(response)

  return (result ?? []).map((row) => normalizeCategoryRow(row))
}

export async function fetchWorkDocCategoryDetail(id: number | string): Promise<WorkDocCategoryRow> {
  const response = await apiClient.get(`/work-doc-category/${id}`)

  return normalizeCategoryRow(extractPayload<WorkDocCategoryRow & Record<string, unknown>>(response))
}

export async function createWorkDocCategory(payload: WorkDocCategoryFormValue): Promise<WorkDocCategoryRow> {
  const response = await apiClient.post('/work-doc-category/add', serializeCategoryFormValue(payload))

  return normalizeCategoryRow(extractPayload<WorkDocCategoryRow & Record<string, unknown>>(response))
}

export async function updateWorkDocCategory(
  id: number | string,
  payload: WorkDocCategoryFormValue,
): Promise<WorkDocCategoryRow> {
  const response = await apiClient.post(`/work-doc-category/${id}`, serializeCategoryFormValue(payload))

  return normalizeCategoryRow(extractPayload<WorkDocCategoryRow & Record<string, unknown>>(response))
}

export async function reorderWorkDocCategories(order: WorkDocCategoryReorderItem[]): Promise<void> {
  await apiClient.post('/work-doc-category/reorder', {
    order: order.map((item) => ({
      id: item.id,
      parent_id: item.parentId,
      sort: item.sort,
    })),
  })
}

export async function deleteWorkDocCategory(id: number | string): Promise<void> {
  await apiClient.delete(`/work-doc-category/${id}`)
}

export async function fetchWorkDocList(
  query: WorkDocQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<WorkDocRow>> {
  const response = await apiClient.get('/work-doc/index', {
    params: {
      keyword: trimQueryValue(query.keyword),
      status: query.status ?? undefined,
      template_type: query.templateType ?? undefined,
      category_id: query.categoryId ?? undefined,
      page: pagination.page,
      pageSize: pagination.perPage,
    },
  })

  const result = extractCollectionPayload<WorkDocRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })

  return {
    items: result.items.map((row) => normalizeWorkDocRow(row as WorkDocRow & Record<string, unknown>)),
    meta: result.meta,
  }
}

export async function fetchWorkDocDetail(id: number | string): Promise<WorkDocRow> {
  const response = await apiClient.get(`/work-doc/${id}`)

  return normalizeWorkDocRow(extractPayload<WorkDocRow & Record<string, unknown>>(response))
}

export async function createWorkDoc(payload: WorkDocFormValue): Promise<WorkDocRow> {
  const response = await apiClient.post('/work-doc/add', serializeWorkDocFormValue(payload))

  return normalizeWorkDocRow(extractPayload<WorkDocRow & Record<string, unknown>>(response))
}

export async function updateWorkDoc(id: number | string, payload: WorkDocFormValue): Promise<WorkDocRow> {
  const response = await apiClient.post(`/work-doc/${id}`, serializeWorkDocFormValue(payload))

  return normalizeWorkDocRow(extractPayload<WorkDocRow & Record<string, unknown>>(response))
}

export async function deleteWorkDoc(id: number | string): Promise<void> {
  await apiClient.delete(`/work-doc/${id}`)
}
