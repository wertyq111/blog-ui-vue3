import {
  createWallpaperClassify,
  deleteWallpaperClassify,
  fetchWallpaperClassifyList,
  updateWallpaperClassify,
} from '@/api/wallpaper-classify'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type {
  WallpaperClassifyFormValue,
  WallpaperClassifyQuery,
  WallpaperClassifyRow,
} from '@/types/wallpaper-classify'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface WallpaperClassifyPageDependencies {
  fetchClassifies: (
    query: WallpaperClassifyQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<WallpaperClassifyRow>>
  createClassify: (payload: WallpaperClassifyFormValue) => Promise<WallpaperClassifyRow>
  updateClassify: (id: number | string, payload: WallpaperClassifyFormValue) => Promise<WallpaperClassifyRow>
  deleteClassify: (id: number | string) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function createEmptyFormValue(): WallpaperClassifyFormValue {
  return {
    name: '',
    picUrl: '',
    select: false,
    sort: 0,
  }
}

function mapRowToFormValue(row: WallpaperClassifyRow): WallpaperClassifyFormValue {
  return {
    id: row.id,
    name: row.name,
    picUrl: row.picUrl ?? '',
    select: !!row.select,
    sort: row.sort ?? 0,
  }
}

export function useWallpaperClassifyPage(overrides: Partial<WallpaperClassifyPageDependencies> = {}) {
  const dependencies: WallpaperClassifyPageDependencies = {
    fetchClassifies: fetchWallpaperClassifyList,
    createClassify: createWallpaperClassify,
    updateClassify: updateWallpaperClassify,
    deleteClassify: deleteWallpaperClassify,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<WallpaperClassifyRow, WallpaperClassifyQuery>({
    createInitialQuery: () => ({
      name: '',
    }),
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchClassifies(query, {
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

  const dialog = useDialogForm<WallpaperClassifyFormValue, WallpaperClassifyRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  function openCreate(): void {
    dialog.openCreate()
  }

  function openEdit(row: WallpaperClassifyRow): void {
    dialog.openEdit(row)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateClassify(source.id, value)
          } else {
            await dependencies.createClassify(value)
          }

          dependencies.showSuccess('壁纸分类保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeClassify(row: WallpaperClassifyRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此壁纸分类吗？')
      await dependencies.withLoading(() => dependencies.deleteClassify(row.id))
      dependencies.showSuccess('壁纸分类删除成功')
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
    removeClassify,
  }
}
