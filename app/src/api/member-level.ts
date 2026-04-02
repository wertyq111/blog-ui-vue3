import type { PaginatedResult } from '@/types/api'
import type { MemberLevelFormValue, MemberLevelQuery, MemberLevelRow } from '@/types/member-level'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

/** 将搜索输入裁剪为空时转成 `undefined`，供列表请求避免发送无效空字符串。 */
function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

/** 获取会员等级列表，供页面初始化、查询和翻页时调用。 */
export async function fetchMemberLevelList(
  query: MemberLevelQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<MemberLevelRow>> {
  const response = await apiClient.get('/member-level/index', {
    params: {
      name: trimQueryValue(query.name),
      page: pagination.page,
    },
  })

  return extractCollectionPayload<MemberLevelRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })
}

/** 创建会员等级，供新增弹窗提交时调用。 */
export async function createMemberLevel(payload: MemberLevelFormValue): Promise<MemberLevelRow> {
  const response = await apiClient.post('/member-level/add', {
    name: payload.name,
    sort: payload.sort,
  })

  return extractPayload<MemberLevelRow>(response)
}

/** 更新指定会员等级，供编辑弹窗提交时调用。 */
export async function updateMemberLevel(
  id: number | string,
  payload: MemberLevelFormValue,
): Promise<MemberLevelRow> {
  const response = await apiClient.post(`/member-level/${id}`, {
    name: payload.name,
    sort: payload.sort,
  })

  return extractPayload<MemberLevelRow>(response)
}

/** 删除指定会员等级，供列表单条删除操作调用。 */
export async function deleteMemberLevel(id: number | string): Promise<void> {
  await apiClient.delete(`/member-level/${id}`)
}

/** 批量删除会员等级，供页面批量删除按钮调用。 */
export async function batchDeleteMemberLevel(ids: Array<number | string>): Promise<void> {
  await apiClient.delete('/member-level/batchDelete', {
    params: {
      id: ids,
    },
  })
}
