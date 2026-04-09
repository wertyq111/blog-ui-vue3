<template>
  <div class="navbar">
    <div class="flex-y-center">
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
  padding: 0 20px 0 12px;
  border-radius: var(--cyber-shell-radius);
  background: var(--cyber-panel-shell);
  border: 1px solid var(--cyber-border-strong);
  box-shadow: var(--cyber-shadow);
  backdrop-filter: blur(18px);

  &__actions {
    display: flex;
    align-items: center;
    height: 100%;
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
}
</style>
