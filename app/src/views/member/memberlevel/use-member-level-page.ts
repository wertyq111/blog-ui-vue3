import {
  batchDeleteMemberLevel,
  createMemberLevel,
  deleteMemberLevel,
  fetchMemberLevelList,
  updateMemberLevel,
} from '@/api/member-level'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type { MemberLevelFormValue, MemberLevelQuery, MemberLevelRow } from '@/types/member-level'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface MemberLevelPageDependencies {
  fetchMemberLevels: (
    query: MemberLevelQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<MemberLevelRow>>
  createMemberLevel: (payload: MemberLevelFormValue) => Promise<MemberLevelRow>
  updateMemberLevel: (id: number | string, payload: MemberLevelFormValue) => Promise<MemberLevelRow>
  deleteMemberLevel: (id: number | string) => Promise<void>
  batchDeleteMemberLevel: (ids: Array<number | string>) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

/** 创建会员等级页面的默认查询条件，供初始化和重置查询时复用。 */
function createInitialQuery(): MemberLevelQuery {
  return {
    name: '',
  }
}

/** 创建会员等级弹窗的默认表单值，供新增时清空表单并带入默认排序。 */
function createEmptyFormValue(): MemberLevelFormValue {
  return {
    name: '',
    sort: 0,
  }
}

/** 把列表行数据映射成弹窗表单值，供编辑场景回填当前会员等级信息。 */
function mapRowToFormValue(row: MemberLevelRow): MemberLevelFormValue {
  return {
    id: row.id,
    name: row.name,
    sort: Number(row.sort ?? 0),
  }
}

/** 组装会员等级页面的查询、列表、弹窗和删除动作；页面组件通过它消费整个页面状态。 */
export function useMemberLevelPage(overrides: Partial<MemberLevelPageDependencies> = {}) {
  const dependencies: MemberLevelPageDependencies = {
    fetchMemberLevels: fetchMemberLevelList,
    createMemberLevel,
    updateMemberLevel,
    deleteMemberLevel,
    batchDeleteMemberLevel,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<MemberLevelRow, MemberLevelQuery>({
    createInitialQuery,
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchMemberLevels(query, {
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

  const dialog = useDialogForm<MemberLevelFormValue, MemberLevelRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  /** 打开新增弹窗，供页面点击“添加等级”按钮时调用。 */
  function openCreate(): void {
    dialog.openCreate()
  }

  /** 打开编辑弹窗并回填当前行数据，供列表点击“修改”按钮时调用。 */
  function openEdit(row: MemberLevelRow): void {
    dialog.openEdit(row)
  }

  /** 提交会员等级弹窗，按新增或编辑模式调用后端并在成功后刷新列表。 */
  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateMemberLevel(source.id, value)
          } else {
            await dependencies.createMemberLevel(value)
          }

          dependencies.showSuccess('会员等级保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  /** 确认后删除单条会员等级，供列表“删除”操作调用。 */
  async function removeMemberLevel(row: MemberLevelRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此会员等级吗？')
      await dependencies.withLoading(() => dependencies.deleteMemberLevel(row.id))
      dependencies.showSuccess('会员等级删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  /** 确认后批量删除当前选中的会员等级，供页面批量删除按钮调用。 */
  async function removeSelectedMemberLevels(): Promise<void> {
    if (list.selection.value.length === 0) {
      dependencies.showError('请至少选择一条数据')
      return
    }

    try {
      await dependencies.confirmWarning('确定要删除选中的等级吗？')
      await dependencies.withLoading(() =>
        dependencies.batchDeleteMemberLevel(list.selection.value.map((item) => item.id)),
      )
      dependencies.showSuccess('会员等级删除成功')
      list.setSelection([])
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
    openCreate,
    openEdit,
    submitDialog,
    removeMemberLevel,
    removeSelectedMemberLevels,
  }
}
