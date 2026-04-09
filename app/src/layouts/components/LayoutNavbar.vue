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
  background: rgba(255, 255, 255, 0.56);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-right: 18px;

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
        background: rgba(122, 161, 38, 0.12);
        color: var(--el-color-primary);
      }
    }
  }
}

:global(html.dark) .navbar {
  background: rgba(12, 20, 33, 0.72);
  border-bottom-color: rgba(103, 175, 242, 0.16);
  box-shadow: 0 10px 24px rgba(2, 8, 20, 0.34);
  
  &__actions {
    color: rgba(202, 224, 248, 0.78);
    
    :deep(.toolbar-item:hover) {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
  }
}
</style>
