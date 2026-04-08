import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";
import { useUserStoreHook } from "@/store/modules/user";

import MenuAPI from "@/api/system/menu";
import { RouteItem } from "@/types";
const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("../../layouts/index.vue");

function resolveViewComponent(componentPath: string) {
  const normalized = componentPath
    .trim()
    .replace(/^\/+/, "")
    .replace(/\.vue$/i, "");
  return (
    modules[`../../views/${normalized}.vue`] ||
    modules[`../../views/${normalized}/index.vue`] ||
    modules[`../../views/error/404.vue`]
  );
}

export const usePermissionStore = defineStore("permission", () => {
  // 所有路由（静态路由 + 动态路由）
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合布局的左侧菜单路由
  const mixLayoutSideMenus = ref<RouteRecordRaw[]>([]);
  // 动态路由是否已生成
  const isRouteGenerated = ref(false);

  /** 生成动态路由 */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    try {
      const data = await MenuAPI.getRoutes();
      // 后端返回的菜单可能缺少 meta 包装，需要转换
      const normalizedData = normalizeBackendMenus(data);
      const dynamicRoutes = transformRoutes(normalizedData);

      routes.value = [...constantRoutes, ...dynamicRoutes];
      isRouteGenerated.value = true;

      return dynamicRoutes;
    } catch (error) {
      isRouteGenerated.value = false;
      throw error;
    }
  }

  /** 设置混合布局左侧菜单 */
  const setMixLayoutSideMenus = (parentPath: string) => {
    const parentMenu = routes.value.find((item: RouteRecordRaw) => item.path === parentPath);
    mixLayoutSideMenus.value = parentMenu?.children || [];
  };

  /** 重置路由状态 */
  const resetRouter = () => {
    const constantRouteNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));
    routes.value.forEach((route: RouteRecordRaw) => {
      if (route.name && !constantRouteNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });

    routes.value = [...constantRoutes];
    mixLayoutSideMenus.value = [];
    isRouteGenerated.value = false;
  };

  let reloadPromise: Promise<RouteRecordRaw[]> | null = null;

  async function reloadDynamicRoutesOnce(): Promise<RouteRecordRaw[]> {
    if (reloadPromise) return reloadPromise;

    reloadPromise = (async () => {
      try {
        resetRouter();
        const dynamicRoutes = await generateRoutes();
        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });
        return dynamicRoutes;
      } finally {
        reloadPromise = null;
      }
    })();

    return reloadPromise;
  }

  let snapshotPromise: Promise<void> | null = null;

  async function reloadPermissionSnapshotOnce(): Promise<void> {
    if (snapshotPromise) return snapshotPromise;

    snapshotPromise = (async () => {
      try {
        const userStore = useUserStoreHook();
        await userStore.getUserInfo();
        await reloadDynamicRoutesOnce();
      } finally {
        snapshotPromise = null;
      }
    })();

    return snapshotPromise;
  }

  return {
    routes,
    mixLayoutSideMenus,
    isRouteGenerated,
    generateRoutes,
    setMixLayoutSideMenus,
    resetRouter,
    reloadDynamicRoutesOnce,
    reloadPermissionSnapshotOnce,
  };
});

/**
 * 标准化后端菜单数据
 *
 * 后端返回: {id, pid, title, type, path, component, icon, sort, hide, menuChildren}
 * 前端期望: {name, path, component, meta: {title, icon, hidden}, children}
 *
 * 关键映射:
 * - menuChildren → children（后端 children 字段始终为空，实际子菜单在 menuChildren）
 * - hide: 0/1 → meta.hidden: false/true
 * - component: "" → "Layout"（顶层目录）
 * - type: 1（按钮/权限）→ 过滤掉，不生成路由
 */
function normalizeBackendMenus(menus: any[]): RouteItem[] {
  if (!Array.isArray(menus)) return [];

  return menus
    .filter((item) => {
      // 过滤按钮/权限类型（type=1），按钮不作为路由
      return item.type !== 1;
    })
    .map((item) => {
      // 使用 menuChildren（后端实际的子菜单字段）
      const children = item.menuChildren || item.children || [];

      // 顶层目录（pid=0 且无 component 或 component 为空）应使用 Layout
      const component =
        !item.component || item.component === ""
          ? item.pid === 0
            ? "Layout"
            : undefined
          : item.component;

      const route: any = {
        path: item.path,
        name: item.name || item.path?.replace(/\//g, "-").replace(/^-/, ""),
        component,
        redirect: item.redirect,
      };

      route.meta = {
        title: item.title,
        icon: item.icon,
        hidden: item.hide === 1,
        keepAlive: true,
      };

      // 递归处理子菜单
      if (children.length > 0) {
        route.children = normalizeBackendMenus(children);
      }

      return route as RouteItem;
    });
}

/**
 * 转换后端路由数据为Vue Router配置
 */
const transformRoutes = (routes: RouteItem[], isTopLevel: boolean = true): RouteRecordRaw[] => {
  return routes.map((route) => {
    const { component, children, ...args } = route;

    const processedComponent = isTopLevel || component !== "Layout" ? component : undefined;

    const normalizedRoute = { ...args } as RouteRecordRaw;

    if (!processedComponent) {
      normalizedRoute.component = undefined;
    } else {
      normalizedRoute.component =
        processedComponent === "Layout" ? Layout : resolveViewComponent(processedComponent);
    }

    if (children && children.length > 0) {
      normalizedRoute.children = transformRoutes(children, false);
    }

    return normalizedRoute;
  });
};

/** 非组件环境使用权限store */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
