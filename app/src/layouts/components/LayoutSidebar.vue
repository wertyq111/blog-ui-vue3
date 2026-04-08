<!-- 菜单组件 -->
<template>
  <el-menu
    ref="menuRef"
    :default-active="activeMenuPath"
    :collapse="!appStore.sidebar.opened"
    class="sidebar-menu-glass"
    :popper-effect="theme"
    :unique-opened="false"
    :collapse-transition="false"
    :mode="menuMode"
    @open="onMenuOpen"
    @close="onMenuClose"
  >
    <!-- 菜单项 -->
    <LayoutSidebarItem
      v-for="route in data"
      :key="route.path"
      :item="route"
      :base-path="resolveFullPath(route.path)"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import path from "path-browserify";
import type { MenuInstance } from "element-plus";
import type { RouteRecordRaw } from "vue-router";
import { useSettingsStore, useAppStore } from "@/store";
import { isExternal } from "@/utils/index";
import LayoutSidebarItem from "./LayoutSidebarItem.vue";

const props = defineProps({
  data: {
    type: Array as PropType<RouteRecordRaw[]>,
    default: () => [],
  },
  basePath: {
    type: String,
    required: true,
    example: "/system",
  },
  menuMode: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical",
    validator: (value: string) => ["vertical", "horizontal"].includes(value),
  },
});

const menuRef = ref<MenuInstance>();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const currentRoute = useRoute();

// 存储已展开的菜单项索引
const expandedMenuIndexes = ref<string[]>([]);

// 获取主题
const theme = computed(() => settingsStore.theme);

// 计算当前激活的菜单项
const activeMenuPath = computed((): string => {
  const { meta, path } = currentRoute;

  // 如果路由 meta 中设置了 activeMenu，则使用它（用于处理一些特殊情况，如详情页等）
  if (meta?.activeMenu && typeof meta.activeMenu === "string") {
    return meta.activeMenu;
  }

  // 否则使用当前路由路径
  return path;
});

/**
 * 获取完整路径
 *
 * @param routePath 当前路由的相对路径 /user
 * @returns 完整的绝对路径 D://vue3-element-admin/system/user
 */
function resolveFullPath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  // 如果 basePath 为空（顶部布局），直接返回 routePath
  if (!props.basePath || props.basePath === "") {
    return routePath;
  }

  // 解析路径，生成完整的绝对路径
  return path.resolve(props.basePath, routePath);
}

/**
 * 打开菜单
 *
 * @param index 当前展开的菜单项索引
 */
const onMenuOpen = (index: string) => {
  expandedMenuIndexes.value.push(index);
};

/**
 * 关闭菜单
 *
 * @param index 当前收起的菜单项索引
 */
const onMenuClose = (index: string) => {
  expandedMenuIndexes.value = expandedMenuIndexes.value.filter((item) => item !== index);
};

/**
 * 监听展开的菜单项变化，更新父菜单样式
 */
watch(
  () => expandedMenuIndexes.value,
  () => {
    updateParentMenuStyles();
  }
);

/**
 * 监听菜单模式变化：当菜单模式切换为水平模式时，关闭所有展开的菜单项
 * 避免在水平模式下菜单项显示错位
 */
watch(
  () => props.menuMode,
  (newMode) => {
    if (newMode === "horizontal" && menuRef.value) {
      expandedMenuIndexes.value.forEach((item) => menuRef.value!.close(item));
    }
  }
);

/**
 * 监听激活菜单变化，为包含激活子菜单的父菜单添加样式
 */
watch(
  () => activeMenuPath.value,
  () => {
    nextTick(() => {
      updateParentMenuStyles();
    });
  },
  { immediate: true }
);

/**
 * 监听路由变化，确保菜单能随 TagsView 切换而正确激活
 */
watch(
  () => currentRoute.path,
  () => {
    nextTick(() => {
      updateParentMenuStyles();
    });
  }
);

/**
 * 更新父菜单样式 - 为包含激活子菜单的父菜单添加 has-active-child 类
 */
function updateParentMenuStyles() {
  if (!menuRef.value?.$el) return;

  nextTick(() => {
    try {
      const menuEl = menuRef.value?.$el as HTMLElement;
      if (!menuEl) return;

      // 移除所有现有的 has-active-child 类
      const allSubMenus = menuEl.querySelectorAll(".el-sub-menu");
      allSubMenus.forEach((subMenu) => {
        subMenu.classList.remove("has-active-child");
      });

      // 查找当前激活的菜单项
      const activeMenuItem = menuEl.querySelector(".el-menu-item.is-active");

      if (activeMenuItem) {
        // 向上查找父级 el-sub-menu 元素
        let parent = activeMenuItem.parentElement;
        while (parent && parent !== menuEl) {
          if (parent.classList.contains("el-sub-menu")) {
            parent.classList.add("has-active-child");
          }
          parent = parent.parentElement;
        }
      } else {
        // 水平模式下可能需要特殊处理
        if (props.menuMode === "horizontal") {
          // 对于水平菜单，使用路径匹配来找到父菜单
          const currentPath = activeMenuPath.value;

          // 查找所有父菜单项，检查哪个包含当前路径
          allSubMenus.forEach((subMenu) => {
            const subMenuEl = subMenu as HTMLElement;
            const subMenuPath =
              subMenuEl.getAttribute("data-path") ||
              subMenuEl.querySelector(".el-sub-menu__title")?.getAttribute("data-path");

            // 如果找到包含当前路径的父菜单，则添加激活类
            if (subMenuPath && currentPath.startsWith(subMenuPath)) {
              subMenuEl.classList.add("has-active-child");
            }
          });
        }
      }
    } catch (error) {
      console.error("Error updating parent menu styles:", error);
    }
  });
}

/**
 * 组件挂载后立即更新父菜单样式
 */
onMounted(() => {
  // 确保在组件挂载后更新样式，不依赖于异步操作
  updateParentMenuStyles();
});
</script>

<style lang="scss" scoped>
.sidebar-menu-glass {
  background-color: transparent !important;
  border: none;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    position: relative;
    margin: 3px 8px;
    border-radius: 10px;
    color: var(--menu-text);
    transition: color 0.26s ease, background-color 0.26s ease, box-shadow 0.26s ease;

    i {
      color: inherit;
    }

    &:hover {
      background-color: var(--menu-hover) !important;
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 26%, transparent);
    }
  }

  :deep(.el-menu-item.is-active) {
    color: var(--menu-active-text) !important;
    background: linear-gradient(90deg, color-mix(in srgb, var(--el-color-primary) 24%, transparent), color-mix(in srgb, #8e6bff 20%, transparent)) !important;
    box-shadow: 0 8px 18px color-mix(in srgb, var(--el-color-primary) 24%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 48%, transparent);
  }

  :deep(.el-sub-menu.has-active-child > .el-sub-menu__title) {
    color: var(--menu-active-text);
    background: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
  }
}

:global(html.dark) .sidebar-menu-glass {
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    color: rgba(229, 240, 255, 0.92);

    &:hover {
      background: rgba(109, 71, 244, 0.18) !important;
      box-shadow: 0 0 18px rgba(109, 71, 244, 0.2);
    }
  }

  :deep(.el-menu-item.is-active) {
    background: linear-gradient(90deg, rgba(109, 71, 244, 0.3), rgba(82, 130, 255, 0.22)) !important;
    box-shadow: 0 10px 24px rgba(63, 101, 255, 0.18), inset 0 0 0 1px rgba(156, 197, 255, 0.3);
  }
}
</style>
