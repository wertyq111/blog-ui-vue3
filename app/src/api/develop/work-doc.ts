import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { WorkDocQueryParams, WorkDocItem, WorkDocForm } from "@/types/api/work-doc";

const BASE_URL = "/work-doc";

const WorkDocAPI = {
  /** 获取工作文档分页列表 */
  async getPage(params: WorkDocQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        keyword: filters.keyword,
        category_id: filters.categoryId,
        status: filters.status,
        template_type: filters.templateType,
        is_pin: filters.isPin,
        priority: filters.priority,
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<WorkDocItem>(res);
  },

  /** 新增工作文档 */
  create(data: WorkDocForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新工作文档 */
  update(id: number, data: WorkDocForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除工作文档 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 获取工作文档详情 */
  getInfo(id: number) {
    return request<any, WorkDocItem>({
      url: `${BASE_URL}/${id}`,
      method: "get",
    });
  },

  /** 导出文档为带样式 HTML（返回完整响应，data 为 Blob） */
  exportHtml(id: number) {
    return request({
      url: `${BASE_URL}/${id}/export`,
      method: "get",
      responseType: "blob",
    });
  },
};

export default WorkDocAPI;
