import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { MemberQueryParams, MemberItem, MemberForm } from "@/types/api/member";

const BASE_URL = "/members";

const MemberAPI = {
  /**
   * 获取会员分页列表
   *
   * @param params 查询参数
   */
  async getPage(params: MemberQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const apiParams: Record<string, any> = {
      page: pageNum,
      per_page: pageSize,
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        apiParams[`filter[${key}]`] = value;
      }
    });

    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: apiParams,
      __returnEnvelope: true,
    } as any);

    return adaptPagination<MemberItem>(res);
  },

  /**
   * 新增会员
   *
   * @param data 表单数据
   */
  create(data: MemberForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /**
   * 编辑会员
   *
   * @param id 会员ID
   * @param data 表单数据
   */
  update(id: number, data: MemberForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改会员状态
   *
   * @param id 会员ID
   * @param status 状态(1:正常;0:禁用)
   */
  updateStatus(id: number, status: number) {
    return request({
      url: `${BASE_URL}/status/${id}`,
      method: "post",
      data: { status },
    });
  },

  /**
   * 删除会员
   *
   * @param id 会员ID
   */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /**
   * 批量删除会员
   *
   * @param ids ID数组
   */
  deleteByIds(ids: number[]) {
    return request({
      url: `${BASE_URL}/deletes`,
      method: "delete",
      data: { ids },
    });
  },
};

export default MemberAPI;
