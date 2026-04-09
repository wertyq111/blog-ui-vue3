import type { BaseQueryParams, PageResult } from "./common";
import type { WallpaperClassifyItem } from "./wallpaper-classify";

/** 壁纸查询参数 */
export interface WallpaperQueryParams extends BaseQueryParams {
  classId?: number;
  nickname?: string;
}

/** 壁纸项 */
export interface WallpaperItem {
  id: number;
  classId: number;
  url: string;
  smallPicUrl?: string;
  nickname: string;
  description?: string;
  score?: number;
  tags?: string[];
  classify?: WallpaperClassifyItem;
  createTime: string;
  createTimestamp: number;
  updateTime: string;
  updateTimestamp: number;
}

/** 壁纸表单 */
export interface WallpaperForm {
  id?: number;
  classId: number;
  url: string;
  smallPicUrl?: string;
  nickname: string;
  description?: string;
  score?: number;
  tags?: string[];
}

/** 壁纸分页结果 */
export type WallpaperPageResult = PageResult<WallpaperItem>;

