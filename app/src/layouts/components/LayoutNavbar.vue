<template>
  <div class="navbar">
    <!-- Brand mark — per design spec (leaf icon + "个人博客") -->
    <a class="navbar-brand" href="/#/" title="返回博客首页">
      <div class="navbar-brand__mark">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="#fff"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 21c4 0 8-2 11-7 2-3 3-7 3-11-4 0-8 1-11 4-3 3-5 7-5 12 0 1 0 2 2 2z" />
        </svg>
      </div>
      <span class="navbar-brand__name">个人博客</span>
    </a>

    <!-- Hamburger (menu toggle) -->
    <Hamburger :is-active="isSidebarOpened" @toggle-click="toggleSideBar" />

    <!-- Refresh button -->
    <button class="icon-btn icon-btn-plain" title="刷新" @click="handleRefresh">
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 12a8 8 0 0114-5l3 3M20 12a8 8 0 01-14 5l-3-3" />
        <path d="M17 4v4h-4M7 20v-4h4" />
      </svg>
    </button>

    <!-- Breadcrumb -->
    <Breadcrumb />

    <!-- Spacer -->
    <div class="navbar-spacer" />

    <!-- Right actions -->
    <div class="navbar__actions">
      <LayoutToolbar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import { useRoute, useRouter } from "vue-router";
import { useTagsViewStore } from "@/store";
import Hamburger from "@/components/Hamburger/index.vue";
import Breadcrumb from "@/components/Breadcrumb/index.vue";

const appStore = useAppStore();
const router = useRouter();
const route = useRoute();
const tagsViewStore = useTagsViewStore();

const isSidebarOpened = computed(() => appStore.sidebar.opened);

function toggleSideBar() {
  appStore.toggleSidebar();
}

function handleRefresh() {
  tagsViewStore.delCachedView({
    name: route.name as string,
    title: route.meta?.title || "",
    path: route.path,
    fullPath: route.fullPath,
    affix: false,
    keepAlive: false,
  });
  nextTick(() => {
    router.replace("/redirect" + route.fullPath);
  });
}
</script>

<style lang="scss" scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  height: var(--navbar-height);
  min-width: 0;
  padding: 12px 22px;
  border: 0;
  border-bottom: 2px solid var(--ai-border);
  border-radius: 0;
  // sticky 头部不加 backdrop-filter：正文每次滚动都从它下面经过，合成器每帧重做背景快照
  background: rgba(253, 253, 245, 0.85);
  box-shadow: none;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 200px;
  flex-shrink: 0;
  text-decoration: none;

  &__mark {
    width: 38px;
    height: 38px;
    background: linear-gradient(135deg, var(--ai-primary) 0%, #82d5bb 100%);
    border-radius: 50% 45% 50% 48% / 48% 50% 45% 50%;
    display: grid;
    place-items: center;
    box-shadow: 0 3px 0 0 var(--ai-primary-active);
    color: #fff;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;

    &::after {
      content: "";
      position: absolute;
      top: 5px;
      left: 7px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.55);
    }
  }

  &__name {
    font-size: 16px;
    font-weight: 800;
    color: var(--ai-text);
    letter-spacing: 0.5px;
  }
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--ai-border);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--ai-text);
  box-shadow: 0 2px 0 0 var(--ai-shadow-color);
  transition:
    transform 0.18s,
    box-shadow 0.18s;
  position: relative;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 0 0 var(--ai-shadow-color);
  }
}

.icon-btn-plain {
  background: transparent;
  border: 0;
  box-shadow: none;
  color: var(--ai-text-2);

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: none;
    box-shadow: none;
    color: var(--ai-text);
  }
}

.navbar-spacer {
  flex: 1;
}

.navbar__actions {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 2px;
  color: var(--el-text-color-regular);
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
  color: var(--ai-text-2);
  font-size: 13px;
  font-weight: 700 !important;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--ai-text);
}

:deep(.el-breadcrumb__separator) {
  color: var(--ai-text-3);
}
</style>
