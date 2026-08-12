<template>
  <BaseLayout>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <div class="layout__header-content">
        <div v-if="showLogo" class="layout__header-logo">
          <LayoutLogo :collapse="isLogoCollapsed" />
        </div>

        <!-- 顶部菜单 -->
        <div class="layout__header-menu">
          <el-menu
            mode="horizontal"
            :default-active="activeTopMenuPath"
            :background-color="useMenuColors ? variables['menu-background'] : undefined"
            :text-color="useMenuColors ? variables['menu-text'] : undefined"
            :active-text-color="useMenuColors ? variables['menu-active-text'] : undefined"
            @select="handleTopMenuSelect"
          >
            <el-menu-item v-for="item in topMenuItems" :key="item.path" :index="item.path">
              <template v-if="item.meta">
                <MenuIcon :icon="item.meta.icon" :path="item.path" />
                <span v-if="item.meta.title" class="ml-1">
                  {{ translateRouteTitle(item.meta.title) }}
                </span>
              </template>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="layout__header-actions">
          <LayoutToolbar />
        </div>
      </div>
    </div>

    <!-- 主内容区容器 -->
    <div class="layout__container">
      <!-- 左侧菜单栏 -->
      <div class="layout__sidebar--left" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
        <el-scrollbar>
          <el-menu
            :default-active="activeSideMenuPath"
            :collapse="!isSidebarOpen"
            :collapse-transition="false"
            :unique-opened="false"
            :background-color="variables['menu-background']"
            :text-color="variables['menu-text']"
            :active-text-color="variables['menu-active-text']"
          >
            <LayoutSidebarItem
              v-for="item in sideMenuRoutes"
              :key="item.path"
              :item="item"
              :base-path="resolvePath(item.path)"
            />
          </el-menu>
        </el-scrollbar>
        <div class="layout__sidebar-toggle">
          <Hamburger :is-active="isSidebarOpen" @toggle-click="toggleSidebar" />
        </div>
      </div>

      <!-- 主内容区 -->
      <div :class="{ hasTagsView: showTagsView }" class="layout__main">
        <LayoutTagsView v-if="showTagsView" />
        <LayoutMain />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import type { LocationQueryRaw, RouteRecordRaw } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "./useLayout";
import { useAppStore, usePermissionStore, useSettingsStore } from "@/store";
import { isExternal } from "@/utils/index";
import { translateRouteTitle } from "@/lang/utils";
import { SidebarColor } from "@/enums/settings";
import AnimalIcon from "@/components/AnimalIcon/index.vue";
import AnimalMenuIcon from "@/components/AnimalMenuIcon/index.vue";
import { resolveAnimalIcon } from "@/utils/menuAnimalIcon";
import { resolveMenuIconName } from "@/utils/menuSemanticIcon";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutToolbar from "./components/LayoutToolbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutSidebarItem from "./components/LayoutSidebarItem.vue";
import Hamburger from "@/components/Hamburger/index.vue";
import variables from "@/styles/variables.module.scss";

// 命中语义映射 → 动森语义图标（多动效）；否则回退原动森道具图标
const MenuIcon = defineComponent({
  name: "MenuIcon",
  props: { icon: String, path: String },
  setup(props) {
    return () => {
      const semantic = resolveMenuIconName(props.icon, props.path);
      if (semantic) {
        return h(AnimalMenuIcon, { name: semantic, size: 22, class: "menu-icon" });
      }
      return h(AnimalIcon, {
        name: resolveAnimalIcon(props.icon),
        size: 22,
        class: "menu-icon",
      });
    };
  },
});

const route = useRoute();
const router = useRouter();
const { width } = useWindowSize();

const appStore = useAppStore();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

const { showTagsView, showLogo, isSidebarOpen, toggleSidebar, sideMenuRoutes, activeTopMenuPath } =
  useLayout();

const isLogoCollapsed = computed(() => width.value < 768);

// 是否使用深色菜单配色（暗色主题或经典蓝侧边栏）
const useMenuColors = computed(
  () =>
    settingsStore.effectiveDarkMode ||
    settingsStore.sidebarColorScheme === SidebarColor.CLASSIC_BLUE
);

// 顶部菜单项（处理单子菜单显示优化）
const topMenuItems = computed(() => {
  const routes = permissionStore.routes.filter((item) => !item.meta?.hidden);

  return routes.map((route) => {
    // alwaysShow 或无子菜单，直接返回
    if (route.meta?.alwaysShow || !route.children?.length) return route;

    // 过滤可见子菜单
    const visibleChildren = route.children.filter((child) => !child.meta?.hidden);

    // 仅一个可见子菜单时，显示子菜单信息
    if (visibleChildren.length === 1) {
      const child = visibleChildren[0];
      return {
        ...route,
        meta: {
          ...route.meta,
          title: child.meta?.title || route.meta?.title,
          icon: child.meta?.icon || route.meta?.icon,
        },
      };
    }
    return route;
  });
});

// 左侧菜单激活路径
const activeSideMenuPath = computed(() => {
  const { meta, path } = route;
  return typeof meta?.activeMenu === "string" ? meta.activeMenu : path;
});

