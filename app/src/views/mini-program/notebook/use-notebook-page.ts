import { computed, ref } from 'vue'

import {
  createNotebookArticle,
  deleteNotebookArticle,
  fetchNotebookArticleCategoryOptions,
  fetchNotebookArticleList,
  updateNotebookArticle,
} from '@/api/notebook-article'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type {
  NotebookArticleCategoryOption,
  NotebookArticleFormValue,
  NotebookArticleLabelOption,
  NotebookArticleQuery,
  NotebookArticleRow,
} from '@/types/notebook-article'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface NotebookPageDependencies {
  fetchArticles: (
    query: NotebookArticleQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<NotebookArticleRow>>
  fetchCategories: () => Promise<NotebookArticleCategoryOption[]>
  createArticle: (payload: NotebookArticleFormValue) => Promise<NotebookArticleRow>
  updateArticle: (id: number | string, payload: NotebookArticleFormValue) => Promise<NotebookArticleRow>
  deleteArticle: (id: number | string) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

function createEmptyFormValue(): NotebookArticleFormValue {
  return {
    title: '',
    content: '',
    cover: '',
    categoryId: '',
    labelId: '',
    viewStatus: true,
    commentStatus: true,
    recommendStatus: false,
    password: '',
  }
}

function mapRowToFormValue(row: NotebookArticleRow): NotebookArticleFormValue {
  return {
    id: row.id,
    title: row.title ?? '',
    content: row.content ?? '',
    cover: row.cover ?? '',
    categoryId: row.categoryId ?? row.category?.id ?? '',
    labelId: row.labelId ?? row.label?.id ?? '',
    viewStatus: row.viewStatus ?? true,
    commentStatus: row.commentStatus ?? true,
    recommendStatus: row.recommendStatus ?? false,
    password: '',
  }
}

export function useNotebookPage(overrides: Partial<NotebookPageDependencies> = {}) {
  const dependencies: NotebookPageDependencies = {
    fetchArticles: fetchNotebookArticleList,
    fetchCategories: fetchNotebookArticleCategoryOptions,
    createArticle: createNotebookArticle,
    updateArticle: updateNotebookArticle,
    deleteArticle: deleteNotebookArticle,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<NotebookArticleRow, NotebookArticleQuery>({
    createInitialQuery: () => ({
      title: '',
      categoryId: '',
      labelId: '',
    }),
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchArticles(query, {
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

  const dialog = useDialogForm<NotebookArticleFormValue, NotebookArticleRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  const categoryOptions = ref<NotebookArticleCategoryOption[]>([])
  const categoryLoading = ref(false)

  const currentLabelOptions = computed<NotebookArticleLabelOption[]>(() => {
    const categoryId = dialog.value.value.categoryId

    if (categoryId === '' || categoryId === undefined || categoryId === null) {
      return []
    }

    const matched = categoryOptions.value.find((category) => `${category.id}` === `${categoryId}`)

    return matched?.labels ?? []
  })

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

  function resetInvalidLabelSelection(): void {
    const labelId = dialog.value.value.labelId

    if (labelId === '' || labelId === undefined || labelId === null) {
      return
    }

    const exists = currentLabelOptions.value.some((label) => `${label.id}` === `${labelId}`)

    if (!exists) {
      dialog.value.value.labelId = ''
    }
  }

  function openCreate(): void {
    dialog.openCreate()
  }

  function openEdit(row: NotebookArticleRow): void {
    dialog.openEdit(row)
    resetInvalidLabelSelection()
  }

  function handleCategoryChange(categoryId: number | string | ''): void {
    dialog.value.value.categoryId = categoryId
    resetInvalidLabelSelection()
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateArticle(source.id, value)
          } else {
            await dependencies.createArticle(value)
          }

          dependencies.showSuccess('文章保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeArticle(row: NotebookArticleRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此文章吗？')
      await dependencies.withLoading(() => dependencies.deleteArticle(row.id))
      dependencies.showSuccess('文章删除成功')
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
    currentLabelOptions,
    reloadCategoryOptions,
    openCreate,
    openEdit,
    handleCategoryChange,
    submitDialog,
    removeArticle,
  }
}
