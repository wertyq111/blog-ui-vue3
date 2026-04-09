import type { BaseQueryParams, PageResult } from "./common";
import type { WorkDocCategoryItem } from "./work-doc-category";

/** 工作文档查询参数 */
export interface WorkDocQueryParams extends BaseQueryParams {
  keyword?: string;
  categoryId?: number;
  status?: number;
  templateType?: string;
  isPin?: number;
  priority?: number;
}

/** 工作文档项 */
export interface WorkDocItem {
  id: number;
  categoryId: number;
  category?: WorkDocCategoryItem;
  title: string;
  content: string;
  templateType: string;
  tags: string[];
  status: number;
  priority: number;
  source: string;
  isPin: number;
  createTime: string;
  updateTime: string;
}

/** 工作文档表单 */
export interface WorkDocForm {
  id?: number;
  categoryId: number;
  title: string;
  content: string;
  templateType?: string;
  tags?: string[];
  status?: number;
  priority?: number;
  source?: string;
  isPin?: number;
}

/** 工作文档分页结果 */
export type WorkDocPageResult = PageResult<WorkDocItem>;
