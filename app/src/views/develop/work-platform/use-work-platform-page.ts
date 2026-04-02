import { computed, ref, watch } from 'vue'

import {
  createWorkPlatform,
  deleteWorkPlatform,
  fetchWorkPlatformDetail,
  fetchWorkPlatformList,
  reorderWorkPlatform,
  updateWorkPlatform,
} from '@/api/work-platform'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type { WorkPlatformFormValue, WorkPlatformQuery, WorkPlatformReorderItem, WorkPlatformRow } from '@/types/work-platform'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface WorkPlatformPageDependencies {
  fetchPlatforms: (
    query: WorkPlatformQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<WorkPlatformRow>>
  fetchPlatformDetail: (id: number | string) => Promise<WorkPlatformRow>
  createPlatform: (payload: WorkPlatformFormValue) => Promise<WorkPlatformRow>
  updatePlatform: (id: number | string, payload: WorkPlatformFormValue) => Promise<WorkPlatformRow>
  deletePlatform: (id: number | string) => Promise<void>
  reorderPlatforms: (order: WorkPlatformReorderItem[]) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function createInitialQuery(): WorkPlatformQuery {
  return {
    name: '',
    status: null,
  }
}

function createEmptyFormValue(): WorkPlatformFormValue {
  return {
    name: '',
    status: 1,
    sort: 0,
  }
}

function mapRowToFormValue(row: WorkPlatformRow): WorkPlatformFormValue {
  return {
    id: row.id,
    name: row.name ?? '',
    status: Number(row.status ?? 1),
    sort: Number(row.sort ?? 0),
  }
}

function normalizeRowOrder(rows: WorkPlatformRow[]): WorkPlatformRow[] {
  return rows.map((row, index) => ({
    ...row,
    sort: (index + 1) * 10,
  }))
}

function moveItem(rows: WorkPlatformRow[], from: number, to: number): WorkPlatformRow[] {
  if (from < 0 || to < 0 || from >= rows.length || to >= rows.length) {
    return rows
  }

  const nextRows = [...rows]
  const [moved] = nextRows.splice(from, 1)

  if (!moved) {
    return rows
  }

  nextRows.splice(to, 0, moved)

  return normalizeRowOrder(nextRows)
}

export function useWorkPlatformPage(overrides: Partial<WorkPlatformPageDependencies> = {}) {
  const dependencies: WorkPlatformPageDependencies = {
    fetchPlatforms: fetchWorkPlatformList,
    fetchPlatformDetail: fetchWorkPlatformDetail,
    createPlatform: createWorkPlatform,
    updatePlatform: updateWorkPlatform,
    deletePlatform: deleteWorkPlatform,
    reorderPlatforms: reorderWorkPlatform,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<WorkPlatformRow, WorkPlatformQuery>({
    createInitialQuery,
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchPlatforms(query, {
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

  const dialog = useDialogForm<WorkPlatformFormValue, WorkPlatformRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  const orderedItems = ref<WorkPlatformRow[]>([])

  watch(
    () => list.items.value,
    (items) => {
      orderedItems.value = normalizeRowOrder(items.map((item) => ({ ...item })))
    },
    {
      immediate: true,
      deep: true,
    },
  )

  const hasOrderChanges = computed(() =>
    orderedItems.value.some((item, index) => item.id !== list.items.value[index]?.id),
  )

  function openCreate(): void {
    dialog.openCreate()
  }

  async function openEdit(row: WorkPlatformRow): Promise<void> {
    const detail = await dependencies.fetchPlatformDetail(row.id)
    dialog.openEdit(detail)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updatePlatform(source.id, value)
          } else {
            await dependencies.createPlatform(value)
          }

          dependencies.showSuccess('平台信息保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removePlatform(row: WorkPlatformRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此信息吗？')
      await dependencies.withLoading(() => dependencies.deletePlatform(row.id))
      dependencies.showSuccess('平台信息删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  function moveUp(index: number): void {
    orderedItems.value = moveItem(orderedItems.value, index, index - 1)
  }

  function moveDown(index: number): void {
    orderedItems.value = moveItem(orderedItems.value, index, index + 1)
  }

  async function saveOrder(): Promise<void> {
    const payload = orderedItems.value.map((item, index) => ({
      id: item.id,
      sort: (index + 1) * 10,
    }))

    try {
      await dependencies.withLoading(() => dependencies.reorderPlatforms(payload))
      dependencies.showSuccess('排序已保存')
      await list.reload()
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  return {
    list,
    dialog,
    orderedItems,
    hasOrderChanges,
    openCreate,
    openEdit,
    submitDialog,
    removePlatform,
    moveUp,
    moveDown,
    saveOrder,
  }
}
