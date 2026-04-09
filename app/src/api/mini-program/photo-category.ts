import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  PhotoCategoryQueryParams,
  PhotoCategoryItem,
  PhotoCategoryForm,
} from "@/types/api/photo-category";

const BASE_URL = "/photo-categories";

const PhotoCategoryAPI = {
  /** 获取相册分类分页列表 */
  async getPage(params: PhotoCategoryQueryParams) {
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
    return adaptPagination<PhotoCategoryItem>(res);
  },

  /** 获取相册分类列表（不分页） */
  getList() {
    return request<any, PhotoCategoryItem[]>({
      url: `${BASE_URL}/list`,
      method: "get",
    });
  },

  /** 新增相册分类 */
  create(data: PhotoCategoryForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新相册分类 */
  update(id: number, data: PhotoCategoryForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除相册分类 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default PhotoCategoryAPI;

