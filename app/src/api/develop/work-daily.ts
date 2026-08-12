import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { WorkDailyQueryParams, WorkDailyItem, WorkDailyForm } from "@/types/api/work-daily";

const BASE_URL = "/work-daily";

export interface WorkDailyReportExport {
  id: number;
  type: "month" | "week" | "year";
  periodStart: string;
  periodEnd: string;
  model?: string;
  status: "pending" | "running" | "completed" | "failed";
  fileName: string;
  errorMessage?: string;
  createdAt: string | number | null;
  startedAt: number | null;
  finishedAt: number | null;
}

export interface WorkDailyReportExportCreateResult {
  blocked: boolean;
  export: WorkDailyReportExport;
}

export interface WorkDailyReportExportStatusResult {
  active: boolean;
  export: WorkDailyReportExport | null;
}

export interface WorkDailyReportExportListResult {
  items: WorkDailyReportExport[];
  total: number;
  page: number;
  pageSize: number;
}

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

  /** 上传 Markdown 正文图片，落盘后端 public/uploads/work-daily/YYYYMMDD */
  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, { url: string; path: string }>({
      url: `${BASE_URL}/image`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
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

  /** 创建报表导出任务 */
  createReportExport(data: {
    type: "month" | "week" | "year";
    month?: string;
    start_date?: string;
    end_date?: string;
    year?: string;
    model?: string;
  }) {
    return request<any, WorkDailyReportExportCreateResult>({
      url: `${BASE_URL}/report/export`,
      method: "post",
      data,
      __silent: true,
    } as any);
  },

  /** 获取当前报表导出任务 */
  getCurrentReportExport() {
    return request<any, WorkDailyReportExportStatusResult>({
      url: `${BASE_URL}/report/export/current`,
      method: "get",
    });
  },

  /** 获取报表导出任务列表（当前用户） */
  listReportExports(params: { page?: number; page_size?: number } = {}) {
    return request<any, WorkDailyReportExportListResult>({
      url: `${BASE_URL}/report/export/list`,
      method: "get",
      params,
    });
  },

  /** 获取报表导出任务详情 */
  getReportExport(id: number) {
    return request<any, WorkDailyReportExportStatusResult>({
      url: `${BASE_URL}/report/export/${id}`,
      method: "get",
    });
  },

  /** 下载报表导出文件（html 自带阅读样式，md 为原文） */
  downloadReportExport(id: number, format: "html" | "md" = "html") {
    return request({
      url: `${BASE_URL}/report/export/${id}/download`,
      method: "get",
      params: { format },
      responseType: "blob",
    });
  },

  /** 保存编辑后的报表 Markdown 内容 */
  updateReportExportContent(id: number, content: string) {
    return request({
      url: `${BASE_URL}/report/export/${id}/content`,
      method: "post",
      data: { content },
    });
  },

  /** 删除报表导出记录 */
  deleteReportExport(id: number) {
    return request({
      url: `${BASE_URL}/report/export/${id}`,
      method: "delete",
    });
  },

  /** 获取报告模板 */
  getReportModels() {
    return request<any, { models: string[]; currentModel: string }>({
      url: `${BASE_URL}/report/models`,
      method: "get",
    });
  },

  /** 获取标签列表 */
  getTags() {
    return request<any, Array<{ id: number; name: string }>>({
      url: "/work-daily-tag/list",
      method: "get",
    });
  },

  /** 新增标签 */
  createTag(name: string) {
    return request<any, { id: number; name: string }>({
      url: "/work-daily-tag/add",
      method: "post",
      data: { name },
    });
  },
};

export default WorkDailyAPI;
