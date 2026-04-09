import type { BaseQueryParams, PageResult } from "./common";

/** 模型初始化查询参数 */
export interface InitModelQueryParams extends BaseQueryParams {
  code?: string;
  name?: string;
}

/** 模型初始化项 */
export interface InitModelItem {
  id: number;
  code: string;
  name: string;
  template: string;
  tip: string;
  createTime: string;
  updateTime: string;
}

/** 模型初始化表单 */
export interface InitModelForm {
  id?: number;
  code: string;
  name: string;
  template: string;
  tip: string;
}

/** 模型初始化分页结果 */
export type InitModelPageResult = PageResult<InitModelItem>;
