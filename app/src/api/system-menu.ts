import type { SystemMenuFormValue, SystemMenuQuery, SystemMenuRow } from '@/types/system-menu'
import { extractPayload } from '@/utils/http'

import { apiClient } from './client'

function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

function trimOptionalValue(value: string): string {
  return value.trim()
}

function serializeTargetValue(target: number): string {
  return target === 2 ? '_blank' : '_self'
}

function serializeFormValue(payload: SystemMenuFormValue) {
  return {
    pid: payload.pid ?? 0,
    title: payload.title.trim(),
    icon: trimOptionalValue(payload.icon),
    path: trimOptionalValue(payload.path),
    component: trimOptionalValue(payload.component),
    target: serializeTargetValue(payload.target),
    permission: trimOptionalValue(payload.permission),
    type: payload.type,
    status: payload.status,
    hide: payload.hide,
    sort: payload.sort,
    note: trimOptionalValue(payload.note),
    checkedList: payload.checkedList,
  }
}

export async function fetchSystemMenuList(query: SystemMenuQuery): Promise<SystemMenuRow[]> {
  const response = await apiClient.get('/menu/index', {
    params: {
      title: trimQueryValue(query.title),
    },
  })

  return extractPayload<SystemMenuRow[]>(response)
}

export async function fetchSystemMenuDetail(id: number | string): Promise<SystemMenuRow> {
  const response = await apiClient.get(`/menu/info/${id}`, {
    params: {
      include: ['children'],
    },
  })

  return extractPayload<SystemMenuRow>(response)
}

export async function createSystemMenu(payload: SystemMenuFormValue): Promise<SystemMenuRow> {
  const response = await apiClient.post('/menu/add', serializeFormValue(payload))

  return extractPayload<SystemMenuRow>(response)
}

export async function updateSystemMenu(id: number | string, payload: SystemMenuFormValue): Promise<SystemMenuRow> {
  const response = await apiClient.post(`/menu/${id}`, serializeFormValue(payload))

  return extractPayload<SystemMenuRow>(response)
}

export async function deleteSystemMenu(id: number | string): Promise<void> {
  await apiClient.delete(`/menu/${id}`)
}
