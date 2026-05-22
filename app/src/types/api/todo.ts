import type { BaseQueryParams, PageResult } from "./common";

/** 待办查询参数 */
export interface TodoQueryParams extends BaseQueryParams {
  status?: number;
  priority?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

/** 待办项 */
export interface TodoItem {
  id: number;
  title: string;
  content?: string;
  status: number; // 0: 待办, 1: 进行中, 2: 已完成, 3: 已取消
  priority: number; // 0: 低, 1: 中, 2: 高, 3: 紧急
  dueDate: string | null;
  due_date?: string | null;
  platformId?: number | null;
  platform_id?: number | null;
  platform?: {
    id: number;
    name: string;
  } | null;
  tags?: string[];
  createTime: string;
  updateTime: string;
}

/** 待办统计数据 */
export interface TodoStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

/** 待办表单 */
export interface TodoForm {
  id?: number;
  title: string;
  content: string;
  status: number;
  priority: number;
  due_date?: string | null;
  platform_id?: number | null;
  tags: string[];
}

/** 待办分页结果 */
export type TodoPageResult = PageResult<TodoItem>;
