import type { PaginatedResult } from '@/types/api'
import type {
  SystemRoleFormValue,
  SystemRolePermissionNode,
  SystemRoleQuery,
  SystemRoleRow,
} from '@/types/system-role'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function serializeFormValue(payload: SystemRoleFormValue) {
  return {
    name: payload.name.trim(),
    code: payload.code.trim(),
    status: payload.status,
    sort: payload.sort,
    note: payload.note.trim(),
  }
}

function normalizeRoleStatus(status: unknown): number {
  if (status === 1 || status === true || status === '1') {
    return 1
  }

  return 2
}

function normalizeRoleRow(row: SystemRoleRow): SystemRoleRow {
  return {
    ...row,
    status: normalizeRoleStatus(row.status),
  }
}

export async function fetchSystemRoleList(
  query: SystemRoleQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<SystemRoleRow>> {
  const response = await apiClient.get('/role/index', {
    params: {
      name: trimQueryValue(query.name),
      page: pagination.page,
    },
  })

  const result = extractCollectionPayload<SystemRoleRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })

  return {
    ...result,
    items: result.items.map((row) => normalizeRoleRow(row)),
  }
}

export async function createSystemRole(payload: SystemRoleFormValue): Promise<SystemRoleRow> {
  const response = await apiClient.post('/role/add', serializeFormValue(payload))

  return normalizeRoleRow(extractPayload<SystemRoleRow>(response))
}

export async function updateSystemRole(id: number | string, payload: SystemRoleFormValue): Promise<SystemRoleRow> {
  const response = await apiClient.post(`/role/${id}`, serializeFormValue(payload))

  return normalizeRoleRow(extractPayload<SystemRoleRow>(response))
}

export async function updateSystemRoleStatus(id: number | string, status: number): Promise<SystemRoleRow> {
  const response = await apiClient.post(`/role/status/${id}`, {
    id,
    status: status === 1,
  })

  return normalizeRoleRow(extractPayload<SystemRoleRow>(response))
}

export async function deleteSystemRole(id: number | string): Promise<void> {
  await apiClient.delete(`/role/${id}`)
}

export async function deleteSystemRoleBatch(ids: Array<number | string>): Promise<void> {
  await apiClient.post('/role/batchDelete', {
    id: ids,
  })
}

export async function fetchSystemRolePermissionList(roleId: number | string): Promise<SystemRolePermissionNode[]> {
  const response = await apiClient.get(`/role/permission/${roleId}`)

  return extractPayload<SystemRolePermissionNode[]>(response)
}

export async function saveSystemRolePermissionList(
  roleId: number | string,
  menuIds: Array<number | string>,
): Promise<void> {
  await apiClient.post(`/role/permission/${roleId}`, {
    menu_id: menuIds,
  })
}
