import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { CategoryQueryParams, CategoryItem, CategoryForm } from "@/types/api/category";

const BASE_URL = "/categories";

const CategoryAPI = {
  /** 获取笔记分类分页列表 */
  async getPage(params: CategoryQueryParams) {
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
    return adaptPagination<CategoryItem>(res);
  },

  /** 获取笔记分类列表（不分页） */
  getList(include?: string) {
    return request<any, CategoryItem[]>({
      url: `${BASE_URL}/list`,
      method: "get",
      params: { include },
    });
  },

  /** 新增笔记分类 */
  create(data: CategoryForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新笔记分类 */
  update(id: number, data: CategoryForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除笔记分类 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default CategoryAPI;

