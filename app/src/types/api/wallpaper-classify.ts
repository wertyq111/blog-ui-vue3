import type { BaseQueryParams, PageResult } from "./common";

/** 壁纸分类查询参数 */
export interface WallpaperClassifyQueryParams extends BaseQueryParams {
  name?: string;
}

/** 壁纸分类项 */
export interface WallpaperClassifyItem {
  id: number;
  name: string;
  picUrl?: string;
  select: boolean;
  sort: number;
  createTime: string;
  createTimestamp: number;
  updateTime: string;
  updateTimestamp: number;
}

/** 壁纸分类表单 */
export interface WallpaperClassifyForm {
  id?: number;
  name: string;
  picUrl?: string;
  select?: boolean;
  sort?: number;
}

/** 壁纸分类分页结果 */
export type WallpaperClassifyPageResult = PageResult<WallpaperClassifyItem>;

