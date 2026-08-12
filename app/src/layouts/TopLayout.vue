<template>
  <BaseLayout>
    <!-- 顶部菜单-->
    <div class="layout__header">
      <div class="layout__header-left">
        <div v-if="showLogo" class="layout__header-logo">
          <LayoutLogo :collapse="isLogoCollapsed" />
        </div>
        <div class="layout__header-menu">
          <LayoutSidebar :data="topMenuItems" menu-mode="horizontal" base-path="" />
        </div>
      </div>
      <div class="layout__header-right">
        <LayoutToolbar />
      </div>
    </div>

    <!-- 主内容区 -->
    <div :class="{ hasTagsView: showTagsView }" class="layout__main">
      <LayoutTagsView v-if="showTagsView" />
      <LayoutMain />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "./useLayout";
import { usePermissionStore } from "@/store";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";
import LayoutToolbar from "./components/LayoutToolbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";

const { showTagsView, showLogo } = useLayout();
const { width } = useWindowSize();

const permissionStore = usePermissionStore();

const topMenuItems = computed(() => {
  return permissionStore.routes.filter((item) => !item.meta?.hidden);
});

const isLogoCollapsed = computed(() => width.value < 768);
</script>

<style lang="scss" scoped>
.layout {
  &__header {
    position: sticky;
    top: 18px;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: $navbar-height;
    padding: 0 22px;
    border-radius: var(--cyber-shell-radius);
    background: var(--cyber-panel-shell);
    border: 1px solid var(--cyber-border-strong);
    box-shadow: var(--cyber-shadow);

    &-left {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      height: 100%;
    }

    &-logo {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      height: 100%;

      :deep(.logo) {
        height: $navbar-height;
      }
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
        flex: 1;
        min-width: 0;
        height: 100%;
        overflow: hidden;
        line-height: 38px;
        background-color: transparent;
        border: none;

        .el-menu-item {
          display: inline-flex;
          align-items: center;
          height: 38px;
          line-height: 38px;
          color: var(--cyber-text-soft);
          border-bottom: none;
          border-radius: 999px;

          &.is-active {
            color: var(--cyber-sidebar-active-text);
            background: var(--cyber-sidebar-active-bg);
            box-shadow: var(--cyber-sidebar-active-shadow);
          }
        }

        .el-sub-menu {
          .el-sub-menu__title {
            height: 38px;
            line-height: 38px;
            color: var(--cyber-text-soft);
            border-radius: 999px;
          }

          &.has-active-child {
            .el-sub-menu__title {
              color: var(--cyber-sidebar-active-text) !important;
              background: var(--cyber-sidebar-active-bg) !important;
              box-shadow: var(--cyber-sidebar-active-shadow);

              .menu-icon {
                color: currentcolor !important;
              }
            }
          }
        }

        .el-menu--popup {
          min-width: 160px;
        }
      }
    }

    &-right {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      height: 100%;
      padding-left: 18px;
    }
  }

  &__main {
    height: auto;
    overflow-y: auto;
  }
}

.hasTagsView {
  :deep(.app-main) {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
