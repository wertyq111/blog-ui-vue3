import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  PlatformScriptQueryParams,
  PlatformScriptPreview,
  PlatformScriptRunItem,
  BankofsunProgressResult,
} from "@/types/api/platform-script";

const BASE_URL = "/platform-script";

const PlatformScriptAPI = {
  /** 获取执行记录分页列表 */
  async getPage(params: PlatformScriptQueryParams) {
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
    return adaptPagination<PlatformScriptRunItem>(res);
  },

  /** 解析预览 / 查询（不修改） */
  preview(scriptKey: string, params: { text?: string; login?: string }) {
    return request<any, any>({
      url: `${BASE_URL}/preview`,
      method: "post",
      data: { scriptKey, ...params },
    });
  },

  /** 执行推送 / 修改 */
  run(scriptKey: string, params: { text?: string; login?: string; mobile?: string; clear_apply_no?: boolean }) {
    return request<any, PlatformScriptRunItem>({
      url: `${BASE_URL}/run`,
      method: "post",
      data: { scriptKey, ...params },
    });
  },

  /** 查询授信进度（只读，不推送） */
  progress(scriptKey: string, params: { text: string }) {
    return request<any, BankofsunProgressResult>({
      url: `${BASE_URL}/progress`,
      method: "post",
      data: { scriptKey, ...params },
    });
  },

  /** 推送确认担保 */
  confirmGuarantee(
    scriptKey: string,
    params: { text: string; ordr_no?: string; skip_amount_check?: boolean }
  ) {
    return request<any, PlatformScriptRunItem>({
      url: `${BASE_URL}/confirm-guarantee`,
      method: "post",
      data: { scriptKey, ...params },
    });
  },


  /** 执行记录详情 */
  getInfo(id: number) {
    return request<any, PlatformScriptRunItem>({
      url: `${BASE_URL}/${id}`,
      method: "get",
    });
  },
};

export default PlatformScriptAPI;
