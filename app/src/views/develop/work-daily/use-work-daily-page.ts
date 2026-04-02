import { ref } from 'vue'

import {
  createWorkDailyLog,
  deleteWorkDailyLog,
  exportWorkDailyReport,
  fetchWorkDailyDetail,
  fetchWorkDailyList,
  fetchWorkDailyPlatforms,
  fetchWorkDailyReportModels,
  importWorkDailyMarkdown,
  updateWorkDailyLog,
} from '@/api/work-daily'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type {
  WorkDailyFormValue,
  WorkDailyImportPayload,
  WorkDailyImportResult,
  WorkDailyPlatformEntry,
  WorkDailyPlatformOption,
  WorkDailyQuery,
  WorkDailyReportModelOptions,
  WorkDailyReportRequest,
  WorkDailyReportType,
  WorkDailyRow,
} from '@/types/work-daily'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface WorkDailyPageDependencies {
  fetchLogs: (
    query: WorkDailyQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<WorkDailyRow>>
  fetchLogDetail: (id: number | string) => Promise<WorkDailyRow>
  createLog: (payload: WorkDailyFormValue) => Promise<WorkDailyRow>
  updateLog: (id: number | string, payload: WorkDailyFormValue) => Promise<WorkDailyRow>
  deleteLog: (id: number | string) => Promise<void>
  fetchPlatforms: () => Promise<WorkDailyPlatformOption[]>
  fetchReportModels: () => Promise<WorkDailyReportModelOptions>
  exportReport: (type: WorkDailyReportType, request: WorkDailyReportRequest) => Promise<Blob>
  importMarkdown: (payload: WorkDailyImportPayload) => Promise<WorkDailyImportResult>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function createInitialQuery(): WorkDailyQuery {
  return {
    platformId: null,
    dateRange: [],
    content: '',
  }
}

function createEmptyPlatformEntry(seed: Partial<WorkDailyPlatformEntry> = {}): WorkDailyPlatformEntry {
  return {
    platformId: seed.platformId ?? null,
    platformName: seed.platformName ?? '',
    content: seed.content ?? '',
  }
}

function createEmptyFormValue(): WorkDailyFormValue {
  return {
    logDate: '',
    platforms: [createEmptyPlatformEntry()],
  }
}

function mapRowToFormValue(row: WorkDailyRow): WorkDailyFormValue {
  return {
    id: row.id,
    logDate: row.logDate,
    platforms: row.content.platforms.length > 0
      ? row.content.platforms.map((entry) => createEmptyPlatformEntry(entry))
      : [createEmptyPlatformEntry()],
  }
}

function createCurrentMonth(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  return `${now.getFullYear()}-${month}`
}

function createCurrentYear(): string {
  return String(new Date().getFullYear())
}

function createDefaultWeekRange(): [string, string] {
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - 6)

  return [formatDateValue(start), formatDateValue(end)]
}

function formatDateValue(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatReportFilename(type: WorkDailyReportType, request: WorkDailyReportRequest): string {
  if (type === 'month') {
    return `牛马日常月报-${request.month}.md`
  }

  if (type === 'week') {
    return `牛马日常周报-${request.startDate}-${request.endDate}.md`
  }

  return `牛马日常年报-${request.year}.md`
}

export function useWorkDailyPage(overrides: Partial<WorkDailyPageDependencies> = {}) {
  const dependencies: WorkDailyPageDependencies = {
    fetchLogs: fetchWorkDailyList,
    fetchLogDetail: fetchWorkDailyDetail,
    createLog: createWorkDailyLog,
    updateLog: updateWorkDailyLog,
    deleteLog: deleteWorkDailyLog,
    fetchPlatforms: fetchWorkDailyPlatforms,
    fetchReportModels: fetchWorkDailyReportModels,
    exportReport: exportWorkDailyReport,
    importMarkdown: importWorkDailyMarkdown,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<WorkDailyRow, WorkDailyQuery>({
    createInitialQuery,
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchLogs(query, {
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

  const dialog = useDialogForm<WorkDailyFormValue, WorkDailyRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  const platforms = ref<WorkDailyPlatformOption[]>([])
  const auxiliaryLoading = ref(false)
  const importState = {
    year: ref(createCurrentYear()),
    importing: ref(false),
  }
  const report = {
    type: ref<WorkDailyReportType>('month'),
    model: ref(''),
    month: ref(createCurrentMonth()),
    weekRange: ref<[string, string]>(createDefaultWeekRange()),
    year: ref(createCurrentYear()),
    loading: ref(false),
    options: ref<string[]>([]),
  }

  async function initialize(): Promise<void> {
    auxiliaryLoading.value = true

    try {
      const [platformItems, modelOptions] = await Promise.all([
        dependencies.fetchPlatforms(),
        dependencies.fetchReportModels(),
      ])

      platforms.value = platformItems
      report.options.value = modelOptions.models
      report.model.value = modelOptions.currentModel
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      auxiliaryLoading.value = false
    }
  }

  function openCreate(): void {
    dialog.openCreate({
      logDate: formatDateValue(new Date()),
      platforms: [createEmptyPlatformEntry()],
    })
  }

  async function openEdit(row: WorkDailyRow): Promise<void> {
    const detail = await dependencies.fetchLogDetail(row.id)
    dialog.openEdit(detail)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateLog(source.id, value)
          } else {
            await dependencies.createLog(value)
          }

          dependencies.showSuccess('工作日常保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeLog(row: WorkDailyRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此信息吗？')
      await dependencies.withLoading(() => dependencies.deleteLog(row.id))
      dependencies.showSuccess('工作日常删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  async function importMarkdownFile(file: File): Promise<void> {
    importState.importing.value = true

    try {
      const result = await dependencies.withLoading(() =>
        dependencies.importMarkdown({
          file,
          year: importState.year.value,
        }),
      )

      dependencies.showSuccess(`导入成功，共 ${result.count} 条`)
      await list.reload()
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      importState.importing.value = false
    }
  }

  function createReportRequest(): WorkDailyReportRequest {
    if (report.type.value === 'month') {
      return {
        month: report.month.value,
        model: report.model.value || undefined,
      }
    }

    if (report.type.value === 'week') {
      return {
        startDate: report.weekRange.value[0],
        endDate: report.weekRange.value[1],
        model: report.model.value || undefined,
      }
    }

    return {
      year: report.year.value,
      model: report.model.value || undefined,
    }
  }

  async function exportCurrentReport(): Promise<{ blob: Blob; filename: string }> {
    const request = createReportRequest()

    report.loading.value = true

    try {
      const blob = await dependencies.withLoading(() => dependencies.exportReport(report.type.value, request))
      dependencies.showSuccess('报表导出成功')

      return {
        blob,
        filename: formatReportFilename(report.type.value, request),
      }
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      report.loading.value = false
    }
  }

  return {
    list,
    dialog,
    platforms,
    auxiliaryLoading,
    importState,
    report,
    initialize,
    openCreate,
    openEdit,
    submitDialog,
    removeLog,
    importMarkdown: importMarkdownFile,
    exportCurrentReport,
  }
}
