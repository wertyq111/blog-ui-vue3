import type { BaseQueryParams, PageResult } from "./common";

/** 工作平台大类 */
export type WorkPlatformCategory = "work" | "study" | "personal";

/** 工作平台查询参数 */
export interface WorkPlatformQueryParams extends BaseQueryParams {
  name?: string;
  status?: number;
}

/** 工作平台项 */
export interface WorkPlatformItem {
  id: number;
  name: string;
  category: WorkPlatformCategory;
  status: number; // 1/0
  sort: number;
  createUser: number;
  createTime: string;
  updateTime: string;
}

/** 工作平台表单 */
export interface WorkPlatformForm {
  id?: number;
  name: string;
  category: WorkPlatformCategory;
  status?: number;
  sort?: number;
}

/** 工作平台分页结果 */
export type WorkPlatformPageResult = PageResult<WorkPlatformItem>;
