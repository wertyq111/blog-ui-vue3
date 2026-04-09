import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { WallpaperClassifyItem } from "@/types/api/wallpaper-classify";
import type { WallpaperQueryParams, WallpaperItem, WallpaperForm } from "@/types/api/wallpaper";

const BASE_URL = "/wallpaper";

const WallpaperAPI = {
  /** 获取壁纸分页列表 */
  async getPage(params: WallpaperQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        include: "classify",
        ...filters,
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<WallpaperItem>(res);
  },

  /** 获取壁纸分类列表 */
  getClassifyList() {
    return request<any, WallpaperClassifyItem[]>({
      url: `/wallpaper-classify/list`,
      method: "get",
    });
  },

  /** 新增壁纸 */
  create(data: WallpaperForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新壁纸 */
  update(id: number, data: WallpaperForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除壁纸 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default WallpaperAPI;

