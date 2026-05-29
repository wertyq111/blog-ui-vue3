import type { BaseQueryParams, PageResult } from "./common";

/** 会员查询参数 */
export interface MemberQueryParams extends BaseQueryParams {
  nickname?: string;
  phone?: string;
  status?: number;
  memberLevel?: number;
}

/** 会员项 */
export interface MemberItem {
  id: number;
  userId: number;
  memberLevel: number;
  realname?: string;
  nickname: string;
  gender: number;
  avatar?: string;
  birthday?: number;
  provinceCode?: string;
  cityCode?: string;
  districtCode?: string;
  address?: string;
  intro?: string;
  signature?: string;
  admire?: string;
  device?: string;
  deviceCode?: string;
  pushAlias?: string;
  source?: string;
  status: number;
  appVersion?: string;
  code?: string;
  loginIp?: string;
  loginAt?: number;
  loginRegion?: string;
  loginCount: number;
  createTime: string;
  createTimestamp: number;
  updateTime: string;
  updateTimestamp: number;
  city?: any[];
  phone?: string;
  /** 关联用户（列表 include=user 时返回） */
  user?: { id: number; username: string; phone?: string; email?: string };
}

/** 会员表单 */
export interface MemberForm {
  id?: number;
  /** 关联用户ID（新增会员时必填） */
  userId?: number;
  nickname: string;
  realname?: string;
  gender: number;
  avatar?: string;
  birthday?: number;
  memberLevel: number;
  phone?: string;
  status: number;
  // 其他可能需要的字段
  password?: string;
}

/** 会员分页结果 */
export type MemberPageResult = PageResult<MemberItem>;
