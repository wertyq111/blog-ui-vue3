import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { PhotoCategoryItem } from "@/types/api/photo-category";
import type { PhotoQueryParams, PhotoItem, PhotoForm } from "@/types/api/photo";

const BASE_URL = "/photo";

const PhotoAPI = {
  /** 获取相册分页列表 */
  async getPage(params: PhotoQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        include: "category,member",
        ...filters,
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<PhotoItem>(res);
  },

  /** 获取相册分类列表（用于下拉） */
  getCategoryList() {
    return request<any, PhotoCategoryItem[]>({
      url: `/photo-categories/list`,
      method: "get",
    });
  },

  /** 新增相册 */
  create(data: PhotoForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新相册 */
  update(id: number, data: PhotoForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除相册 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 批量删除相册 */
  batchDelete(ids: number[]) {
    return request({
      url: `${BASE_URL}/delete`,
      method: "post",
      data: { id: ids },
    });
  },
};

export default PhotoAPI;

