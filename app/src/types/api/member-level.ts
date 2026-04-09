import type { BaseQueryParams, PageResult } from "./common";

/** 会员等级查询参数 */
export interface MemberLevelQueryParams extends BaseQueryParams {
  name?: string;
}

/** 会员等级项 */
export interface MemberLevelItem {
  id: number;
  name: string;
  sort: number;
  createTime: string;
  createTimestamp: number;
  updateTime: string;
  updateTimestamp: number;
}

/** 会员等级表单 */
export interface MemberLevelForm {
  id?: number;
  name: string;
  sort: number;
}

/** 会员等级分页结果 */
export type MemberLevelPageResult = PageResult<MemberLevelItem>;
