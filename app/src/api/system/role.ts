import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type {
  RoleQueryParams,
  RoleItem,
  RoleForm,
  BackendPermissionItem,
  OptionItem,
  PageResult,
} from "@/types/api";

const ROLE_BASE_URL = "/role";

const RoleAPI = {
  /** 获取角色分页数据 */
  async getPage(queryParams?: RoleQueryParams) {
    const { pageNum, pageSize, ...others } = queryParams ?? {};
    const res = await request<any, any>({
      url: `${ROLE_BASE_URL}/index`,
      method: "get",
      params: { page: pageNum, per_page: pageSize, ...others },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<RoleItem>(res);
  },

  /** 获取角色下拉数据源 */
  getOptions() {
    return request<any, OptionItem[]>({
      url: `${ROLE_BASE_URL}/getRoleList`,
      method: "get",
    });
  },

  /**
   * 获取角色的权限列表（含 checked 标记）
   * 后端返回所有菜单平铺列表，已勾选的 checked=true
   */
  getPermissionList(roleId: string) {
    return request<any, BackendPermissionItem[]>({
      url: `${ROLE_BASE_URL}/permission/${roleId}`,
      method: "get",
    });
  },

  /** 保存角色的菜单权限 */
  savePermissions(roleId: string, menuIds: number[]) {
    return request({
      url: `${ROLE_BASE_URL}/permission/${roleId}`,
      method: "post",
      data: { menu_id: menuIds },
    });
  },

  /** 新增角色 */
  create(data: RoleForm) {
    return request({
      url: `${ROLE_BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 更新角色 */
  update(id: string, data: RoleForm) {
    return request({
      url: `${ROLE_BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除单个角色 */
  deleteById(id: string) {
    return request({
      url: `${ROLE_BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 批量删除角色 */
  batchDelete(ids: number[]) {
    return request({
      url: `${ROLE_BASE_URL}/batchDelete`,
      method: "post",
      data: { id: ids },
    });
  },
};

export default RoleAPI;
