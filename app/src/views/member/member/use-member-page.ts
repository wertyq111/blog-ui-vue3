import { ref } from 'vue'

import {
  deleteMember,
  fetchMemberLevelOptions,
  fetchMemberList,
  updateMember,
  updateMemberStatus,
} from '@/api/member'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type { MemberFormValue, MemberLevelOption, MemberQuery, MemberRow } from '@/types/member'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface MemberPageDependencies {
  fetchMembers: (
    query: MemberQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<MemberRow>>
  fetchMemberLevelOptions: () => Promise<MemberLevelOption[]>
  updateMember: (id: number | string, payload: MemberFormValue) => Promise<MemberRow>
  updateMemberStatus: (id: number | string, status: number) => Promise<MemberRow>
  deleteMember: (id: number | string) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

/** 创建会员页面的默认查询条件，供初始化和重置查询时复用。 */
function createInitialQuery(): MemberQuery {
  return {
    username: '',
    nickname: '',
    gender: '',
    include: ['user'],
  }
}

/** 创建会员编辑弹窗的默认表单值，供初始化和关闭后重置弹窗时复用。 */
function createEmptyFormValue(): MemberFormValue {
  return {
    memberLevel: null,
    realname: '',
    nickname: '',
    gender: 3,
    avatar: '',
    birthday: '',
    city: ['', '', ''],
    address: '',
    intro: '',
    signature: '',
    device: 5,
    source: 2,
    status: 1,
  }
}

/** 把会员列表行数据转换成编辑弹窗表单值，供编辑场景回填当前会员信息。 */
function mapRowToFormValue(row: MemberRow): MemberFormValue {
  return {
    id: row.id,
    userId: row.userId ?? null,
    username: row.user?.username ?? '',
    memberLevel: row.memberLevel ?? null,
    realname: row.realname ?? '',
    nickname: row.nickname ?? '',
    gender: Number(row.gender ?? 3),
    avatar: row.avatar ?? '',
    birthday: typeof row.birthday === 'string' ? row.birthday : '',
    city: Array.isArray(row.city) ? row.city : ['', '', ''],
    address: row.address ?? '',
    intro: row.intro ?? '',
    signature: row.signature ?? '',
    device: Number(row.device ?? 5),
    source: Number(row.source ?? 2),
    status: Number(row.status ?? 1),
  }
}

/** 组装会员管理页面的查询、编辑、状态切换和删除动作；页面组件通过它消费全部状态。 */
export function useMemberPage(overrides: Partial<MemberPageDependencies> = {}) {
  const dependencies: MemberPageDependencies = {
    fetchMembers: fetchMemberList,
    fetchMemberLevelOptions,
    updateMember,
    updateMemberStatus,
    deleteMember,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const memberLevelOptions = ref<MemberLevelOption[]>([])
  const memberLevelLoading = ref(false)

  const list = useCrudList<MemberRow, MemberQuery>({
    createInitialQuery,
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchMembers(query, {
        page,
        perPage,
      })

      return {
        data: {
          data: result.items,
          meta: {
            current_page: result.meta.currentPage,
            per_page: result.meta.perPage,
            total: result.meta.total,
            last_page: result.meta.lastPage,
          },
        },
      }
    },
  })

  const dialog = useDialogForm<MemberFormValue, MemberRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  /** 确保会员等级选项已经加载，供编辑弹窗初始化时复用，避免重复请求。 */
  async function ensureMemberLevelOptions(): Promise<void> {
    if (memberLevelOptions.value.length > 0 || memberLevelLoading.value) {
      return
    }

    memberLevelLoading.value = true

    try {
      memberLevelOptions.value = await dependencies.fetchMemberLevelOptions()
    } finally {
      memberLevelLoading.value = false
    }
  }

  /** 打开会员编辑弹窗并加载等级选项，供列表点击“修改”按钮时调用。 */
  async function openEdit(row: MemberRow): Promise<void> {
    await ensureMemberLevelOptions()
    dialog.openEdit(row)
  }

  /** 提交会员编辑弹窗，供点击“保存”按钮时调用；保存成功后刷新列表。 */
  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (!source) {
            throw new Error('当前仅支持编辑已存在会员')
          }

          await dependencies.updateMember(source.id, value)
          dependencies.showSuccess('会员保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  /** 切换会员状态并在失败时回滚到旧值，供列表状态开关调用。 */
  async function changeStatus(row: MemberRow, status: number): Promise<void> {
    const previousStatus = Number(row.status ?? 1)
    row.status = status

    try {
      await dependencies.withLoading(() => dependencies.updateMemberStatus(row.id, status))
      dependencies.showSuccess('状态更新成功')
    } catch (error) {
      row.status = previousStatus
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  /** 确认后删除指定会员，供列表“删除”操作调用；删除成功后刷新当前页数据。 */
  async function removeMember(row: MemberRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此会员吗？')
      await dependencies.withLoading(() => dependencies.deleteMember(row.id))
      dependencies.showSuccess('会员删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  return {
    list,
    dialog,
    memberLevelOptions,
    memberLevelLoading,
    openEdit,
    submitDialog,
    changeStatus,
    removeMember,
  }
}
