import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  UserInfo,
  UserForm,
  UserQueryParams,
  UserItem,
  UserProfileForm,
  OptionItem,
  PageResult,
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
    });
    return adaptPagination<UserItem>(res);
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
};

export default UserAPI;
