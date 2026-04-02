import { ref } from 'vue'

import {
  createWallpaper,
  deleteWallpaper,
  fetchWallpaperClassifyOptions,
  fetchWallpaperList,
  updateWallpaper,
} from '@/api/wallpaper'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type {
  WallpaperClassifyOption,
  WallpaperFormValue,
  WallpaperQuery,
  WallpaperRow,
} from '@/types/wallpaper'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface WallpaperPageDependencies {
  fetchWallpapers: (
    query: WallpaperQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<WallpaperRow>>
  fetchClassifies: () => Promise<WallpaperClassifyOption[]>
  createWallpaper: (payload: WallpaperFormValue) => Promise<WallpaperRow>
  updateWallpaper: (id: number | string, payload: WallpaperFormValue) => Promise<WallpaperRow>
  deleteWallpaper: (id: number | string) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function parseTags(value: WallpaperRow['tags']): string[] {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag))
  }

  if (typeof value === 'string') {
    const nextValue = value.trim()

    if (nextValue.length === 0) {
      return []
    }

    try {
      const parsed = JSON.parse(nextValue)

      return Array.isArray(parsed) ? parsed.map((tag) => String(tag)) : [nextValue]
    } catch {
      return [nextValue]
    }
  }

  return []
}

function createEmptyFormValue(): WallpaperFormValue {
  return {
    classId: '',
    nickname: '',
    url: '',
    smallPicUrl: '',
    description: '',
    tags: [],
    score: 0,
  }
}

function mapRowToFormValue(row: WallpaperRow): WallpaperFormValue {
  return {
    id: row.id,
    classId: row.classId ?? row.classify?.id ?? '',
    nickname: row.nickname ?? '',
    url: row.url ?? '',
    smallPicUrl: row.smallPicUrl ?? '',
    description: row.description ?? '',
    tags: parseTags(row.tags),
    score: Number.isFinite(row.score) ? Number(row.score) : 0,
  }
}

export function useWallpaperPage(overrides: Partial<WallpaperPageDependencies> = {}) {
  const dependencies: WallpaperPageDependencies = {
    fetchWallpapers: fetchWallpaperList,
    fetchClassifies: fetchWallpaperClassifyOptions,
    createWallpaper,
    updateWallpaper,
    deleteWallpaper,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<WallpaperRow, WallpaperQuery>({
    createInitialQuery: () => ({
      classId: '',
      nickname: '',
    }),
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchWallpapers(query, {
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

  const dialog = useDialogForm<WallpaperFormValue, WallpaperRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  const classifyOptions = ref<WallpaperClassifyOption[]>([])
  const classifyLoading = ref(false)

  async function reloadClassifyOptions(): Promise<void> {
    classifyLoading.value = true

    try {
      classifyOptions.value = await dependencies.fetchClassifies()
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      classifyLoading.value = false
    }
  }

  function openCreate(): void {
    dialog.openCreate()
  }

  function openEdit(row: WallpaperRow): void {
    dialog.openEdit(row)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateWallpaper(source.id, value)
          } else {
            await dependencies.createWallpaper(value)
          }

          dependencies.showSuccess('壁纸保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeWallpaper(row: WallpaperRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此壁纸吗？')
      await dependencies.withLoading(() => dependencies.deleteWallpaper(row.id))
      dependencies.showSuccess('壁纸删除成功')
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
    classifyOptions,
    classifyLoading,
    reloadClassifyOptions,
    openCreate,
    openEdit,
    submitDialog,
    removeWallpaper,
  }
}
