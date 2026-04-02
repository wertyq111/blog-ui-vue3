import { ref } from 'vue'

import {
  createNotebookLabel,
  deleteNotebookLabel,
  fetchNotebookLabelCategoryOptions,
  fetchNotebookLabelList,
  updateNotebookLabel,
} from '@/api/notebook-label'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type {
  NotebookLabelCategoryOption,
  NotebookLabelFormValue,
  NotebookLabelQuery,
  NotebookLabelRow,
} from '@/types/notebook-label'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface NotebookLabelPageDependencies {
  fetchLabels: (
    query: NotebookLabelQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<NotebookLabelRow>>
  fetchCategoryOptions: () => Promise<NotebookLabelCategoryOption[]>
  createLabel: (payload: NotebookLabelFormValue) => Promise<NotebookLabelRow>
  updateLabel: (id: number | string, payload: NotebookLabelFormValue) => Promise<NotebookLabelRow>
  deleteLabel: (id: number | string) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

/** 创建新增标签时的默认表单值，供弹窗初始化和重置使用。 */
function createEmptyFormValue(): NotebookLabelFormValue {
  return {
    categoryId: '',
    name: '',
    description: '',
  }
}

/** 将列表行转换成编辑表单值，供点击“修改”时回填弹窗。 */
function mapRowToFormValue(row: NotebookLabelRow): NotebookLabelFormValue {
  return {
    id: row.id,
    categoryId: row.categoryId ?? row.category?.id ?? '',
    name: row.name,
    description: row.description ?? '',
  }
}

/** 组装标签页面状态和增删改流程，供页面组件直接调用。 */
export function useNotebookLabelPage(overrides: Partial<NotebookLabelPageDependencies> = {}) {
  const dependencies: NotebookLabelPageDependencies = {
    fetchLabels: fetchNotebookLabelList,
    fetchCategoryOptions: fetchNotebookLabelCategoryOptions,
    createLabel: createNotebookLabel,
    updateLabel: updateNotebookLabel,
    deleteLabel: deleteNotebookLabel,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const categoryOptions = ref<NotebookLabelCategoryOption[]>([])
  const categoryLoading = ref(false)

  const list = useCrudList<NotebookLabelRow, NotebookLabelQuery>({
    createInitialQuery: () => ({
      name: '',
    }),
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchLabels(query, {
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

  const dialog = useDialogForm<NotebookLabelFormValue, NotebookLabelRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  /** 确保分类下拉数据只加载一次，供新增和编辑弹窗复用。 */
  async function ensureCategoryOptions(): Promise<void> {
    if (categoryOptions.value.length > 0 || categoryLoading.value) {
      return
    }

    categoryLoading.value = true

    try {
      categoryOptions.value = await dependencies.fetchCategoryOptions()
    } finally {
      categoryLoading.value = false
    }
  }

  /** 打开新增弹窗并预加载分类选项。 */
  async function openCreate(): Promise<void> {
    await ensureCategoryOptions()
    dialog.openCreate()
  }

  /** 打开编辑弹窗并预加载分类选项。 */
  async function openEdit(row: NotebookLabelRow): Promise<void> {
    await ensureCategoryOptions()
    dialog.openEdit(row)
  }

  /** 提交弹窗并执行新增或编辑，成功后刷新列表。 */
  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateLabel(source.id, value)
          } else {
            await dependencies.createLabel(value)
          }

          dependencies.showSuccess('标签保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  /** 确认并删除标签，成功后刷新列表。 */
  async function removeLabel(row: NotebookLabelRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此标签吗？')
      await dependencies.withLoading(() => dependencies.deleteLabel(row.id))
      dependencies.showSuccess('标签删除成功')
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
    categoryOptions,
    categoryLoading,
    openCreate,
    openEdit,
    submitDialog,
    removeLabel,
  }
}
