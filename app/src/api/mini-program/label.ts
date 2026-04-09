import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { CategoryItem } from "@/types/api/category";
import type { LabelQueryParams, LabelItem, LabelForm } from "@/types/api/label";

const BASE_URL = "/labels";

const LabelAPI = {
  /** 获取笔记标签分页列表 */
  async getPage(params: LabelQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        include: "category",
        ...filters,
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<LabelItem>(res);
  },

  /** 获取标签列表（不分页） */
  getList() {
    return request<any, LabelItem[]>({
      url: `${BASE_URL}/list`,
      method: "get",
    });
  },

  /** 获取分类列表（用于下拉） */
  getCategoryList() {
    return request<any, CategoryItem[]>({
      url: `/categories/list`,
      method: "get",
    });
  },

  /** 新增笔记标签 */
  create(data: LabelForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新笔记标签 */
  update(id: number, data: LabelForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除笔记标签 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default LabelAPI;

