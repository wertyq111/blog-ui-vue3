<template>
  <div class="logo">
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <router-link :key="+collapse" class="wh-full flex-center" to="/">
        <img :src="logo" class="logo-img" />
        <span v-if="!collapse" class="title">
          {{ appConfig.title }}
        </span>
      </router-link>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { appConfig } from "@/settings";
import logo from "@/assets/images/logo.png";

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: var(--navbar-height);
  background-color: transparent;
  border-bottom: 1px solid rgba(122, 161, 38, 0.12);

  .logo-img {
    width: 24px;
    height: 24px;
    filter: drop-shadow(0 4px 10px rgba(130, 201, 30, 0.24));
  }

  .title {
    flex-shrink: 0;
    margin-left: 10px;
    font-size: 18px;
    font-weight: 800;
    color: #2a3529;
    letter-spacing: -0.5px;
  }
}

:global(html.dark) .logo {
  border-bottom-color: rgba(103, 175, 242, 0.16);
  
  .logo-img {
    filter: drop-shadow(0 4px 14px rgba(17, 180, 255, 0.28));
  }

  .title {
    color: #eef6ff;
  }
}
</style>

<style lang="scss">
// 顶部布局和混合布局的特殊处理
.layout-top,
.layout-mix {
  .logo {
    background-color: transparent !important;

    .title {
      color: var(--el-text-color-primary);
    }
  }
}

// 宽屏时：openSidebar 状态下显示完整Logo+文字
.openSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: var(--sidebar-width);
  }
}

// 窄屏时：hideSidebar 状态下只显示Logo图标
.hideSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: var(--sidebar-width-collapsed);
  }

  // 隐藏文字，只显示图标
  .logo .title {
    display: none;
  }
}
</style>
