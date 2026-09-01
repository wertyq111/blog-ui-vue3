<!-- 菜单组件 -->
<template>
  <div :class="['sidebar-wrapper', `sidebar-wrapper--${menuMode}`]">
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
const theme = computed(() => settingsStore.resolvedTheme);

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
  background: var(--cyber-sidebar-shell);
  backdrop-filter: blur(20px);
  border-radius: var(--cyber-shell-radius);
  margin: 18px 0 18px 18px;
  height: calc(100% - 36px);
  overflow: hidden;
  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.04),
    20px 0 42px rgba(2, 7, 17, 0.24);
  border: 1px solid var(--cyber-sidebar-border);
}

.sidebar-wrapper--horizontal {
  margin: 0;
  height: auto;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  border-radius: 0;
}

.sidebar-menu-cyber {
  background-color: transparent !important;
  border: none;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    position: relative;
    height: 43px;
    min-height: 43px;
    margin: 5px 2px;
    padding: 0 12px !important;
    border-radius: 14px;
    color: var(--cyber-sidebar-text);
    font-size: 12px;
    font-weight: 700;
    transition: all 0.20s ease;

    i,
    .el-icon {
      color: inherit;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.58) !important;
      color: var(--cyber-text) !important;
      box-shadow: none;
    }
  }

  :deep(.el-menu-item.is-active) {
    color: var(--ai-leaf-d) !important;
    background: linear-gradient(135deg, var(--ai-leaf-l) 0%, #c4e3a4 100%) !important;
    box-shadow: inset 0 0 0 1.5px rgba(74, 138, 54, 0.15);

    // 左侧绿色高亮条
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      width: 4px;
      height: 24px;
      background: var(--ai-leaf-d);
      border-radius: 0 4px 4px 0;
      transform: translateY(-50%);
    }

    // 右侧叶子
    &::after {
      content: "🍃";
      position: absolute;
      right: 12px;
      font-size: 12px;
    }
    
    i, .el-icon {
      color: currentcolor !important;
    }
  }

  :deep(.el-sub-menu.has-active-child > .el-sub-menu__title) {
    color: var(--cyber-sidebar-active-text);
    font-weight: 700;
    background: rgba(216, 236, 198, 0.50) !important;
  }

  :deep(.el-sub-menu .el-menu-item) {
    height: 36px;
    min-height: 36px;
    margin: 4px 2px;
    padding-left: 28px !important;
    font-size: 12px;
  }
}
</style>
