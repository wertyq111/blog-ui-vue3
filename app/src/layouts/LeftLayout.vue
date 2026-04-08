<template>
  <BaseLayout>
    <!-- 左侧菜单 -->
    <div class="layout__sidebar" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
      <div :class="{ 'has-logo': showLogo }" class="layout-sidebar">
        <LayoutLogo v-if="showLogo" :collapse="!isSidebarOpen" />
        <el-scrollbar>
          <LayoutSidebar :data="routes" base-path="" />
        </el-scrollbar>
      </div>
    </div>

    <!-- 主内容区 -->
    <div
      class="layout__main"
      :class="{
        hasTagsView: showTagsView,
        'layout__main--collapsed': !isSidebarOpen,
      }"
    >
      <LayoutNavbar />
      <LayoutTagsView v-if="showTagsView" />
      <LayoutMain />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useLayout } from "./useLayout";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutNavbar from "./components/LayoutNavbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";

const { showTagsView, showLogo, isSidebarOpen, routes } = useLayout();
</script>

<style lang="scss" scoped>
.layout {
  &__sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 999;
    width: $sidebar-width;
    background: var(--menu-background);
    backdrop-filter: blur(20px) saturate(115%);
    border-right: 1px solid var(--app-border);
    box-shadow: var(--app-panel-shadow);
    transition: width 0.28s, background-color 0.3s, box-shadow 0.3s;

    &::before {
      position: absolute;
      top: -20%;
      left: -20%;
      z-index: -1;
      width: 140%;
      height: 140%;
      content: "";
      background: radial-gradient(circle at 22% 18%, var(--app-glow-a), transparent 52%);
      opacity: 0.5;
    }

    &--collapsed {
      width: $sidebar-width-collapsed;
    }

    .layout-sidebar {
      position: relative;
      height: 100%;
      background-color: transparent;
      transition: width 0.28s;

      &.has-logo {
        .el-scrollbar {
          height: calc(100vh - $navbar-height);
        }
      }

      :deep(.el-menu) {
        border: none;
      }
    }
  }

  &__main {
    position: relative;
    height: 100%;
    margin-left: $sidebar-width;
    overflow-y: auto;
    background-color: transparent;
    transition: margin-left 0.28s;

    &--collapsed {
      margin-left: $sidebar-width-collapsed;
    }

    .fixed-header {
      position: sticky;
      top: 0;
      z-index: 9;
      background-color: var(--app-panel);
      backdrop-filter: blur(14px) saturate(120%);
      border-bottom: 1px solid var(--app-border);
      box-shadow: 0 6px 16px rgba(11, 20, 32, 0.08);
      transition: width 0.28s;
    }
  }
}

:global(html.dark) {
  .layout__sidebar {
    background: linear-gradient(180deg, rgba(8, 16, 28, 0.95) 0%, rgba(10, 18, 31, 0.9) 100%);
    border-right: 1px solid rgba(103, 175, 242, 0.2);
    box-shadow: inset -1px 0 0 rgba(106, 176, 252, 0.12), 10px 0 28px rgba(3, 10, 22, 0.45);
  }

  .layout__main .fixed-header {
    background: rgba(11, 20, 32, 0.72);
    border-bottom-color: rgba(103, 175, 242, 0.16);
    box-shadow: 0 10px 24px rgba(2, 8, 20, 0.36);
  }
}

/* 移动端样式*/
.mobile {
  .layout__sidebar {
    width: $sidebar-width !important;
    transition:
      transform 0.28s,
      width 0s;
  }

  &.hideSidebar {
    .layout__sidebar {
      transform: translateX(-$sidebar-width);
    }
  }

  &.openSidebar {
    .layout__sidebar {
      transform: translateX(0);
    }
  }

  .layout__main {
    margin-left: 0 !important;
  }
}

.hasTagsView {
  :deep(.app-main) {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
