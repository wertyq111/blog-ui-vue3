import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  WallpaperClassifyQueryParams,
  WallpaperClassifyItem,
  WallpaperClassifyForm,
} from "@/types/api/wallpaper-classify";

const BASE_URL = "/wallpaper-classify";

const WallpaperClassifyAPI = {
  /** 获取壁纸分类分页列表 */
  async getPage(params: WallpaperClassifyQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        ...filters,
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<WallpaperClassifyItem>(res);
  },

  /** 获取壁纸分类列表（不分页） */
  getList() {
    return request<any, WallpaperClassifyItem[]>({
      url: `${BASE_URL}/list`,
      method: "get",
    });
  },

  /** 新增壁纸分类 */
  create(data: WallpaperClassifyForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新壁纸分类 */
  update(id: number, data: WallpaperClassifyForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除壁纸分类 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default WallpaperClassifyAPI;

