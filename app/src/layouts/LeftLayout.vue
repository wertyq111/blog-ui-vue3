<template>
  <BaseLayout>
    <!-- Ambient floating clouds (per design spec) -->
    <svg class="amb amb-cloud-1" viewBox="0 0 100 50" fill="#fff" aria-hidden="true">
      <ellipse cx="30" cy="28" rx="28" ry="16" />
      <ellipse cx="62" cy="22" rx="24" ry="16" />
      <ellipse cx="82" cy="32" rx="14" ry="10" />
    </svg>
    <svg class="amb amb-cloud-2" viewBox="0 0 80 40" fill="#fff" aria-hidden="true">
      <ellipse cx="22" cy="22" rx="20" ry="11" />
      <ellipse cx="50" cy="18" rx="20" ry="12" />
      <ellipse cx="68" cy="26" rx="10" ry="8" />
    </svg>
    <div class="amb amb-leaf-bg" aria-hidden="true" />

    <!-- 顶栏（整宽置顶，覆盖侧栏列） -->
    <LayoutNavbar />

    <!-- 顶栏下方：左侧木板菜单 + 主内容区 -->
    <div class="layout__body">
      <!-- 左侧木板菜单 -->
      <aside class="layout__sidebar" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
        <!-- Island menu golden tag (brand moved to topbar per design spec) -->
        <div v-if="isSidebarOpen" class="layout-sidebar__island-tag">
          ISLAND
          <span class="layout-sidebar__island-tag-sm">·MENU</span>
        </div>

        <el-scrollbar class="layout-sidebar__scroll">
          <LayoutSidebar :data="routes" base-path="" />
        </el-scrollbar>

        <!-- Grass hills decoration -->
        <div class="layout-sidebar__grass" aria-hidden="true">
          <svg viewBox="0 0 240 96" preserveAspectRatio="none" style="width: 100%; height: 100%">
            <path
              d="M0 96 Q 30 60 60 80 Q 90 50 120 78 Q 150 55 180 78 Q 210 60 240 90 L 240 96 Z"
              fill="#7cba70"
              opacity="0.35"
            />
            <path
              d="M0 96 Q 40 80 80 90 Q 120 78 160 92 Q 200 84 240 96 L 240 96 Z"
              fill="#4a8a36"
              opacity="0.3"
            />
          </svg>
        </div>

        <!-- Mascot peeking from bottom -->
        <svg
          v-if="isSidebarOpen"
          class="layout-sidebar__mascot"
          viewBox="0 0 56 56"
          aria-hidden="true"
        >
          <ellipse cx="28" cy="44" rx="22" ry="6" fill="#5a3a18" opacity="0.12" />
          <path
            d="M10 38 Q10 18 28 18 Q46 18 46 38 L46 50 L10 50 Z"
            fill="url(#mascotGrad)"
            stroke="#4a8a36"
            stroke-width="1.6"
          />
          <defs>
            <linearGradient id="mascotGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#a3d678" />
              <stop offset="1" stop-color="#6fb14a" />
            </linearGradient>
          </defs>
          <ellipse cx="22" cy="28" rx="3" ry="3.5" fill="#fff" />
          <ellipse cx="34" cy="28" rx="3" ry="3.5" fill="#fff" />
          <circle cx="23" cy="29" r="1.4" fill="#25292f" />
          <circle cx="35" cy="29" r="1.4" fill="#25292f" />
          <path
            d="M24 34 q 4 3 8 0"
            stroke="#3a2410"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
          />
          <path
            d="M28 16c-1-3-4-5-8-3 0 4 3 6 8 3z"
            fill="#7cba70"
            stroke="#4a8a36"
            stroke-width="1.2"
          />
          <path
            d="M28 16c1-3 4-5 8-3 0 4-3 6-8 3z"
            fill="#7cba70"
            stroke="#4a8a36"
            stroke-width="1.2"
          />
        </svg>
      </aside>

      <!-- 主内容区 -->
      <div class="layout__main" :class="{ hasTagsView: showTagsView }">
        <LayoutTagsView v-if="showTagsView" />
        <LayoutMain />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useLayout } from "./useLayout";
