import { ref } from 'vue'

import { fetchWorkDailyPlatforms } from '@/api/work-daily'
import {
  createWorkDoc,
  createWorkDocCategory,
  deleteWorkDoc,
  deleteWorkDocCategory,
  fetchWorkDocCategories,
  fetchWorkDocCategoryDetail,
  fetchWorkDocDetail,
  fetchWorkDocList,
  reorderWorkDocCategories,
  updateWorkDoc,
  updateWorkDocCategory,
} from '@/api/work-doc'
import { useCrudList } from '@/composables/use-crud-list'
import { useDialogForm } from '@/composables/use-dialog-form'
import type { PaginatedResult } from '@/types/api'
import type { WorkDailyPlatformOption } from '@/types/work-daily'
import type {
  WorkDocCategoryFormValue,
  WorkDocCategoryReorderItem,
  WorkDocCategoryRow,
  WorkDocFormValue,
  WorkDocQuery,
  WorkDocRow,
} from '@/types/work-doc'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface WorkDocPageDependencies {
  fetchCategories: (query: { status: number | null }) => Promise<WorkDocCategoryRow[]>
  fetchCategoryDetail: (id: number | string) => Promise<WorkDocCategoryRow>
  createCategory: (payload: WorkDocCategoryFormValue) => Promise<WorkDocCategoryRow>
  updateCategory: (id: number | string, payload: WorkDocCategoryFormValue) => Promise<WorkDocCategoryRow>
  deleteCategory: (id: number | string) => Promise<void>
  reorderCategories: (order: WorkDocCategoryReorderItem[]) => Promise<void>
  fetchDocs: (
    query: WorkDocQuery,
    pagination: { page: number; perPage: number },
  ) => Promise<PaginatedResult<WorkDocRow>>
  fetchDocDetail: (id: number | string) => Promise<WorkDocRow>
  createDoc: (payload: WorkDocFormValue) => Promise<WorkDocRow>
  updateDoc: (id: number | string, payload: WorkDocFormValue) => Promise<WorkDocRow>
  deleteDoc: (id: number | string) => Promise<void>
  fetchPlatforms: () => Promise<WorkDailyPlatformOption[]>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

export interface WorkDocTemplateOption {
  label: string
  value: string
  content: string
}

export const workDocTemplates: WorkDocTemplateOption[] = [
  {
    label: '自定义',
    value: 'custom',
    content: '',
  },
  {
    label: '故障排查',
    value: 'troubleshooting',
    content: '# 故障排查\n\n## 现象\n- \n\n## 影响范围\n- \n\n## 排查过程\n1. \n\n## 根因\n- \n\n## 解决方案\n- \n\n## 回归验证\n- \n\n## 后续优化\n- ',
  },
  {
    label: '方案设计',
    value: 'design',
    content: '# 方案设计\n\n## 背景\n- \n\n## 目标\n- \n\n## 方案概述\n- \n\n## 核心流程\n1. \n\n## 风险与取舍\n- \n\n## 里程碑\n- ',
  },
  {
    label: '知识点',
    value: 'knowledge',
    content: '# 知识点整理\n\n## 结论/要点\n- \n\n## 解释说明\n- \n\n## 示例\n```\n\n```\n\n## 参考资料\n- ',
  },
]

function createInitialQuery(): WorkDocQuery {
  return {
    keyword: '',
    status: null,
    templateType: null,
    categoryId: null,
  }
}

function createEmptyDocFormValue(): WorkDocFormValue {
  return {
    categoryId: null,
    title: '',
    content: '',
    templateType: 'custom',
    tags: [],
    status: 1,
    priority: 0,
    source: '',
    isPin: 0,
  }
}

function createEmptyCategoryFormValue(): WorkDocCategoryFormValue {
  return {
    parentId: 0,
    name: '',
    icon: '',
    description: '',
    sort: 0,
    status: 1,
  }
}

function mapDocToFormValue(row: WorkDocRow): WorkDocFormValue {
  return {
    id: row.id,
    categoryId: row.categoryId,
    title: row.title,
    content: row.content,
    templateType: row.templateType || 'custom',
    tags: row.tags ?? [],
    status: row.status ?? 1,
    priority: row.priority ?? 0,
    source: row.source ?? '',
    isPin: row.isPin ?? 0,
  }
}

function mapCategoryToFormValue(row: WorkDocCategoryRow): WorkDocCategoryFormValue {
  return {
    id: row.id,
    parentId: row.parentId ?? 0,
    name: row.name ?? '',
    icon: row.icon ?? '',
    description: row.description ?? '',
    sort: row.sort ?? 0,
    status: row.status ?? 1,
  }
}

function buildCategoryTree(rows: WorkDocCategoryRow[]): WorkDocCategoryRow[] {
  const nodeMap = new Map<number | string, WorkDocCategoryRow>()

  rows.forEach((row) => {
    nodeMap.set(row.id, {
      ...row,
      children: [],
    })
  })

  const rootNodes: WorkDocCategoryRow[] = []

  rows.forEach((row) => {
    const current = nodeMap.get(row.id)

    if (!current) {
      return
    }

    if (row.parentId && nodeMap.has(row.parentId)) {
      nodeMap.get(row.parentId)?.children?.push(current)
      return
    }

    rootNodes.push(current)
  })

  return rootNodes
}

export function useWorkDocPage(overrides: Partial<WorkDocPageDependencies> = {}) {
  const dependencies: WorkDocPageDependencies = {
    fetchCategories: fetchWorkDocCategories,
    fetchCategoryDetail: fetchWorkDocCategoryDetail,
    createCategory: createWorkDocCategory,
    updateCategory: updateWorkDocCategory,
    deleteCategory: deleteWorkDocCategory,
    reorderCategories: reorderWorkDocCategories,
    fetchDocs: fetchWorkDocList,
    fetchDocDetail: fetchWorkDocDetail,
    createDoc: createWorkDoc,
    updateDoc: updateWorkDoc,
    deleteDoc: deleteWorkDoc,
    fetchPlatforms: fetchWorkDailyPlatforms,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const list = useCrudList<WorkDocRow, WorkDocQuery>({
    createInitialQuery,
    fetchPage: async ({ page, perPage, query }) => {
      const result = await dependencies.fetchDocs(query, {
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

  const docDialog = useDialogForm<WorkDocFormValue, WorkDocRow>({
    createInitialValue: createEmptyDocFormValue,
    mapSourceToValue: mapDocToFormValue,
  })

  const categoryDialog = useDialogForm<WorkDocCategoryFormValue, WorkDocCategoryRow>({
    createInitialValue: createEmptyCategoryFormValue,
    mapSourceToValue: mapCategoryToFormValue,
  })

  const categories = ref<WorkDocCategoryRow[]>([])
  const categoryTree = ref<WorkDocCategoryRow[]>([])
  const currentCategory = ref<WorkDocCategoryRow | null>(null)
  const platforms = ref<WorkDailyPlatformOption[]>([])
  const previewDoc = ref<WorkDocRow | null>(null)
  const templates = ref(workDocTemplates)
  const auxiliaryLoading = ref(false)

  async function reloadDocs(): Promise<void> {
    await list.reload()
  }

  async function selectCategory(category: WorkDocCategoryRow | null): Promise<void> {
    currentCategory.value = category
    list.query.value.categoryId = category?.id ?? null
    await list.search()
  }

  async function loadCategories(): Promise<void> {
    const categoryRows = await dependencies.fetchCategories({ status: 1 })
    categories.value = categoryRows
    categoryTree.value = buildCategoryTree(categoryRows)

    const currentId = currentCategory.value?.id
    const nextCurrent = categoryRows.find((item) => item.id === currentId) ?? categoryRows[0] ?? null

    currentCategory.value = nextCurrent
    list.query.value.categoryId = nextCurrent?.id ?? null
  }

  async function initialize(): Promise<void> {
    auxiliaryLoading.value = true

    try {
      const [sourceOptions] = await Promise.all([
        dependencies.fetchPlatforms(),
        loadCategories(),
      ])

      platforms.value = sourceOptions
      await list.reload()
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      auxiliaryLoading.value = false
    }
  }

  function openCreateDoc(): void {
    docDialog.openCreate({
      categoryId: currentCategory.value?.id ?? null,
    })
  }

  async function openEditDoc(row: WorkDocRow): Promise<void> {
    const detail = await dependencies.fetchDocDetail(row.id)
    docDialog.openEdit(detail)
  }

  async function submitDocDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        docDialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateDoc(source.id, value)
          } else {
            await dependencies.createDoc(value)
          }

          dependencies.showSuccess('文档保存成功')
          await list.reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeDoc(row: WorkDocRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此文档吗？')
      await dependencies.withLoading(() => dependencies.deleteDoc(row.id))
      dependencies.showSuccess('文档删除成功')
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  function openCreateCategory(): void {
    categoryDialog.openCreate({
      parentId: currentCategory.value?.id ? Number(currentCategory.value.id) : 0,
    })
  }

  async function openEditCategory(row: WorkDocCategoryRow): Promise<void> {
    const detail = await dependencies.fetchCategoryDetail(row.id)
    categoryDialog.openEdit(detail)
  }

  async function submitCategoryDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        categoryDialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateCategory(source.id, value)
          } else {
            await dependencies.createCategory(value)
          }

          dependencies.showSuccess('分类保存成功')
          await loadCategories()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeCurrentCategory(): Promise<void> {
    const category = currentCategory.value

    if (!category) {
      return
    }

    try {
      await dependencies.confirmWarning('确定要删除此分类吗？')
      await dependencies.withLoading(() => dependencies.deleteCategory(category.id))
      dependencies.showSuccess('分类删除成功')
      await loadCategories()
      await list.reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  async function saveCategoryOrder(order: WorkDocCategoryReorderItem[]): Promise<void> {
    try {
      await dependencies.withLoading(() => dependencies.reorderCategories(order))
      dependencies.showSuccess('分类排序已保存')
      await loadCategories()
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  function openPreview(row: WorkDocRow): void {
    previewDoc.value = row
  }

  return {
    list,
    docDialog,
    categoryDialog,
    categories,
    categoryTree,
    currentCategory,
    platforms,
    templates,
    previewDoc,
    auxiliaryLoading,
    initialize,
    reloadDocs,
    selectCategory,
    openCreateDoc,
    openEditDoc,
    submitDocDialog,
    removeDoc,
    openCreateCategory,
    openEditCategory,
    submitCategoryDialog,
    removeCurrentCategory,
    saveCategoryOrder,
    openPreview,
  }
}
