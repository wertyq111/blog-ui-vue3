import request from "@/utils/request";
import type { TodoQueryParams, TodoItem, TodoForm, TodoStatistics } from "@/types/api/todo";
import { adaptPagination } from "@/utils/pagination";

const BASE_URL = "/todo";

const TodoAPI = {
  /** 获取待办分页列表 */
  async getPage(params: TodoQueryParams) {
    const { pageNum = 1, pageSize = 10, startDate, endDate, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        start_date: startDate,
        end_date: endDate,
        ...filters,
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<TodoItem>(res);
  },

  /** 获取待办统计数据 */
  getStatistics() {
    return request<any, TodoStatistics>({
      url: `${BASE_URL}/statistics`,
      method: "get",
    });
  },

  /** 新增待办 */
  create(data: TodoForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新待办 */
  update(id: number, data: Partial<TodoForm>) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 快速修改状态 */
  updateStatus(id: number, status: number) {
    return request({
      url: `${BASE_URL}/status/${id}`,
      method: "post",
      data: { status },
    });
  },

  /** 删除待办 */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 获取待办详情 */
  getInfo(id: number) {
    return request<any, TodoItem>({
      url: `${BASE_URL}/${id}`,
      method: "get",
    });
  },
};

export default TodoAPI;