import BaseLayout from "./BaseLayout.vue";
import LayoutNavbar from "./components/LayoutNavbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";

const { showTagsView, isSidebarOpen, routes } = useLayout();
</script>

<style lang="scss" scoped>
// 顶栏下方的主体：侧栏 + 主区，横向并排
.layout__body {
  display: flex;
  height: calc(100vh - #{$navbar-height});
}

.layout__sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 230px;
  height: 100%;
  padding: 16px 12px 100px;
  overflow: hidden;
  background:
    repeating-linear-gradient(
      180deg,
      rgba(216, 236, 198, 0.4) 0 36px,
      rgba(232, 244, 210, 0.4) 36px 72px
    ),
    rgba(248, 250, 230, 0.6);
  backdrop-filter: blur(8px);
  border-right: 2px solid var(--cyber-sidebar-border);
  transition: width 0.28s;

  &--collapsed {
    width: calc(#{$sidebar-width-collapsed} + 8px);
    padding: 14px 8px 100px;
  }
}

.layout__main {
  flex: 1;
  min-width: 0;
  height: 100%;
  background-color: transparent;
  margin-left: 20px;
}

/* 移动端：侧栏变为覆盖抽屉 */
.mobile {
  .layout__sidebar {
    position: fixed;
    top: $navbar-height;
    left: 0;
    bottom: 0;
    z-index: 1001;
    width: 230px !important;
    height: auto;
    padding: 16px 12px 100px;
    transition: transform 0.28s;
  }

  &.hideSidebar .layout__sidebar {
    transform: translateX(-100%);
  }

  &.openSidebar .layout__sidebar {
    transform: translateX(0);
  }

  .layout__main {
    width: 100%;
  }
}

.layout-sidebar {
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

  &__island-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px;
    padding: 8px 12px;
    background: linear-gradient(180deg, #fff7d6 0%, #f7e7a3 100%);
    border: 2px solid #d4ad6b;
    border-radius: 10px;
    box-shadow:
      0 2px 0 0 #b88e2a,
      inset 0 0 0 1px rgba(255, 255, 255, 0.42);
    color: #5a3a18;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 3px;
    line-height: 1;

    &::before {
      content: "🌿";
      font-size: 13px;
      letter-spacing: 0;
    }
  }

  &__island-tag-sm {
    color: #8a6a3a;
    font-size: 9px;
    letter-spacing: 2px;
  }

  &__grass {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 76px;
    pointer-events: none;
  }

  &__mascot {
    position: absolute;
    bottom: 9px;
    left: 50%;
    width: 42px;
    height: 42px;
    transform: translateX(-50%);
    pointer-events: none;
  }
}

.hasTagsView {
  :deep(.app-main) {
    height: calc(100vh - #{$navbar-height} - #{$tags-view-height}) !important;
  }
}

// Ambient floating clouds — per design spec
.amb {
  position: fixed;
  pointer-events: none;
  z-index: 0;
}

.amb-cloud-1 {
  top: 80px;
  left: 26%;
  width: 90px;
  opacity: 0.55;
  animation: amb-drift 40s ease-in-out infinite;
}

.amb-cloud-2 {
  top: 140px;
  right: 18%;
  width: 70px;
  opacity: 0.45;
  animation: amb-drift 30s ease-in-out infinite reverse;
}

@keyframes amb-drift {
  0%,
  100% {
    transform: translateX(-300px);
  }
  50% {
    transform: translateX(60px);
  }
}

.amb-leaf-bg {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 280px;
  height: 280px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M90 10c0 40-30 80-80 80 0-50 40-80 80-80z" fill="%237cba70" opacity="0.06"/></svg>')
    no-repeat;
  background-size: contain;
  pointer-events: none;
  z-index: 0;
}
</style>
