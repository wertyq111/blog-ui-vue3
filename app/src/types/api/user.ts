/**
 * User 用户类型定义
 */

import type { BaseQueryParams } from "./common";

/** 登录用户信息 */
export interface UserInfo {
  /** 用户ID */
  userId?: string;
  /** 用户名 */
  username?: string;
  /** 用户昵称 */
  nickname?: string;
  /** 头像URL */
  avatar?: string;
  /** 性别(0:保密;1:男;2:女) */
  gender?: number;
  /** 租户切换权限（true 可切换租户） */
  canSwitchTenant?: boolean;
  /** 角色集合 */
  roles: string[];
  /** 权限集合 */
  perms: string[];
}

/** 用户分页查询参数 */
export interface UserQueryParams extends BaseQueryParams {
  /** 模糊匹配用户名 */
  "filter[username]"?: string;
  /** 模糊匹配手机号 */
  "filter[phone]"?: string;
  /** 精确匹配性别 */
  "filter[gender]"?: number;
  /** 精确匹配状态 */
  "filter[status]"?: number;
  /** 精确匹配角色ID */
  "filter[roles.id]"?: number;
}

/** 用户分页对象 */
export interface UserItem {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 手机号 */
  phone?: string;
  /** 用户邮箱 */
  email?: string;
  /** 用户状态(1:启用;0:禁用) */
  status: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 角色对象集合 */
  roles?: Array<{ id: number; code: string; name: string }>;
  /** 角色名称，多个使用英文逗号(,)分割 */
  roleNames?: string;
  /** 会员基本信息 */
  member?: {
    id: number;
    realname?: string;
    nickname?: string;
    gender?: number;
    avatar?: string;
    address?: string;
    intro?: string;
  };
}

/** 用户表单对象 */
export interface UserForm {
  /** 用户ID */
  id?: string;
  /** 用户名 */
  username?: string;
  /** 手机号 */
  phone?: string;
  /** 用户邮箱 */
  email?: string;
  /** 密码 */
  password?: string;
  /** 用户状态(1:正常;0:禁用) */
  status?: number;
  /** 角色ID集合 */
  roleIds?: number[];
}

/** 个人中心用户信息表单 */
export interface UserProfileForm {
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  mobile?: string;
  /** 真实姓名 */
  realname?: string;
  /** 用户昵称 */
  nickname?: string;
  /** 性别 */
  gender?: number;
  /** 头像URL */
  avatar?: string;
  /** 地址 */
  address?: string;
  /** 简介 */
  intro?: string;
}
