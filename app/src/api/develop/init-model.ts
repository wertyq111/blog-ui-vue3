import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { InitModelQueryParams, InitModelItem, InitModelForm } from "@/types/api/init-model";

const BASE_URL = "/init-model";

const InitModelAPI = {
  /** 获取模型初始化分页列表 */
  async getPage(params: InitModelQueryParams) {
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
    return adaptPagination<InitModelItem>(res);
  },

  /** 新增模型初始化 */
  create(data: InitModelForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新模型初始化 */
  update(id: number, data: InitModelForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除模型初始化 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 批量删除模型初始化 */
  batchDelete(ids: number[]) {
    return request({
      url: `${BASE_URL}/delete`,
      method: "post",
      data: { id: ids },
    });
  },

  /** 模型初始化转换接口 */
  convert(id: number, columns: string[]) {
    return request({
      url: `${BASE_URL}/convert/${id}`,
      method: "post",
      data: { columns },
    });
  },
};

export default InitModelAPI;
