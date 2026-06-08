import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  PomoTask,
  PomoTaskForm,
  PomoSettings,
  PomoWeekItem,
} from "@/types/api/pomo";

const BASE_URL = "/pomo";

const PomoAPI = {
  /** 读取设置（无则后端返回默认） */
  getSettings() {
    return request<any, PomoSettings>({
      url: `${BASE_URL}/setting`,
      method: "get",
    });
  },

  /** 保存设置 */
  saveSettings(data: PomoSettings) {
    return request<any, PomoSettings>({
      url: `${BASE_URL}/setting`,
      method: "post",
      data,
    });
  },

  /** 任务列表（取全部：传大 per_page） */
  async getTasks() {
    const res = await request<any, any>({
      url: `${BASE_URL}/task/index`,
      method: "get",
      params: { page: 1, per_page: 1000 },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<PomoTask>(res).list;
  },

  /** 新增任务 */
  addTask(data: PomoTaskForm) {
    return request<any, PomoTask>({
      url: `${BASE_URL}/task/add`,
      method: "post",
      data,
    });
  },

  /** 切换完成 */
  toggleDone(id: number) {
    return request<any, PomoTask>({
      url: `${BASE_URL}/task/toggle-done/${id}`,
      method: "post",
    });
  },

  /** 删除任务 */
  deleteTask(id: number) {
    return request({
      url: `${BASE_URL}/task/${id}`,
      method: "delete",
    });
  },

  /** 记录一次完成的专注段（服务端同时给关联任务番茄+1） */
  storeSession(taskId: number) {
    return request({
      url: `${BASE_URL}/session`,
      method: "post",
      data: { taskId },
    });
  },

  /** 近 7 天统计 */
  getWeek() {
    return request<any, PomoWeekItem[]>({
      url: `${BASE_URL}/stats/week`,
      method: "get",
    });
  },
};

export default PomoAPI;
