import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { WorkPlatformQueryParams, WorkPlatformItem, WorkPlatformForm } from "@/types/api/work-platform";

const BASE_URL = "/work-platform";

const WorkPlatformAPI = {
  /** 获取工作平台分页列表 */
  async getPage(params: WorkPlatformQueryParams) {
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
    return adaptPagination<WorkPlatformItem>(res);
  },

  /** 获取工作平台列表（不分页） */
  getList(status?: number) {
    return request<any, WorkPlatformItem[]>({
      url: `${BASE_URL}/list`,
      method: "get",
      params: { status },
    });
  },

  /** 新增工作平台 */
  create(data: WorkPlatformForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新工作平台 */
  update(id: number, data: WorkPlatformForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除工作平台 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 工作平台排序 */
  reorder(list: Array<{ id: number; sort: number }>) {
    return request({
      url: `${BASE_URL}/reorder`,
      method: "post",
      data: { list },
    });
  },
};

export default WorkPlatformAPI;
