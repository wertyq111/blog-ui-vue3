import type { PaginatedResult } from '@/types/api'
import type {
  SystemRoleOption,
  SystemUserFormValue,
  SystemUserProfile,
  SystemUserProfileFormValue,
  SystemUserQuery,
  SystemUserRow,
} from '@/types/system-user'
import { extractCollectionPayload, extractErrorMessage, extractPayload } from '@/utils/http'

import { apiClient } from './client'

/** 将查询输入裁剪后返回，空字符串会被转成 `undefined` 以避免发给后端。 */
function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

/** 构建用户列表过滤参数，供 `/users/list` 查询时序列化为 `filter[...]`。 */
function buildUserListFilters(query: SystemUserQuery): Record<string, string | number> {
  const filters: Record<string, string | number> = {}
  const username = trimQueryValue(query.username)
  const phone = trimQueryValue(query.phone)

  if (username) {
    filters.username = username
  }

  if (phone) {
    filters.phone = phone
  }

  if (query.status !== '') {
    filters.status = query.status
  }

  return filters
}

/** 序列化用户增改表单，供用户管理页新增和编辑接口复用。 */
function serializeFormValue(payload: SystemUserFormValue) {
  return {
    username: payload.username,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role_ids: payload.roleIds,
    status: payload.status,
  }
}

/** 序列化个人资料表单，供 `/index/updateUserInfo` 的当前用户资料更新接口调用。 */
function serializeProfileFormValue(payload: SystemUserProfileFormValue) {
  return {
    avatar: trimQueryValue(payload.avatar) ?? '',
    realname: trimQueryValue(payload.realname) ?? '',
    nickname: trimQueryValue(payload.nickname) ?? '',
    gender: payload.gender === '' ? undefined : payload.gender,
    email: trimQueryValue(payload.email) ?? '',
    mobile: trimQueryValue(payload.mobile) ?? '',
    address: trimQueryValue(payload.address) ?? '',
    intro: trimQueryValue(payload.intro) ?? '',
  }
}

/** 获取用户管理列表，供用户管理页的查询和分页场景调用。 */
export async function fetchSystemUserList(
  query: SystemUserQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<SystemUserRow>> {
  const response = await apiClient.get('/users/list', {
    params: {
      include: 'roles',
      filter: buildUserListFilters(query),
      page: pagination.page,
    },
  })

  return extractCollectionPayload<SystemUserRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })
}

/** 获取角色选项，供用户编辑弹窗选择角色时加载下拉数据。 */
export async function fetchSystemRoleOptions(): Promise<SystemRoleOption[]> {
  const response = await apiClient.get('/role/getRoleList')

  return extractPayload<SystemRoleOption[]>(response)
}

/** 检查用户名是否可用，供用户新增场景做远端唯一性校验。 */
export async function checkSystemUsernameAvailable(username: string): Promise<boolean> {
  try {
    await apiClient.get('/users/checkUser', {
      params: {
        username,
      },
    })

    return true
  } catch (error) {
    if (extractErrorMessage(error) === '用户已存在') {
      return false
    }

    throw error
  }
}

/** 创建后台用户，供用户管理页新增弹窗提交时调用。 */
export async function createSystemUser(payload: SystemUserFormValue): Promise<SystemUserRow> {
  // The current backend contract declares POST /users/add.
  // Vue2 historically called /users/edit for create, which stays a migration risk item.
  const response = await apiClient.post('/users/add', serializeFormValue(payload))

  return extractPayload<SystemUserRow>(response)
}

/** 更新后台用户，供用户管理页编辑弹窗提交时调用。 */
export async function updateSystemUser(id: number | string, payload: SystemUserFormValue): Promise<SystemUserRow> {
  const response = await apiClient.post(`/users/${id}`, serializeFormValue(payload))

  return extractPayload<SystemUserRow>(response)
}

/** 删除后台用户，供用户管理页删除动作调用。 */
export async function deleteSystemUser(id: number | string): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}

/** 更新后台用户状态，供列表开关启停场景调用。 */
export async function updateSystemUserStatus(id: number | string, status: number): Promise<SystemUserRow> {
  const response = await apiClient.post(`/users/status/${id}`, {
    status,
  })

  return extractPayload<SystemUserRow>(response)
}

/** 重置后台用户密码，供用户管理页“重置密码”动作调用。 */
export async function resetSystemUserPassword(id: number | string): Promise<SystemUserRow> {
  const response = await apiClient.post(`/users/resetPwd/${id}`)

  return extractPayload<SystemUserRow>(response)
}

/** 获取当前登录用户资料，供 `system/user/info` 页面初始化回填。 */
export async function fetchCurrentSystemUserProfile(): Promise<SystemUserProfile> {
  const response = await apiClient.get('/users/getUserInfo', {
    params: {
      include: 'member',
    },
  })

  return extractPayload<SystemUserProfile>(response)
}

/** 更新当前登录用户资料，供 `system/user/info` 页面保存操作调用。 */
export async function updateCurrentSystemUserProfile(payload: SystemUserProfileFormValue): Promise<SystemUserProfile> {
  const response = await apiClient.post('/index/updateUserInfo', serializeProfileFormValue(payload))

  return extractPayload<SystemUserProfile>(response)
}
