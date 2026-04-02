import {
  createNotebookCategory,
  deleteNotebookCategory,
  fetchNotebookCategoryList,
  updateNotebookCategory,
} from '@/api/notebook-category'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type {
  NotebookCategoryFormValue,
  NotebookCategoryQuery,
  NotebookCategoryRow,
} from '@/types/notebook-category'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface NotebookCategoryPageDependencies {
  fetchCategories: (
    query: NotebookCategoryQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<NotebookCategoryRow>>
  createCategory: (payload: NotebookCategoryFormValue) => Promise<NotebookCategoryRow>
  updateCategory: (id: number | string, payload: NotebookCategoryFormValue) => Promise<NotebookCategoryRow>
  deleteCategory: (id: number | string) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

/** 创建新增分类时的默认表单值，供弹窗初始化和重置场景复用。 */
function createEmptyFormValue(): NotebookCategoryFormValue {
  return {
    name: '',
    description: '',
    priority: 0,
  }
}

/** 将列表行转换为编辑表单值，供点击“修改”时回填弹窗。 */
function mapRowToFormValue(row: NotebookCategoryRow): NotebookCategoryFormValue {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    priority: row.priority ?? 0,
  }
}

/** 组装文章分类页面状态和增删改行为，供页面组件直接消费。 */
export function useNotebookCategoryPage(overrides: Partial<NotebookCategoryPageDependencies> = {}) {
  const dependencies: NotebookCategoryPageDependencies = {
    fetchCategories: fetchNotebookCategoryList,
    createCategory: createNotebookCategory,
    updateCategory: updateNotebookCategory,
    deleteCategory: deleteNotebookCategory,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<NotebookCategoryRow, NotebookCategoryQuery>({
    createInitialQuery: () => ({
      name: '',
    }),
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchCategories(query, {
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

  const dialog = useDialogForm<NotebookCategoryFormValue, NotebookCategoryRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  /** 打开新增弹窗，供工具栏“添加”按钮调用。 */
  function openCreate(): void {
    dialog.openCreate()
  }

  /** 打开编辑弹窗并回填当前行，供列表“修改”操作调用。 */
  function openEdit(row: NotebookCategoryRow): void {
    dialog.openEdit(row)
  }

  /** 提交弹窗并完成新增或编辑，成功后刷新当前列表。 */
  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateCategory(source.id, value)
          } else {
            await dependencies.createCategory(value)
          }

          dependencies.showSuccess('分类保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  /** 确认并删除分类，成功后刷新列表。 */
  async function removeCategory(row: NotebookCategoryRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此分类吗？')
      await dependencies.withLoading(() => dependencies.deleteCategory(row.id))
      dependencies.showSuccess('分类删除成功')
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
    removeCategory,
  }
}
