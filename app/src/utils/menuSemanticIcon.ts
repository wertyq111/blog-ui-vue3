/**
 * 动森语义菜单图标解析器
 *
 * @description
 * 按菜单 path 显式映射到语义贴合的动森图标（用户/角色/菜单/部门/日志…）。
 * 命中返回语义图标名（由 AnimalMenuIcon 渲染）；未命中返回 null，
 * 调用方回退到原 AnimalIcon 道具图标，保证铺开前线上无缺图。
 *
 * 试点 10 个；后续铺开只需在 PATH_MAP 追加映射 + 在 AnimalMenuIcon/全局样式补 glyph 与动效。
 */

/** path → 语义图标名（精确匹配，path 末尾斜杠已归一） */
const PATH_MAP: Record<string, string> = {
  // 顶级
  "/dashboard": "menu-home",
  "/dashboard/workplace": "menu-workplace",
  // 父级目录
  "/system": "menu-system",
  "/member": "menu-member",
  "/develop": "menu-develop",
  "/design": "menu-design",
  "/user": "menu-profile-center",
  // 系统管理
  "/system/user": "menu-user",
  "/system/role": "menu-role",
  "/system/menu": "menu-menu",
  // 会员管理
  "/member/memberlevel": "menu-memberlevel",
  "/member/member": "menu-member-list",
  // 开发管理
  "/develop/convert-path": "menu-convert-path",
  "/develop/init-model": "menu-init-model",
  "/develop/work-platform": "menu-work-platform",
  "/develop/work-daily": "menu-work-daily",
  "/develop/work-doc": "menu-work-doc",
  "/develop/todo": "menu-todo",
  // 设计管理
  "/design/image-process": "menu-image-process",
  // 个人中心
  "/user/profile": "menu-profile",
  // 用户详情
  "/system/user/info": "menu-user-info",
  // 小程序管理（隐藏模块）
  "/mini-program": "menu-mini-program",
  "/mini-program/wallpaper-classify": "menu-wallpaper-classify",
  "/mini-program/wallpaper": "menu-wallpaper",
  "/mini-program/notebook-category": "menu-notebook-category",
  "/mini-program/notebook-label": "menu-notebook-label",
  "/mini-program/notebook": "menu-notebook",
  "/mini-program/photo-category": "menu-photo-category",
  "/mini-program/photo": "menu-photo",
  // 烟草管理（隐藏模块）
  "/tobacco": "menu-tobacco",
  "/tobacco/tobacco-customer": "menu-tobacco-customer",
  "/tobacco/tobacco-order": "menu-tobacco-order",
  "/tobacco/tobacco-designated": "menu-tobacco-designated",
  "/tobacco/tobacco-supplement": "menu-tobacco-supplement",
  "/tobacco/tobacco-yun": "menu-tobacco-yun",
  "/tobacco/tobacco-supply": "menu-tobacco-supply",
  "/tobacco/tobacco-order-inspect": "menu-tobacco-order-inspect",
  // 以下菜单远端当前不存在，预留映射（重新启用即生效）
  "/system/level": "menu-level",
  "/system/position": "menu-position",
  "/system/dept": "menu-dept",
  "/system/loginlog": "menu-loginlog",
  "/system/operlog": "menu-operlog",
};

/**
 * 全部语义图标名（按分组展示顺序），供菜单图标选择器列举。
 * 与 AnimalMenuIcon 的 glyph 库一一对应。
 */
export const MENU_ICON_NAMES: string[] = [
  // 顶级
  "menu-home", "menu-workplace",
  // 父级目录
  "menu-system", "menu-member", "menu-develop", "menu-design", "menu-profile-center",
  // 系统管理
  "menu-user", "menu-role", "menu-menu", "menu-user-info",
  // 会员管理
  "menu-memberlevel", "menu-member-list",
  // 开发管理
  "menu-convert-path", "menu-init-model", "menu-work-platform",
  "menu-work-daily", "menu-work-doc", "menu-todo",
  // 设计管理
  "menu-image-process",
  // 个人中心
  "menu-profile",
  // 小程序管理
  "menu-mini-program", "menu-wallpaper-classify", "menu-wallpaper",
  "menu-notebook-category", "menu-notebook-label", "menu-notebook",
  "menu-photo-category", "menu-photo",
  // 烟草管理
  "menu-tobacco", "menu-tobacco-customer", "menu-tobacco-order",
  "menu-tobacco-designated", "menu-tobacco-supplement", "menu-tobacco-yun",
  "menu-tobacco-supply", "menu-tobacco-order-inspect",
  // 其它（部分远端预留）
  "menu-level", "menu-position", "menu-dept", "menu-loginlog", "menu-operlog",
];

/** 语义图标名集合，供校验 */
export const MENU_SEMANTIC_NAMES = new Set<string>(MENU_ICON_NAMES);

function normalizePath(p?: string | null): string {
  const raw = (p ?? "").trim();
  if (!raw || raw === "/") return raw;
  return raw.replace(/\/+$/, "");
}

/**
 * 按 path 解析菜单语义图标名（自动映射）。
 *
 * @param path 菜单路由 path
 * @returns 命中返回语义名，否则 null
 */
export function resolveMenuIcon(path?: string | null): string | null {
  const key = normalizePath(path);
  if (key && PATH_MAP[key]) return PATH_MAP[key];
  return null;
}

/**
 * 解析菜单应渲染的语义图标名：优先用菜单显式存储的语义名（表单选择），
 * 否则回退到按 path 自动映射。两者都没有返回 null（调用方回退到道具图标）。
 *
 * @param icon 菜单存储的 icon 字段
 * @param path 菜单路由 path
 */
export function resolveMenuIconName(
  icon?: string | null,
  path?: string | null
): string | null {
  const raw = (icon ?? "").trim();
  if (raw && MENU_SEMANTIC_NAMES.has(raw)) return raw;
  return resolveMenuIcon(path);
}
