import { ref } from 'vue'

import {
  createPhoto,
  deletePhoto,
  deletePhotoBatch,
  fetchPhotoCategoryOptions,
  fetchPhotoList,
  updatePhoto,
} from '@/api/photo'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type { PhotoCategoryOption, PhotoFormValue, PhotoQuery, PhotoRow } from '@/types/photo'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface PhotoPageDependencies {
  fetchPhotos: (
    query: PhotoQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<PhotoRow>>
  fetchCategories: () => Promise<PhotoCategoryOption[]>
  createPhoto: (payload: PhotoFormValue) => Promise<PhotoRow>
  updatePhoto: (id: number | string, payload: PhotoFormValue) => Promise<PhotoRow>
  deletePhoto: (id: number | string) => Promise<void>
  deletePhotoBatch: (ids: Array<number | string>) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function createEmptyFormValue(): PhotoFormValue {
  return {
    categoryId: '',
    url: '',
    remark: '',
  }
}

function mapRowToFormValue(row: PhotoRow): PhotoFormValue {
  return {
    id: row.id,
    categoryId: row.categoryId ?? row.category?.id ?? '',
    url: row.url ?? '',
    remark: row.remark ?? '',
  }
}

export function usePhotoPage(overrides: Partial<PhotoPageDependencies> = {}) {
  const dependencies: PhotoPageDependencies = {
    fetchPhotos: fetchPhotoList,
    fetchCategories: fetchPhotoCategoryOptions,
    createPhoto,
    updatePhoto,
    deletePhoto,
    deletePhotoBatch,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<PhotoRow, PhotoQuery>({
    createInitialQuery: () => ({
      categoryId: '',
      remark: '',
    }),
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchPhotos(query, {
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

  const dialog = useDialogForm<PhotoFormValue, PhotoRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  const categoryOptions = ref<PhotoCategoryOption[]>([])
  const categoryLoading = ref(false)

  async function reloadCategoryOptions(): Promise<void> {
    categoryLoading.value = true

    try {
      categoryOptions.value = await dependencies.fetchCategories()
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      categoryLoading.value = false
    }
  }

  function openCreate(): void {
    dialog.openCreate()
  }

  function openEdit(row: PhotoRow): void {
    dialog.openEdit(row)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updatePhoto(source.id, value)
          } else {
            await dependencies.createPhoto(value)
          }

          dependencies.showSuccess('照片保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removePhoto(row: PhotoRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此照片吗？')
      await dependencies.withLoading(() => dependencies.deletePhoto(row.id))
      dependencies.showSuccess('照片删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  async function removeBatch(): Promise<void> {
    const selectedRows = list.selection.value

    if (selectedRows.length === 0) {
      dependencies.showError('请至少选择一条照片数据')
      return
    }

    try {
      await dependencies.confirmWarning('确定要删除选中的照片吗？')
      await dependencies.withLoading(() => dependencies.deletePhotoBatch(selectedRows.map((row) => row.id)))
      dependencies.showSuccess('照片批量删除成功')
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
    reloadCategoryOptions,
    openCreate,
    openEdit,
    submitDialog,
    removePhoto,
    removeBatch,
  }
}
