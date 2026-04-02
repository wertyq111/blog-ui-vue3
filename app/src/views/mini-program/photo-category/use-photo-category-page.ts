import { createPhotoCategory, deletePhotoCategory, fetchPhotoCategoryList, updatePhotoCategory } from '@/api/photo-category'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type { PhotoCategoryFormValue, PhotoCategoryQuery, PhotoCategoryRow } from '@/types/photo-category'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface PhotoCategoryPageDependencies {
  fetchCategories: (
    query: PhotoCategoryQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<PhotoCategoryRow>>
  createCategory: (payload: PhotoCategoryFormValue) => Promise<PhotoCategoryRow>
  updateCategory: (id: number | string, payload: PhotoCategoryFormValue) => Promise<PhotoCategoryRow>
  deleteCategory: (id: number | string) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

/** 创建新增弹窗的默认表单值，供打开“新增相册分类”时重置表单使用。 */
function createEmptyFormValue(): PhotoCategoryFormValue {
  return {
    name: '',
  }
}

/** 把列表行数据转换成弹窗表单值，供编辑场景回填当前分类信息。 */
function mapRowToFormValue(row: PhotoCategoryRow): PhotoCategoryFormValue {
  return {
    id: row.id,
    name: row.name,
  }
}

/** 组装相册分类页面的列表、弹窗和增删改动作；页面组件通过它拿到全部状态和事件处理函数。 */
export function usePhotoCategoryPage(overrides: Partial<PhotoCategoryPageDependencies> = {}) {
  const dependencies: PhotoCategoryPageDependencies = {
    fetchCategories: fetchPhotoCategoryList,
    createCategory: createPhotoCategory,
    updateCategory: updatePhotoCategory,
    deleteCategory: deletePhotoCategory,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<PhotoCategoryRow, PhotoCategoryQuery>({
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

  const dialog = useDialogForm<PhotoCategoryFormValue, PhotoCategoryRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  /** 打开新增弹窗，供页面点击“新增”按钮时调用。 */
  function openCreate(): void {
    dialog.openCreate()
  }

  /** 打开编辑弹窗并回填当前行数据，供列表点击“编辑”按钮时调用。 */
  function openEdit(row: PhotoCategoryRow): void {
    dialog.openEdit(row)
  }

  /** 提交弹窗表单并根据当前模式执行新增或编辑；成功后提示并刷新列表。 */
  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateCategory(source.id, value)
          } else {
            await dependencies.createCategory(value)
          }

          dependencies.showSuccess('相册保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  /** 确认后删除指定分类，供列表“删除”操作调用；删除成功后重新加载当前页数据。 */
  async function removeCategory(row: PhotoCategoryRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此相册吗？')
      await dependencies.withLoading(() => dependencies.deleteCategory(row.id))
      dependencies.showSuccess('相册删除成功')
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
