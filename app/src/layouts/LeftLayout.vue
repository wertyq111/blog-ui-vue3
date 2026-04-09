<template>
  <BaseLayout>
    <!-- 左侧菜单 -->
    <div class="layout__sidebar" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
      <div class="layout-sidebar">
        <div class="layout-sidebar__shell">
          <div
            v-if="showLogo"
            class="layout-sidebar__brand"
            :class="{ 'layout-sidebar__brand--collapsed': !isSidebarOpen }"
          >
            <LayoutLogo :collapse="!isSidebarOpen" />
          </div>
          <el-scrollbar class="layout-sidebar__scroll">
            <LayoutSidebar :data="routes" base-path="" />
          </el-scrollbar>
        </div>
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
    z-index: 1001;
    width: calc(#{$sidebar-width} + #{$layout-shell-gap});
    background: transparent;
    transition: width 0.28s;

    &--collapsed {
      width: calc(#{$sidebar-width-collapsed} + #{$layout-shell-gap});

      .layout-sidebar {
        padding-left: 12px;
        padding-right: $layout-shell-gap;

        &__shell {
          padding-left: 8px;
          padding-right: 8px;
        }
      }
    }

    .layout-sidebar {
      position: relative;
      height: 100%;
      background-color: transparent;
      transition: width 0.28s;
      padding: 20px $layout-shell-gap 20px 20px;

      &__shell {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 18px 14px 16px;
        background: var(--cyber-sidebar-shell);
        border: 1px solid var(--cyber-sidebar-border);
        border-radius: 30px;
        box-shadow:
          inset -1px 0 0 rgba(255, 255, 255, 0.04),
          20px 0 42px rgba(2, 7, 17, 0.24);
        overflow: hidden;
      }

      &__brand {
        flex-shrink: 0;
        padding: 0 2px 16px;

        :deep(.logo) {
          height: 52px;
          border-bottom: none;
          border-radius: 20px;
          background: color-mix(in srgb, var(--cyber-panel-strong) 80%, transparent);
          border: 1px solid color-mix(in srgb, var(--cyber-border) 75%, transparent);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        :deep(.logo a) {
          justify-content: flex-start;
          padding: 0 18px;
        }
      }

      &__brand--collapsed {
        :deep(.logo a) {
          justify-content: center;
          padding: 0;
        }
      }

      &__scroll {
        flex: 1;
        min-height: 0;

        :deep(.el-scrollbar__view) {
          height: 100%;
        }

        :deep(.sidebar-wrapper) {
          height: 100%;
          margin: 0;
          background: transparent;
          border: none;
          box-shadow: none;
          backdrop-filter: none;
          border-radius: 0;
        }

        :deep(.el-menu) {
          border: none;
        }
      }
    }
  }

  &__main {
    position: relative;
    height: 100%;
    margin-left: calc(#{$sidebar-width} + #{$layout-shell-gap});
    overflow-y: auto;
    background-color: transparent;
    transition: margin-left 0.28s;

    &--collapsed {
      margin-left: calc(#{$sidebar-width-collapsed} + #{$layout-shell-gap});
    }

    .fixed-header {
      position: sticky;
      top: 0;
      z-index: 9;
      background: transparent;
      backdrop-filter: none;
      border-bottom: none;
      box-shadow: none;
      transition: width 0.28s;
    }
  }
}

/* 移动端样式*/
.mobile {
  .layout__sidebar {
    width: calc(#{$sidebar-width} + #{$layout-shell-gap}) !important;
    transition:
      transform 0.28s,
      width 0s;
  }

  &.hideSidebar {
    .layout__sidebar {
      transform: translateX(calc(-1 * (#{$sidebar-width} + #{$layout-shell-gap})));
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
