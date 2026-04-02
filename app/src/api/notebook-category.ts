import type { PaginatedResult } from '@/types/api'
import type {
  NotebookCategoryFormValue,
  NotebookCategoryQuery,
  NotebookCategoryRow,
} from '@/types/notebook-category'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

/** 将搜索关键词裁剪为后端可用值，空关键词会被转成 `undefined`。 */
function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

/** 序列化分类表单，供新增和编辑接口统一复用。 */
function serializeFormValue(payload: NotebookCategoryFormValue) {
  const normalizedName = payload.name.trim()
  const normalizedDescription = payload.description.trim() || normalizedName

  return {
    name: normalizedName,
    description: normalizedDescription,
    priority: payload.priority,
  }
}

/** 获取文章分类列表，供页面初始化、搜索和翻页时调用。 */
export async function fetchNotebookCategoryList(
  query: NotebookCategoryQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<NotebookCategoryRow>> {
  const response = await apiClient.get('/categories/index', {
    params: {
      name: trimQueryValue(query.name),
      page: pagination.page,
    },
  })

  return extractCollectionPayload<NotebookCategoryRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })
}

/** 创建文章分类，供新增弹窗提交时调用。 */
export async function createNotebookCategory(payload: NotebookCategoryFormValue): Promise<NotebookCategoryRow> {
  const response = await apiClient.post('/categories/add', serializeFormValue(payload))

  return extractPayload<NotebookCategoryRow>(response)
}

/** 更新文章分类，供编辑弹窗提交时调用。 */
export async function updateNotebookCategory(
  id: number | string,
  payload: NotebookCategoryFormValue,
): Promise<NotebookCategoryRow> {
  const response = await apiClient.post(`/categories/${id}`, serializeFormValue(payload))

  return extractPayload<NotebookCategoryRow>(response)
}

/** 删除文章分类，供列表删除动作调用。 */
export async function deleteNotebookCategory(id: number | string): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}
