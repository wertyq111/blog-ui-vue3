import request from "@/utils/request";
import type { MenuQueryParams, MenuItem, MenuForm, RouteItem, OptionItem } from "@/types/api";

const MENU_BASE_URL = "/menu";

const MenuAPI = {
  /** 获取当前用户的路由列表 */
  getRoutes() {
    return request<any, RouteItem[]>({ url: `/index/getMenuList`, method: "get" });
  },

  /**
   * 获取菜单列表（后端返回平铺列表，前端构建树）
   */
  async getList(queryParams?: MenuQueryParams) {
    const flatList = await request<any, MenuItem[]>({
      url: `${MENU_BASE_URL}/index`,
      method: "get",
      params: queryParams,
    });
    return buildMenuTree(flatList);
  },

  /**
   * 获取菜单下拉数据源（构建为 OptionItem 树）
   * @param onlyMenu 是否只返回菜单类型（type=0），排除权限类型
   */
  async getOptions(onlyMenu?: boolean) {
    const flatList = await request<any, MenuItem[]>({
      url: `${MENU_BASE_URL}/index`,
      method: "get",
    });
    const filtered = onlyMenu ? flatList.filter((m) => m.type === 0) : flatList;
    return buildOptionTree(filtered);
  },

  /** 获取菜单表单数据 */
  getFormData(id: number) {
    return request<any, MenuForm>({
      url: `${MENU_BASE_URL}/info/${id}`,
      method: "get",
    });
  },

  /** 新增菜单 */
  create(data: MenuForm) {
    return request({
      url: `${MENU_BASE_URL}/add`,
      method: "post",
      data,
    });
  },

  /** 修改菜单 */
  update(id: number, data: MenuForm) {
    return request({
      url: `${MENU_BASE_URL}/${id}`,
      method: "post",
      data,
    });
  },

  /** 删除菜单 */
  deleteById(id: number) {
    return request({
      url: `${MENU_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

/** 将平铺菜单列表构建为树结构 */
function buildMenuTree(flatList: MenuItem[]): MenuItem[] {
  const map = new Map<number, MenuItem>();
  for (const item of flatList) {
    map.set(item.id!, { ...item, children: [] });
  }
  const roots: MenuItem[] = [];
  for (const node of map.values()) {
    if (!node.pid || node.pid === 0 || !map.has(node.pid)) {
      roots.push(node);
    } else {
      const parent = map.get(node.pid)!;
      parent.children!.push(node);
    }
  }
  return roots;
}

/** 将平铺菜单列表构建为 OptionItem 树（用于 el-tree-select） */
function buildOptionTree(flatList: MenuItem[]): OptionItem[] {
  const map = new Map<number, OptionItem & { _pid: number }>();
  for (const item of flatList) {
    map.set(item.id!, {
      value: item.id!,
      label: item.title || "",
      children: [],
      _pid: item.pid || 0,
    } as any);
  }
  const roots: OptionItem[] = [];
  for (const node of map.values()) {
    const pid = (node as any)._pid;
    if (pid === 0 || !map.has(pid)) {
      roots.push(node);
    } else {
      const parent = map.get(pid)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    }
  }
  return roots;
}

export default MenuAPI;
