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
  height: $navbar-height;
  background-color: var(--app-panel);
  backdrop-filter: blur(14px) saturate(120%);
  border-bottom: 1px solid var(--app-border);
  box-shadow: 0 8px 18px rgba(57, 86, 56, 0.08);

  &__actions {
    display: flex;
    align-items: center;
    height: 100%;
    color: var(--app-text-soft);

    :deep(.navbar-toolbar-icon) {
      color: inherit;
    }
  }
}

:global(html.dark) .navbar {
  background: rgba(12, 20, 33, 0.72);
  border-bottom-color: rgba(103, 175, 242, 0.16);
  box-shadow: 0 10px 24px rgba(2, 8, 20, 0.34);
}
</style>
