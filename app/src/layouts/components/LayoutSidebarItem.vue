<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!--【叶子节点】显示叶子节点或唯一子节点且父节点未配置始终显示 -->
    <template
      v-if="
        // 未配置始终显示，使用唯一子节点替换父节点显示为叶子节点
        (hasOneShowingChild(item.children, item) &&
          !item.meta?.alwaysShow &&
          (!onlyOneChild.children || onlyOneChild.noShowingChildren)) ||
        // 即使配置了始终显示，但无子节点，也显示为叶子节点
        (item.meta?.alwaysShow && !item.children)
      "
    >
      <AppLink
        v-if="onlyOneChild.meta"
        :to="{
          path: resolvePath(onlyOneChild.path),
          query: onlyOneChild.meta.params,
        }"
      >
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <template v-if="onlyOneChild.meta">
            <MenuIcon :icon="onlyOneChild.meta.icon || item.meta?.icon" />
            <span v-if="onlyOneChild.meta.title" class="ml-1">
              {{ translateRouteTitle(onlyOneChild.meta.title) }}
            </span>
          </template>
        </el-menu-item>
      </AppLink>
    </template>

    <!--【非叶子节点】显示含多个子节点的父菜单，或始终显示的单子节点 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" :data-path="item.path" teleported>
      <template #title>
        <template v-if="item.meta">
          <MenuIcon :icon="item.meta.icon" />
          <span v-if="item.meta.title" class="ml-1">
            {{ translateRouteTitle(item.meta.title) }}
          </span>
        </template>
      </template>

      <LayoutSidebarItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import path from "path-browserify";
import { RouteRecordRaw } from "vue-router";
import { isExternal } from "@/utils";
import { translateRouteTitle } from "@/lang/utils";
import AnimalIcon from "@/components/AnimalIcon/index.vue";
import { resolveAnimalIcon } from "@/utils/menuAnimalIcon";

defineOptions({
  name: "LayoutSidebarItem",
  inheritAttrs: false,
});

// 菜单图标组件
// 菜单图标统一渲染为动森（animal-island-vue）图标
const MenuIcon = defineComponent({
  name: "MenuIcon",
  props: { icon: String },
  setup(props) {
    return () =>
      h(AnimalIcon, {
        name: resolveAnimalIcon(props.icon),
        size: 18,
        class: "menu-icon",
      });
  },
});

const props = defineProps({
  /**
   * 当前路由对象
   */
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },

  /**
   * 父级完整路径
   */
  basePath: {
    type: String,
    required: true,
  },

  /**
   * 是否为嵌套路由
   */
  isNest: {
    type: Boolean,
    default: false,
  },
});

// 可见的唯一子节点
const onlyOneChild = ref();

/**
 * 检查是否仅有一个可见子节点
 *
 * @param children 子路由数组
 * @param parent 父级路由
 * @returns 是否仅有一个可见子节点
 */
function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw) {
  // 过滤出可见子节点
  const showingChildren = children.filter((route: RouteRecordRaw) => {
    if (!route.meta?.hidden) {
      onlyOneChild.value = route;
      return true;
    }
    return false;
  });

  // 仅有一个节点
  if (showingChildren.length === 1) {
    return true;
  }

  // 无子节点
  if (showingChildren.length === 0) {
    // 父节点设置为唯一显示节点，并标记为无子节点
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }
  return false;
}

/**
 * 获取完整路径，适配外部链接
 *
 * @param routePath 路由路径
 * @returns 绝对路径
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) return routePath;
  if (isExternal(props.basePath)) return props.basePath;

  // 拼接父路径和当前路径
  return path.resolve(props.basePath, routePath);
}
</script>

<style lang="scss">
/* stylelint-disable no-descending-specificity */
/* 菜单图标统一样式 */
.el-menu-item,
.el-sub-menu__title {
  .el-icon {
    width: 1em !important;
    margin-right: 0 !important;
    font-size: 18px;
    color: currentcolor;
  }

  [class^="i-svg:"] {
    width: 18px;
    height: 18px;
    font-size: 18px;
    color: currentcolor !important;
  }
}

/* 折叠状态下的图标样式 - 确保 SVG 图标不被压缩 */
.el-menu--collapse {
  .el-menu-item,
  .el-sub-menu > .el-sub-menu__title {
    [class^="i-svg:"] {
      width: 18px !important;
      min-width: 18px !important;
      height: 18px !important;
      font-size: 18px !important;
    }
  }

  /* tooltip 弹出层中的图标 */
  .el-tooltip__trigger {
    [class^="i-svg:"] {
      width: 18px !important;
      min-width: 18px !important;
      height: 18px !important;
      font-size: 18px !important;
    }
  }
}

/* hideSidebar 状态下的图标 */
.hideSidebar {
  [class^="i-svg:"] {
    width: 18px !important;
    min-width: 18px !important;
    height: 18px !important;
    font-size: 18px !important;
  }

  .submenu-title-noDropdown {
    position: relative;

    & > span {
      display: inline-block;
      visibility: hidden;
      width: 0;
      height: 0;
      overflow: hidden;
    }
  }

  .el-sub-menu {
    overflow: hidden;

    & > .el-sub-menu__title {
      .sub-el-icon {
        margin-left: 19px;
      }

      .el-sub-menu__icon-arrow {
        display: none;
      }
    }
  }

  .el-menu--collapse {
    width: $sidebar-width-collapsed;

    .el-sub-menu {
      & > .el-sub-menu__title > span {
        display: inline-block;
        visibility: hidden;
        width: 0;
        height: 0;
        overflow: hidden;
      }
    }
  }
}

// 父菜单激活状态样式
.el-sub-menu {
  &.has-active-child > .el-sub-menu__title {
    color: #4a8a36 !important;
    background: rgba(255, 255, 255, 0.58) !important;
    border-radius: 12px;

    .menu-icon {
      color: currentcolor !important;
    }
  }
}

.sidebar-wrapper--vertical {
  .el-sub-menu {
    .el-menu {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px 0 8px;
      background: transparent !important;
    }
  }

  .el-menu-item {
    position: relative;
    height: 38px !important;
    min-height: 38px;
    margin: 0;
    padding: 0 38px 0 36px !important;
    border-radius: 12px;
    color: #9f927d !important;
    font-size: 13px;
    font-weight: 700;
    line-height: 38px !important;
    text-decoration: none;
    transition:
      background 0.18s ease,
      color 0.18s ease,
      box-shadow 0.18s ease;

    .el-icon,
    [class^="i-svg:"] {
      position: absolute;
      left: 14px;
      color: #c4b89e !important;
    }

    &:hover {
      color: #794f27 !important;
      background: rgba(255, 255, 255, 0.7) !important;
    }

    &.is-active {
      color: #4a8a36 !important;
      background: linear-gradient(135deg, #d8ecc6 0%, #c4e3a4 100%) !important;
      box-shadow: inset 0 0 0 1.5px rgba(74, 138, 54, 0.15);

      &::before {
        position: absolute;
        top: 50%;
        left: -6px;
        width: 4px;
        height: 24px;
        content: "";
        background: #4a8a36;
        border-radius: 0 4px 4px 0;
        transform: translateY(-50%);
      }

      &::after {
        position: absolute;
        right: 12px;
        content: "🍃";
        font-size: 12px;
      }

      .el-icon,
      [class^="i-svg:"] {
        color: #4a8a36 !important;
      }
    }
  }
}
/* stylelint-enable no-descending-specificity */
</style>
