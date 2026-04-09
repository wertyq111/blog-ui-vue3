import type { BaseQueryParams, PageResult } from "./common";
import type { PhotoCategoryItem } from "./photo-category";

/** 相册查询参数 */
export interface PhotoQueryParams extends BaseQueryParams {
  categoryId?: number;
  remark?: string;
}

/** 相册会员简要信息 */
export interface PhotoMemberItem {
  id?: number;
  nickname?: string;
  avatar?: string;
  [key: string]: any;
}

/** 相册项 */
export interface PhotoItem {
  id: number;
  memberId?: number;
  categoryId: number;
  url: string;
  smallPicUrl?: string;
  remark?: string;
  show?: number;
  tags?: string[];
  category?: PhotoCategoryItem;
  member?: PhotoMemberItem;
  createTime: string;
  createTimestamp: number;
  updateTime: string;
  updateTimestamp: number;
}

/** 相册表单 */
export interface PhotoForm {
  id?: number;
  categoryId: number;
  url: string;
  smallPicUrl?: string;
  remark?: string;
}

/** 相册分页结果 */
export type PhotoPageResult = PageResult<PhotoItem>;

