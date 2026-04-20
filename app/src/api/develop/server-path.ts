import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { ServerPathQueryParams, ServerPathItem, ServerPathForm } from "@/types/api/server-path";

const BASE_URL = "/server-path";

const ServerPathAPI = {
  /** 获取路径转换分页列表 */
  async getPage(params: ServerPathQueryParams) {
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
    return adaptPagination<ServerPathItem>(res);
  },

  /** 新增路径转换 */
  create(data: ServerPathForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新路径转换 */
  update(id: number, data: ServerPathForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除路径转换 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 批量删除路径转换 */
  batchDelete(ids: number[]) {
    return request({
      url: `${BASE_URL}/delete`,
      method: "post",
      data: { id: ids },
    });
  },

  /** 获取全部路径配置(不分页) */
  async getAll(): Promise<ServerPathItem[]> {
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: { page: 1, per_page: 999 },
      __returnEnvelope: true,
    } as any);
    return res?.data ?? [];
  },

  /** 路径转换转换接口 */
  convert(id: number, paths: string[]) {
    return request({
      url: `${BASE_URL}/convert/${id}`,
      method: "post",
      data: { paths },
    });
  },
};

export default ServerPathAPI;
