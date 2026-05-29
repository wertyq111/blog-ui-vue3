import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  UserInfo,
  UserForm,
  UserQueryParams,
  UserItem,
  UserProfileForm,
  OptionItem,
  UnboundUser,
} from "@/types/api";

const USER_BASE_URL = "/users";

const UserAPI = {
  /**
   * 获取当前登录用户信息
   *
   * @returns 登录用户昵称、头像信息，包括角色和权限
   */
  getInfo() {
    return request<any, UserInfo>({
      url: `/users/getUserInfo`,
      method: "get",
      params: { include: "member" },
    });
  },

  /**
   * 获取用户分页列表
   *
   * @param queryParams 查询参数
   */
  async getPage(queryParams: UserQueryParams) {
    const { pageNum, pageSize, ...others } = queryParams;
    const res = await request<any, any>({
      url: `${USER_BASE_URL}/list`,
      method: "get",
      params: {
        page: pageNum,
        per_page: pageSize,
        ...others,
        include: "member,roles",
      },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<UserItem>(res);
  },

  /**
   * 获取未关联会员的用户列表（供新增会员时选择关联）
   */
  getUnboundUsers() {
    return request<any, UnboundUser[]>({
      url: `${USER_BASE_URL}/unbound`,
      method: "get",
    });
  },

  /**
   * 获取用户表单详情
   *
   * @param userId 用户ID
   * @returns 用户表单详情
   */
  getFormData(userId: string) {
    return request<any, UserForm>({
      url: `${USER_BASE_URL}/${userId}`,
      method: "get",
    });
  },

  /**
   * 添加用户
   *
   * @param data 用户表单数据
   */
  create(data: UserForm) {
    return request({
      url: `${USER_BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /**
   * 修改用户
   *
   * @param id 用户ID
   * @param data 用户表单数据
   */
  update(id: string, data: UserForm) {
    return request({
      url: `${USER_BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改用户状态
   *
   * @param id 用户ID
   * @param status 状态(1:正常;0:禁用)
   */
  updateStatus(id: string, status: number) {
    return request({
      url: `${USER_BASE_URL}/status/${id}`,
      method: "post",
      data: { status },
    });
  },

  /**
   * 重置用户密码
   *
   * @param id 用户ID
   */
  resetPassword(id: string) {
    return request({
      url: `${USER_BASE_URL}/resetPwd/${id}`,
      method: "post",
    });
  },

  /**
   * 删除用户
   *
   * @param id 用户ID
   */
  deleteById(id: string) {
    return request({
      url: `${USER_BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /**
   * 批量删除用户 (兼容旧版及CURD组件)
   * @param ids 用户ID字符串，多个以英文逗号(,)分割
   */
  async deleteByIds(ids: string) {
    const idList = ids.split(",");
    for (const id of idList) {
      await this.deleteById(id);
    }
  },

  /** 获取个人中心用户信息 */
  getProfile() {
    return this.getInfo();
  },

  /** 修改个人中心用户信息 */
  updateProfile(data: UserProfileForm) {
    return request({
      url: `/index/updateUserInfo`,
      method: "post",
      data,
    });
  },

  /**
   *  获取角色下拉列表（用于获取角色选项）
   */
  getOptions() {
    return request<any, OptionItem[]>({
      url: `/role/getRoleList`,
      method: "get",
    });
  },

  /** 以下方法为后端暂不支持，保留为空实现以避免 Demo 报错 */
  downloadTemplate() {
    return Promise.resolve();
  },
  export(_queryParams: UserQueryParams) {
    return Promise.resolve();
  },
  import(_file: File) {
    return Promise.resolve({ code: "0", invalidCount: 0, validCount: 0, messageList: [] });
  },
};

export default UserAPI;
