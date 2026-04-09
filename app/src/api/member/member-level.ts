import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  MemberLevelQueryParams,
  MemberLevelItem,
  MemberLevelForm,
} from "@/types/api/member-level";

const BASE_URL = "/member-level";

const MemberLevelAPI = {
  /**
   * 获取会员等级分页列表
   *
   * @param params 查询参数
   */
  async getPage(params: MemberLevelQueryParams) {
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

    return adaptPagination<MemberLevelItem>(res);
  },

  /**
   * 新增会员等级
   *
   * @param data 表单数据
   */
  create(data: MemberLevelForm) {
    return request({
      url: `${BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /**
   * 编辑会员等级
   *
   * @param id 会员等级ID
   * @param data 表单数据
   */
  update(id: number, data: MemberLevelForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /**
   * 删除会员等级
   *
   * @param id 会员等级ID
   */
  deleteById(id: number) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /**
   * 批量删除会员等级
   *
   * @param ids ID数组
   */
  async deleteByIds(ids: number[]) {
    for (const id of ids) {
      await this.deleteById(id);
    }
  },

  /**
   * 获取会员等级下拉列表
   */
  async getOptions() {
    const res = await this.getPage({ pageNum: 1, pageSize: 1000 });
    return res.list.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  },
};

export default MemberLevelAPI;
