import type { PaginatedResult } from '@/types/api'
import type { MemberFormValue, MemberLevelOption, MemberQuery, MemberRow } from '@/types/member'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

/** 将查询输入裁剪为空时转成 `undefined`，供列表请求避免发送无效空字符串。 */
function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

/** 将时间戳生日转换成日期字符串，供编辑弹窗稳定回填。 */
function normalizeBirthday(value: number | string | null | undefined): string {
  if (typeof value === 'string') {
    if (value.includes('-')) {
      return value
    }

    const timestamp = Number(value)

    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      return ''
    }

    return new Date(timestamp * 1000).toISOString().slice(0, 10)
  }

  if (typeof value !== 'number' || value <= 0) {
    return ''
  }

  return new Date(value * 1000).toISOString().slice(0, 10)
}

/** 统一整理会员读模型字段，供列表和编辑场景复用稳定结构。 */
function normalizeMemberRow(row: MemberRow): MemberRow {
  return {
    ...row,
    userId: row.userId ?? row.user?.id ?? null,
    memberLevel: row.memberLevel ?? null,
    realname: row.realname ?? '',
    nickname: row.nickname ?? '',
    gender: Number(row.gender ?? 3),
    avatar: row.avatar ?? '',
    birthday: normalizeBirthday(row.birthday),
    city: Array.isArray(row.city) ? row.city.map((item) => item ?? '') : ['', '', ''],
    address: row.address ?? '',
    intro: row.intro ?? '',
    signature: row.signature ?? '',
    device: Number(row.device ?? 5),
    source: Number(row.source ?? 2),
    status: Number(row.status ?? 1),
    user: row.user ?? null,
  }
}

/** 序列化会员编辑表单，供编辑接口写入当前后端已验证的写模型字段。 */
function serializeFormValue(payload: MemberFormValue) {
  return {
    id: payload.id,
    userId: payload.userId ?? undefined,
    memberLevel: payload.memberLevel ?? undefined,
    realname: payload.realname.trim(),
    nickname: payload.nickname.trim(),
    gender: payload.gender,
    avatar: payload.avatar.trim(),
    birthday: trimQueryValue(payload.birthday) ?? 0,
    city: payload.city,
    address: trimQueryValue(payload.address) ?? null,
    intro: trimQueryValue(payload.intro) ?? null,
    signature: trimQueryValue(payload.signature) ?? null,
    device: payload.device,
    source: payload.source,
    status: payload.status,
    appVersion: '',
  }
}

/** 获取会员列表，供页面初始化、查询和翻页时调用。 */
export async function fetchMemberList(
  query: MemberQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<MemberRow>> {
  const response = await apiClient.get('/members/index', {
    params: {
      include: query.include,
      username: trimQueryValue(query.username),
      nickname: trimQueryValue(query.nickname),
      gender: trimQueryValue(query.gender),
      page: pagination.page,
    },
  })

  const result = extractCollectionPayload<MemberRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })

  return {
    items: result.items.map((row) => normalizeMemberRow(row)),
    meta: result.meta,
  }
}

/** 获取会员等级选项，供会员编辑弹窗选择等级时加载下拉列表。 */
export async function fetchMemberLevelOptions(): Promise<MemberLevelOption[]> {
  const response = await apiClient.get('/member-level/list')

  return extractPayload<MemberLevelOption[]>(response)
}

/** 更新指定会员，供编辑弹窗提交时调用。 */
export async function updateMember(id: number | string, payload: MemberFormValue): Promise<MemberRow> {
  const response = await apiClient.post(`/members/${id}`, serializeFormValue(payload))

  return normalizeMemberRow(extractPayload<MemberRow>(response))
}

/** 更新指定会员状态，供列表开关切换场景调用。 */
export async function updateMemberStatus(id: number | string, status: number): Promise<MemberRow> {
  const response = await apiClient.post(`/members/status/${id}`, {
    status,
  })

  return normalizeMemberRow(extractPayload<MemberRow>(response))
}

/** 删除指定会员，供列表删除操作调用。 */
export async function deleteMember(id: number | string): Promise<void> {
  await apiClient.delete(`/members/${id}`)
}
