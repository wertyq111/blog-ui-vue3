/**
 * Role 角色类型定义
 */

import type { BaseQueryParams } from "./common";

/** 角色分页查询参数 */
export interface RoleQueryParams extends BaseQueryParams {
  /** 模糊匹配角色名称 */
  "filter[name]"?: string;
}

/** 角色分页对象 */
export interface RoleItem {
  /** 角色ID */
  id?: string;
  /** 角色编码 */
  code?: string;
  /** 角色名称 */
  name?: string;
  /** 排序 */
  sort?: number;
  /** 角色状态(1:启用;0:禁用) */
  status?: number;
  /** 备注 */
  note?: string;
  /** 创建时间 */
  createdAt?: string;
}

/** 角色表单对象 */
export interface RoleForm {
  /** 角色ID */
  id?: string;
  /** 角色编码 */
  code?: string;
  /** 角色名称 */
  name?: string;
  /** 排序 */
  sort?: number;
  /** 角色状态(1:启用;0:禁用) */
  status?: number;
  /** 备注 */
  note?: string;
}

/** 后端权限列表项（GET /role/permission/{id} 返回） */
export interface BackendPermissionItem {
  id: number;
  pid: number;
  title: string;
  type: number;
  permission?: string;
  checked?: boolean;
  open?: boolean;
}
