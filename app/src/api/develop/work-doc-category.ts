import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  WorkDocCategoryQueryParams,
  WorkDocCategoryItem,
  WorkDocCategoryForm,
} from "@/types/api/work-doc-category";

const BASE_URL = "/work-doc-category";

const WorkDocCategoryAPI = {
  /** 获取工作文档分类分页列表 */
  async getPage(params: WorkDocCategoryQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        parent_id: filters.parentId,
        status: filters.status,
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<WorkDocCategoryItem>(res);
  },

  /** 获取工作文档分类列表（不分页） */
  getList(status?: number) {
    return request<any, WorkDocCategoryItem[]>({
      url: `${BASE_URL}/list`,
      method: "get",
      params: { status },
    });
  },

  /** 新增工作文档分类 */
  create(data: WorkDocCategoryForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新工作文档分类 */
  update(id: number, data: WorkDocCategoryForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除工作文档分类 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 工作文档分类排序 */
  reorder(list: Array<{ id: number; parentId?: number; sort: number }>) {
    return request({
      url: `${BASE_URL}/reorder`,
      method: "post",
      data: {
        list: list.map((i) => ({
          id: i.id,
          parent_id: i.parentId,
          sort: i.sort,
        })),
      },
    });
  },
};

export default WorkDocCategoryAPI;
