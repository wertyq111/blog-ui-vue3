import type { BaseQueryParams, PageResult } from "./common";
import type { CategoryItem } from "./category";

/** 笔记标签查询参数 */
export interface LabelQueryParams extends BaseQueryParams {
  name?: string;
}

/** 笔记标签项 */
export interface LabelItem {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  category?: CategoryItem;
  createTime: string;
  createTimestamp: number;
  updateTime: string;
  updateTimestamp: number;
}

/** 笔记标签表单 */
export interface LabelForm {
  id?: number;
  categoryId: number;
  name: string;
  description?: string;
}

/** 笔记标签分页结果 */
export type LabelPageResult = PageResult<LabelItem>;

