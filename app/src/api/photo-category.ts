import type { PaginatedResult } from '@/types/api'
import type { PhotoCategoryFormValue, PhotoCategoryQuery, PhotoCategoryRow } from '@/types/photo-category'
import { extractCollectionPayload, extractPayload } from '@/utils/http'

import { apiClient } from './client'

/** 将搜索框输入裁剪为空值时返回 `undefined`，供列表查询时避免把空字符串发给后端。 */
function trimQueryValue(value: string): string | undefined {
  const nextValue = value.trim()

  return nextValue.length > 0 ? nextValue : undefined
}

/** 获取相册分类列表，供页面初始化、搜索和翻页时调用；当前按后端已确认的扁平 `name` 查询参数发送请求。 */
export async function fetchPhotoCategoryList(
  query: PhotoCategoryQuery,
  pagination: {
    page: number
    perPage: number
  },
): Promise<PaginatedResult<PhotoCategoryRow>> {
  const response = await apiClient.get('/photo-categories/index', {
    params: {
      name: trimQueryValue(query.name),
      page: pagination.page,
    },
  })

  return extractCollectionPayload<PhotoCategoryRow>(response, {
    currentPage: pagination.page,
    perPage: pagination.perPage,
  })
}

/** 创建相册分类，供新增弹窗提交时调用；传入表单值后返回后端保存后的分类数据。 */
export async function createPhotoCategory(payload: PhotoCategoryFormValue): Promise<PhotoCategoryRow> {
  const response = await apiClient.post('/photo-categories/add', {
    name: payload.name,
  })

  return extractPayload<PhotoCategoryRow>(response)
}

/** 更新指定相册分类，供编辑弹窗提交时调用；需要传入分类 id 和表单值。 */
export async function updatePhotoCategory(
  id: number | string,
  payload: PhotoCategoryFormValue,
): Promise<PhotoCategoryRow> {
  const response = await apiClient.post(`/photo-categories/${id}`, {
    name: payload.name,
  })

  return extractPayload<PhotoCategoryRow>(response)
}

/** 删除指定相册分类，供列表删除操作调用；只需要传入当前行的分类 id。 */
export async function deletePhotoCategory(id: number | string): Promise<void> {
  await apiClient.delete(`/photo-categories/${id}`)
}
