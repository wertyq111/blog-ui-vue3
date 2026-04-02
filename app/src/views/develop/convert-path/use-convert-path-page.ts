import { ref } from 'vue'

import {
  convertServerPath,
  createServerPath,
  deleteServerPath,
  fetchServerPathDetail,
  fetchServerPathList,
  updateServerPath,
} from '@/api/server-path'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type {
  ServerPathConvertValue,
  ServerPathFormValue,
  ServerPathQuery,
  ServerPathRow,
} from '@/types/server-path'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface ConvertPathPageDependencies {
  fetchPaths: (
    query: ServerPathQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<ServerPathRow>>
  fetchPathDetail: (id: number | string) => Promise<ServerPathRow>
  createPath: (payload: ServerPathFormValue) => Promise<ServerPathRow>
  updatePath: (id: number | string, payload: ServerPathFormValue) => Promise<ServerPathRow>
  deletePath: (id: number | string) => Promise<void>
  convertPath: (id: number | string, payload: ServerPathConvertValue) => Promise<string[]>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function createInitialQuery(): ServerPathQuery {
  return {
    name: '',
  }
}

function createEmptyFormValue(): ServerPathFormValue {
  return {
    code: '',
    name: '',
    url: '',
    target: '',
    sources: [''],
    sort: 0,
  }
}

function mapRowToFormValue(row: ServerPathRow): ServerPathFormValue {
  return {
    id: row.id,
    code: row.code ?? '',
    name: row.name ?? '',
    url: row.url ?? '',
    target: row.target ?? '',
    sources: row.sources.length > 0 ? [...row.sources] : [''],
    sort: row.sort ?? 0,
  }
}

function normalizeSources(value: string[]): string[] {
  const nextValue = value
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  return nextValue.length > 0 ? nextValue : ['']
}

function createEmptyConvertValue(): ServerPathConvertValue {
  return {
    path: '',
  }
}

export function useConvertPathPage(overrides: Partial<ConvertPathPageDependencies> = {}) {
  const dependencies: ConvertPathPageDependencies = {
    fetchPaths: fetchServerPathList,
    fetchPathDetail: fetchServerPathDetail,
    createPath: createServerPath,
    updatePath: updateServerPath,
    deletePath: deleteServerPath,
    convertPath: convertServerPath,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<ServerPathRow, ServerPathQuery>({
    createInitialQuery,
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchPaths(query, {
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

  const dialog = useDialogForm<ServerPathFormValue, ServerPathRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  const convertDialog = {
    visible: ref(false),
    source: ref<ServerPathRow | null>(null),
    value: ref<ServerPathConvertValue>(createEmptyConvertValue()),
    result: ref(''),
    submitting: ref(false),
  }

  function openCreate(): void {
    dialog.openCreate()
    dialog.value.value.sources = ['']
  }

  async function openEdit(row: ServerPathRow): Promise<void> {
    const detail = await dependencies.fetchPathDetail(row.id)
    dialog.openEdit(detail)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          const payload: ServerPathFormValue = {
            ...value,
            sources: normalizeSources(value.sources),
          }

          if (source) {
            await dependencies.updatePath(source.id, payload)
          } else {
            await dependencies.createPath(payload)
          }

          dependencies.showSuccess('路径配置保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removePath(row: ServerPathRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此信息吗？')
      await dependencies.withLoading(() => dependencies.deletePath(row.id))
      dependencies.showSuccess('路径配置删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  function openConvert(row: ServerPathRow): void {
    convertDialog.source.value = row
    convertDialog.value.value = createEmptyConvertValue()
    convertDialog.result.value = ''
    convertDialog.visible.value = true
  }

  function closeConvert(): void {
    convertDialog.visible.value = false
    convertDialog.source.value = null
    convertDialog.value.value = createEmptyConvertValue()
    convertDialog.result.value = ''
  }

  async function submitConvertDialog(): Promise<void> {
    const source = convertDialog.source.value

    if (!source) {
      return
    }

    convertDialog.submitting.value = true

    try {
      const result = await dependencies.withLoading(() =>
        dependencies.convertPath(source.id, {
          path: convertDialog.value.value.path,
        }),
      )

      convertDialog.result.value = result.join('\n')
      dependencies.showSuccess('路径转换成功')
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      convertDialog.submitting.value = false
    }
  }

  return {
    list,
    dialog,
    convertDialog,
    openCreate,
    openEdit,
    submitDialog,
    removePath,
    openConvert,
    closeConvert,
    submitConvertDialog,
  }
}
