import type { BaseQueryParams, PageResult } from "./common";
import type { CategoryItem } from "./category";
import type { LabelItem } from "./label";

/** 文章查询参数 */
export interface ArticleQueryParams extends BaseQueryParams {
  title?: string;
  categoryId?: number;
  nickname?: string;
}

/** 文章作者（会员）简要信息 */
export interface ArticleMemberItem {
  id?: number;
  nickname?: string;
  [key: string]: any;
}

/** 文章项 */
export interface ArticleItem {
  id: number;
  memberId: number;
  categoryId: number;
  labelId?: number;
  title: string;
  content: string;
  cover?: string;
  viewCount?: number;
  likeCount?: number;
  viewStatus?: number;
  password?: string;
  recommendStatus?: number;
  commentStatus?: number;
  author?: string;
  member?: ArticleMemberItem;
  category?: CategoryItem;
  label?: LabelItem;
  createTime: string;
  createTimestamp: number;
  updateTime: string;
  updateTimestamp: number;
}

/** 文章表单 */
export interface ArticleForm {
  id?: number;
  categoryId: number;
  labelId?: number;
  title: string;
  content: string;
  cover?: string;
  viewStatus?: number;
  commentStatus?: number;
  recommendStatus?: number;
}

/** 文章分页结果 */
export type ArticlePageResult = PageResult<ArticleItem>;