// 解析左侧菜单路径
function resolvePath(routePath: string) {
  if (isExternal(routePath)) return routePath;
  if (routePath.startsWith("/")) return activeTopMenuPath.value + routePath;
  return `${activeTopMenuPath.value}/${routePath}`;
}

// 从路径提取顶级菜单路径
function extractTopMenuPath(path: string): string {
  return path.split("/").filter(Boolean).length > 1 ? path.match(/^\/[^/]+/)?.[0] || "/" : "/";
}

// 顶部菜单点击
function handleTopMenuSelect(menuPath: string) {
  if (menuPath === activeTopMenuPath.value) return;

  appStore.activeTopMenu(menuPath);
  permissionStore.setMixLayoutSideMenus(menuPath);
  navigateToFirstMenu(permissionStore.mixLayoutSideMenus);
}

// 导航到第一个可访问菜单
function navigateToFirstMenu(menus: RouteRecordRaw[]) {
  if (!menus.length) return;

  const [first] = menus;
  if (first.children?.length) {
    navigateToFirstMenu(first.children as RouteRecordRaw[]);
  } else if (first.name) {
    router.push({
      name: first.name,
      query:
        typeof first.meta?.params === "object"
          ? (first.meta.params as LocationQueryRaw)
          : undefined,
    });
  }
}

// 监听路由变化，同步顶部菜单状态
watch(
  () => route.path,
  (newPath) => {
    const topMenuPath = extractTopMenuPath(newPath);
    const isTopMenuChanged = topMenuPath !== activeTopMenuPath.value;

    if (isTopMenuChanged) {
      appStore.activeTopMenu(topMenuPath);
    }

    // 切换布局（如左侧 -> 混合）时，activeTopMenuPath 可能已是正确值，
    // 但 mixLayoutSideMenus 仍为空，需要补一次初始化。
    if (isTopMenuChanged || permissionStore.mixLayoutSideMenus.length === 0) {
      permissionStore.setMixLayoutSideMenus(topMenuPath);
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.layout {
  &__header {
    position: sticky;
    top: 18px;
    z-index: 999;
    width: 100%;
    height: $navbar-height;
    padding: 0 22px;
    border-radius: var(--cyber-shell-radius);
    background: var(--cyber-panel-shell);
    border: 1px solid var(--cyber-border-strong);
    box-shadow: var(--cyber-shadow);

    &-content {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0;
    }

    &-logo {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    &-menu {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      height: 100%;
      overflow: hidden;

      :deep(.el-menu) {
        height: 100%;
        background-color: transparent;
        border: none;
      }

      :deep(.el-menu--horizontal) {
        display: flex;
        align-items: center;
        height: 100%;

        .el-menu-item {
          display: inline-flex;
          align-items: center;
          height: 38px;
          line-height: 38px;
          margin: 0 4px;
          border-radius: 999px;
          border-bottom: none;
          color: var(--cyber-text-soft);

          &.is-active {
            color: var(--cyber-sidebar-active-text);
            background: var(--cyber-sidebar-active-bg);
            box-shadow: var(--cyber-sidebar-active-shadow);
          }
        }
      }
    }

    &-actions {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      height: 100%;
      padding: 0 16px;
    }
  }

  &__container {
    display: flex;
    min-height: calc(100vh - $navbar-height - 36px);
    padding-top: 18px;

    .layout__sidebar--left {
      position: relative;
      width: $sidebar-width;
      height: 100%;
      margin: 0;
      background: var(--cyber-sidebar-shell);
      border: 1px solid var(--cyber-sidebar-border);
      border-radius: var(--cyber-shell-radius);
      box-shadow:
        inset -1px 0 0 rgba(255, 255, 255, 0.04),
        20px 0 42px rgba(2, 7, 17, 0.24);
      overflow: hidden;
      transition: width 0.28s;

      &.layout__sidebar--collapsed {
        width: $sidebar-width-collapsed !important;
      }

      :deep(.el-scrollbar) {
        height: calc(100vh - $navbar-height - 50px);
      }

      :deep(.el-menu) {
        height: 100%;
        border: none;
      }

      .layout__sidebar-toggle {
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 50px;
        line-height: 50px;
        background-color: color-mix(in srgb, var(--cyber-panel) 92%, transparent);
        box-shadow: 0 -10px 24px color-mix(in srgb, var(--cyber-primary) 12%, transparent);
      }
    }

    .layout__main {
      flex: 1;
      min-width: 0;
      height: auto;
      margin-left: 0;
      overflow-y: auto;
    }
  }
}

:deep(.mobile) {
  .layout__container {
    .layout__sidebar--left {
      position: fixed;
      top: $navbar-height;
      bottom: 0;
      left: 0;
      z-index: 1000;
      transition: transform 0.28s;
    }
  }

  &.hideSidebar {
    .layout__sidebar--left {
      width: $sidebar-width !important;
      transform: translateX(-$sidebar-width);
    }
  }
}

:deep(.hasTagsView) {
  .app-main {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
