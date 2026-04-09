import type { BaseQueryParams, PageResult } from "./common";

/** 工作文档分类查询参数 */
export interface WorkDocCategoryQueryParams extends BaseQueryParams {
  parentId?: number;
  status?: number;
}

/** 工作文档分类项 */
export interface WorkDocCategoryItem {
  id: number;
  parentId: number;
  name: string;
  icon: string;
  description: string;
  sort: number;
  status: number;
  children?: WorkDocCategoryItem[];
  createTime: string;
  updateTime: string;
}

/** 工作文档分类表单 */
export interface WorkDocCategoryForm {
  id?: number;
  parentId?: number;
  name: string;
  icon?: string;
  description?: string;
  sort?: number;
  status?: number;
}

/** 工作文档分类分页结果 */
export type WorkDocCategoryPageResult = PageResult<WorkDocCategoryItem>;
