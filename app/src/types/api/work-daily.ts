import type { BaseQueryParams, PageResult } from "./common";
import type { WorkPlatformItem } from "./work-platform";

/** 工作日常平台内容结构 */
export interface WorkDailyPlatformContent {
  platformId: number;
  platformName?: string;
  content: string;
}

/** 工作日常查询参数 */
export interface WorkDailyQueryParams extends BaseQueryParams {
  platformId?: number;
  startDate?: string;
  endDate?: string;
  content?: string;
}

/** 工作日常项 */
export interface WorkDailyItem {
  id: number;
  platformId: number;
  logDate: string; // YYYY-MM-DD
  content: any; // object or string
  createUser: number;
  platform?: WorkPlatformItem;
  tags?: Array<{ id: number; name: string }>;
  createTime: string;
  updateTime: string;
}

/** 工作日常表单 */
export interface WorkDailyForm {
  id?: number;
  logDate: string;
  platforms: Array<{
    platform_id: number;
    platform_name?: string;
    content: string;
  }>;
  tag_ids?: number[];
}

/** 工作日常分页结果 */
export type WorkDailyPageResult = PageResult<WorkDailyItem>;
