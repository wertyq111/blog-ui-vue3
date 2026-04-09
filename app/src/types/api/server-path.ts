import type { BaseQueryParams, PageResult } from "./common";

/** 路径转换查询参数 */
export interface ServerPathQueryParams extends BaseQueryParams {
  code?: string;
  name?: string;
}

/** 路径转换项 */
export interface ServerPathItem {
  id: number;
  code: string;
  name: string;
  url: string;
  target: string;
  sources: string; // string-JSON
  sort: number;
  createTime: string;
  updateTime: string;
}

/** 路径转换表单 */
export interface ServerPathForm {
  id?: number;
  code: string;
  name: string;
  url?: string;
  target?: string;
  sources?: string[];
  sort?: number;
}

/** 路径转换分页结果 */
export type ServerPathPageResult = PageResult<ServerPathItem>;
