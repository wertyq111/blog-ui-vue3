<!-- 菜单组件 -->
<template>
  <div class="sidebar-wrapper">
    <el-menu
      ref="menuRef"
      :default-active="activeMenuPath"
      :collapse="!appStore.sidebar.opened"
      class="sidebar-menu-cyber"
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
  </div>
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
.sidebar-wrapper {
  background:
    radial-gradient(circle at top right, rgba(170, 236, 109, 0.14), transparent 24%),
    radial-gradient(circle at bottom left, rgba(168, 216, 255, 0.14), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(246, 251, 241, 0.72));
  backdrop-filter: blur(20px);
  border-radius: 28px;
  margin: 18px 0 18px 18px;
  height: calc(100% - 36px);
  overflow: hidden;
  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.04),
    20px 0 42px rgba(150, 176, 145, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.56);
}

.sidebar-menu-cyber {
  background-color: transparent !important;
  border: none;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    position: relative;
    margin: 6px 12px;
    border-radius: 14px;
    color: var(--menu-text-color);
    transition: all 0.26s ease;

    i, .el-icon {
      color: inherit;
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.58) !important;
      color: #3f4f3a !important;
      box-shadow: 0 12px 24px rgba(177, 197, 158, 0.08);
    }
  }

  :deep(.el-menu-item.is-active) {
    color: #ffffff !important;
    background: linear-gradient(135deg, #b6e866 0%, #82c91e 60%, #69c014 100%) !important;
    box-shadow: 0 12px 24px rgba(130, 201, 30, 0.24), 0 0 22px rgba(130, 201, 30, 0.26);
    
    i, .el-icon {
      color: #ffffff !important;
    }
  }

  :deep(.el-sub-menu.has-active-child > .el-sub-menu__title) {
    color: #586255;
    font-weight: 700;
  }
}

:global(html.dark) .sidebar-wrapper {
  background: rgba(10, 18, 30, 0.72);
  border: 1px solid rgba(109, 183, 255, 0.14);
  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.04),
    20px 0 42px rgba(2, 7, 17, 0.24);
}

:global(html.dark) .sidebar-menu-cyber {
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    color: rgba(202, 224, 248, 0.78);

    &:hover {
      background: rgba(34, 80, 126, 0.36) !important;
      color: #eef6ff !important;
    }
  }

  :deep(.el-menu-item.is-active) {
    background: linear-gradient(135deg, rgba(15, 167, 255, 0.96), rgba(20, 104, 255, 0.94)) !important;
    box-shadow: 0 12px 24px rgba(13, 126, 255, 0.24), 0 0 22px rgba(16, 165, 255, 0.26);
  }
}
</style>
