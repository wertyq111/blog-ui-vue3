import type { BaseQueryParams, PageResult } from "./common";
import type { LabelItem } from "./label";

/** 笔记分类查询参数 */
export interface CategoryQueryParams extends BaseQueryParams {
  name?: string;
}

/** 笔记分类项 */
export interface CategoryItem {
  id: number;
  name: string;
  description?: string;
  type: number;
  priority?: number;
  labels?: LabelItem[];
  createTime: string;
  createTimestamp: number;
  updateTime: string;
  updateTimestamp: number;
}

/** 笔记分类表单 */
export interface CategoryForm {
  id?: number;
  name: string;
  description?: string;
  priority?: number;
  type?: number;
}

/** 笔记分类分页结果 */
export type CategoryPageResult = PageResult<CategoryItem>;

