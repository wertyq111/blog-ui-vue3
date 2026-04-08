/**
 * Menu 菜单类型定义
 */

/** 菜单查询参数 */
export interface MenuQueryParams {
  /** 模糊匹配标题 */
  "filter[title]"?: string;
}

/** 菜单视图对象（后端 GET /menu/index 返回） */
export interface MenuItem {
  /** 菜单ID */
  id?: number;
  /** 父菜单ID */
  pid?: number;
  /** 菜单标题 */
  title?: string;
  /** ICON */
  icon?: string;
  /** 路由路径 */
  path?: string;
  /** 组件路径 */
  component?: string;
  /** 链接目标 */
  target?: string;
  /** 按钮权限标识 */
  permission?: string;
  /** 菜单类型（0:菜单/目录 1:权限/按钮） */
  type?: number;
  /** 状态(1:启用;0:禁用) */
  status?: number;
  /** 是否隐藏(0:显示;1:隐藏) */
  hide?: number;
  /** 备注 */
  note?: string;
  /** 排序 */
  sort?: number;
  /** 子菜单 */
  children?: MenuItem[];
}

/** 菜单表单对象 */
export interface MenuForm {
  /** 菜单ID */
  id?: number;
  /** 父菜单ID */
  pid?: number;
  /** 菜单标题 */
  title?: string;
  /** 菜单类型（0:菜单/目录 1:权限/按钮） */
  type?: number;
  /** 路由路径 */
  path?: string;
  /** 组件路径 */
  component?: string;
  /** 链接目标 */
  target?: string;
  /** ICON */
  icon?: string;
  /** 排序 */
  sort?: number;
  /** 是否隐藏(0:显示;1:隐藏) */
  hide?: number;
  /** 状态(1:启用;0:禁用) */
  status?: number;
  /** 按钮权限标识 */
  permission?: string;
  /** 备注 */
  note?: string;
  /** 权限子项排序列表（用于自动创建权限子菜单） */
  checkedList?: number[];
}

/** 路由对象 */
export interface RouteItem {
  /** 子路由列表 */
  children: RouteItem[];
  /** 组件路径 */
  component?: string;
  /** 路由名称 */
  name?: string;
  /** 路由路径 */
  path?: string;
  /** 路由属性 */
  meta?: Meta;
  /** 跳转链接 */
  redirect?: string;
}

/** 路由属性 */
export interface Meta {
  /** 【目录】只有一个子路由是否始终显示 */
  alwaysShow?: boolean;
  /** 是否隐藏(true-是 false-否) */
  hidden?: boolean;
  /** ICON */
  icon?: string;
  /** 【菜单】是否开启页面缓存 */
  keepAlive?: boolean;
  /** 路由参数 */
  params?: Record<string, any>;
  /** 角色集合 */
  roles?: string[];
  /** 路由title */
  title?: string;
}
