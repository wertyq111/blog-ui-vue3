import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { CategoryItem } from "@/types/api/category";
import type { ArticleQueryParams, ArticleItem, ArticleForm } from "@/types/api/article";

const BASE_URL = "/articles";

const ArticleAPI = {
  /** 获取文章分页列表 */
  async getPage(params: ArticleQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        include: "member,category,label",
        ...filters,
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<ArticleItem>(res);
  },

  /** 获取分类及其标签（用于联动选择） */
  getCategoryWithLabels() {
    return request<any, CategoryItem[]>({
      url: `/categories/list`,
      method: "get",
      params: { include: "labels" },
    });
  },

  /** 新增文章 */
  create(data: ArticleForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新文章 */
  update(id: number, data: ArticleForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除文章 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default ArticleAPI;

