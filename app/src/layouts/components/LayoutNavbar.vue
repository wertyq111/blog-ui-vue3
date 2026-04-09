<template>
  <div class="navbar">
    <div class="navbar__leading">
      <!-- 菜单折叠按钮 -->
      <Hamburger :is-active="isSidebarOpened" @toggle-click="toggleSideBar" />
      <!-- 面包屑导行栏-->
      <Breadcrumb />
    </div>
    <!-- 导航栏操作区域-->
    <div class="navbar__actions">
      <LayoutToolbar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import Hamburger from "@/components/Hamburger/index.vue";
import Breadcrumb from "@/components/Breadcrumb/index.vue";

const appStore = useAppStore();

const isSidebarOpened = computed(() => appStore.sidebar.opened);

function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--navbar-height);
  min-width: 0;
  padding: 0 18px 0 14px;
  border-radius: 30px;
  background: var(--cyber-panel-shell);
  border: 1px solid var(--cyber-border-strong);
  box-shadow: var(--cyber-shadow);
  backdrop-filter: blur(18px);

  &__leading {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex: 1;
  }

  &__actions {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 4px;
    padding-left: 12px;
    color: var(--el-text-color-regular);

    :deep(.toolbar-item) {
      margin: 0 4px;
      padding: 0 8px;
      height: 36px;
      min-width: 36px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: var(--cyber-header-tool-hover-bg);
        color: var(--cyber-header-tool-hover-text);
      }
    }
  }

  :deep(.el-breadcrumb) {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
  }

  :deep(.el-breadcrumb__item) {
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-breadcrumb__inner),
  :deep(.el-breadcrumb__inner a) {
    color: var(--cyber-text-soft);
    font-size: 13px;
    font-weight: 500 !important;
  }

  :deep(.el-breadcrumb__separator) {
    color: color-mix(in srgb, var(--cyber-text-soft) 52%, transparent);
  }
}
</style>
