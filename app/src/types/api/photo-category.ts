import type { BaseQueryParams, PageResult } from "./common";

/** 相册分类查询参数 */
export interface PhotoCategoryQueryParams extends BaseQueryParams {
  name?: string;
}

/** 相册分类项 */
export interface PhotoCategoryItem {
  id: number;
  memberId?: number;
  name: string;
  sort?: number;
  num?: number;
  createTime: string;
  createTimestamp: number;
  updateTime: string;
  updateTimestamp: number;
}

/** 相册分类表单 */
export interface PhotoCategoryForm {
  id?: number;
  name: string;
  sort?: number;
}

/** 相册分类分页结果 */
export type PhotoCategoryPageResult = PageResult<PhotoCategoryItem>;

