import type { PaginatedResult } from '@/types/api'
import type {
  NotebookLabelCategoryOption,
  NotebookLabelFormValue,
  NotebookLabelQuery,
  NotebookLabelRow,
} from '@/types/notebook-label'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

/** 将搜索关键词裁剪后返回，空字符串会转成 `undefined` 防止无效查询参数。 */
function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

/** 序列化标签表单，供新增和编辑接口复用请求体字段。 */
function serializeFormValue(payload: NotebookLabelFormValue) {
  const normalizedName = payload.name.trim()
  const normalizedDescription = payload.description.trim() || normalizedName

  return {
    categoryId: payload.categoryId,
    name: normalizedName,
    description: normalizedDescription,
  }
}

/** 获取标签列表，供页面初始化、搜索和翻页场景调用。 */
export async function fetchNotebookLabelList(
  query: NotebookLabelQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<NotebookLabelRow>> {
  const response = await apiClient.get('/labels/index', {
    params: {
      include: 'category',
      name: trimQueryValue(query.name),
      page: pagination.page,
    },
  })

  return extractCollectionPayload<NotebookLabelRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })
}

/** 获取文章分类下拉选项，供标签编辑弹窗选择所属分类。 */
export async function fetchNotebookLabelCategoryOptions(): Promise<NotebookLabelCategoryOption[]> {
  const response = await apiClient.get('/categories/list')

  return extractPayload<NotebookLabelCategoryOption[]>(response)
}

/** 创建文章标签，供新增弹窗提交时调用。 */
export async function createNotebookLabel(payload: NotebookLabelFormValue): Promise<NotebookLabelRow> {
  const response = await apiClient.post('/labels/add', serializeFormValue(payload))

  return extractPayload<NotebookLabelRow>(response)
}

/** 更新文章标签，供编辑弹窗提交时调用。 */
export async function updateNotebookLabel(
  id: number | string,
  payload: NotebookLabelFormValue,
): Promise<NotebookLabelRow> {
  const response = await apiClient.post(`/labels/${id}`, serializeFormValue(payload))

  return extractPayload<NotebookLabelRow>(response)
}

/** 删除文章标签，供列表删除操作调用。 */
export async function deleteNotebookLabel(id: number | string): Promise<void> {
  await apiClient.delete(`/labels/${id}`)
}
