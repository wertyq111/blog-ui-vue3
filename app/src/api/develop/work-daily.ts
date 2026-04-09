import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { WorkDailyQueryParams, WorkDailyItem, WorkDailyForm } from "@/types/api/work-daily";

const BASE_URL = "/work-daily";

const WorkDailyAPI = {
  /** 获取工作日常分页列表 */
  async getPage(params: WorkDailyQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        platform_id: filters.platformId,
        start_date: filters.startDate,
        end_date: filters.endDate,
        content: filters.content,
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<WorkDailyItem>(res);
  },

  /** 新增工作日常 */
  create(data: WorkDailyForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新工作日常 */
  update(id: number, data: WorkDailyForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除工作日常 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 获取工作日常详情 */
  getInfo(id: number) {
    return request<any, WorkDailyItem>({
      url: `${BASE_URL}/${id}`,
      method: "get",
    });
  },

  /** 导入 Markdown */
  importMarkdown(file: File, year?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (year) {
      formData.append("year", year);
    }
    return request({
      url: `${BASE_URL}/import`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /** 月度报告 */
  reportMonth(month: string, model?: string) {
    return request({
      url: `${BASE_URL}/report/month`,
      method: "get",
      params: { month, model },
      responseType: "blob",
    });
  },

  /** 周报告 */
  reportWeek(startDate: string, endDate: string, model?: string) {
    return request({
      url: `${BASE_URL}/report/week`,
      method: "get",
      params: { start_date: startDate, end_date: endDate, model },
      responseType: "blob",
    });
  },

  /** 年度报告 */
  reportYear(year: string, model?: string) {
    return request({
      url: `${BASE_URL}/report/year`,
      method: "get",
      params: { year, model },
      responseType: "blob",
    });
  },

  /** 获取报告模板 */
  getReportModels() {
    return request<any, string[]>({
      url: `${BASE_URL}/report/models`,
      method: "get",
    });
  },
};

export default WorkDailyAPI;
