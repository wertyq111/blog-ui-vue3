import { ref } from 'vue'

import {
  convertInitModel,
  createInitModel,
  deleteInitModel,
  fetchInitModelDetail,
  fetchInitModelList,
  updateInitModel,
} from '@/api/init-model'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type {
  InitModelConvertValue,
  InitModelFormValue,
  InitModelQuery,
  InitModelRow,
} from '@/types/init-model'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface InitModelPageDependencies {
  fetchModels: (
    query: InitModelQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<InitModelRow>>
  fetchModelDetail: (id: number | string) => Promise<InitModelRow>
  createModel: (payload: InitModelFormValue) => Promise<InitModelRow>
  updateModel: (id: number | string, payload: InitModelFormValue) => Promise<InitModelRow>
  deleteModel: (id: number | string) => Promise<void>
  convertModel: (id: number | string, payload: InitModelConvertValue) => Promise<string>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function createInitialQuery(): InitModelQuery {
  return {
    code: '',
    name: '',
  }
}

function createEmptyFormValue(): InitModelFormValue {
  return {
    code: '',
    name: '',
    tip: '',
    template: '',
  }
}

function mapRowToFormValue(row: InitModelRow): InitModelFormValue {
  return {
    id: row.id,
    code: row.code ?? '',
    name: row.name ?? '',
    tip: row.tip ?? '',
    template: row.template ?? '',
  }
}

function createEmptyConvertValue(): InitModelConvertValue {
  return {
    column: '',
  }
}

export function useInitModelPage(overrides: Partial<InitModelPageDependencies> = {}) {
  const dependencies: InitModelPageDependencies = {
    fetchModels: fetchInitModelList,
    fetchModelDetail: fetchInitModelDetail,
    createModel: createInitModel,
    updateModel: updateInitModel,
    deleteModel: deleteInitModel,
    convertModel: convertInitModel,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<InitModelRow, InitModelQuery>({
    createInitialQuery,
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchModels(query, {
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

  const dialog = useDialogForm<InitModelFormValue, InitModelRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  const convertDialog = {
    visible: ref(false),
    source: ref<InitModelRow | null>(null),
    value: ref<InitModelConvertValue>(createEmptyConvertValue()),
    result: ref(''),
    submitting: ref(false),
  }

  function openCreate(): void {
    dialog.openCreate()
  }

  async function openEdit(row: InitModelRow): Promise<void> {
    const detail = await dependencies.fetchModelDetail(row.id)
    dialog.openEdit(detail)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateModel(source.id, value)
          } else {
            await dependencies.createModel(value)
          }

          dependencies.showSuccess('模型模板保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeModel(row: InitModelRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此信息吗？')
      await dependencies.withLoading(() => dependencies.deleteModel(row.id))
      dependencies.showSuccess('模型模板删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  function openConvert(row: InitModelRow): void {
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
        dependencies.convertModel(source.id, {
          column: convertDialog.value.value.column,
        }),
      )

      convertDialog.result.value = result
      dependencies.showSuccess('模板生成成功')
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
    removeModel,
    openConvert,
    closeConvert,
    submitConvertDialog,
  }
}
