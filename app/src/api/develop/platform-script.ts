import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  PlatformScriptQueryParams,
  PlatformScriptPreview,
  PlatformScriptRunItem,
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

  /** 解析预览（不发送） */
  preview(scriptKey: string, text: string) {
    return request<any, PlatformScriptPreview>({
      url: `${BASE_URL}/preview`,
      method: "post",
      data: { scriptKey, text },
    });
  },

  /** 执行推送 */
  run(scriptKey: string, text: string) {
    return request<any, PlatformScriptRunItem>({
      url: `${BASE_URL}/run`,
      method: "post",
      data: { scriptKey, text },
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
