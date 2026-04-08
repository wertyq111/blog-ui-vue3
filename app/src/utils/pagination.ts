/**
 * 分页数据适配器
 *
 * 将 Laravel 分页格式转换为 vue3-element-admin 期望的格式
 */

import type { PageResult } from "@/types/api/common";

/** Laravel 分页响应格式 */
interface LaravelPagination<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * 将 Laravel 分页响应转换为前端 PageResult 格式
 *
 * Laravel: { data: T[], current_page, last_page, per_page, total }
 * 前端:    { list: T[], total }
 */
export function adaptPagination<T>(response: LaravelPagination<T>): PageResult<T> {
  return {
    list: response.data ?? [],
    total: response.total ?? 0,
  };
}
