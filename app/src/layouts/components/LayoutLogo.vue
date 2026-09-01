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

<script setup lang="ts">
import { appConfig } from "@/settings";
import logo from "@/assets/images/logo-leaf.svg";

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
  border-bottom: 1px solid color-mix(in srgb, var(--cyber-border) 72%, transparent);

  a {
    justify-content: flex-start;
    padding: 0 20px;
  }

  .logo-img {
    width: 22px;
    height: 22px;
    color: var(--cyber-primary);
    filter: none;
  }

  .title {
    flex-shrink: 0;
    margin-left: 9px;
    font-size: 14px;
    font-weight: 800;
    color: var(--cyber-text);
    letter-spacing: 0;
  }
}
</style>

<style lang="scss">
// 顶部布局和混合布局的特殊处理
.layout-top,
.layout-mix {
  .logo {
    background-color: transparent !important;
    border-bottom: none;

    .title {
      color: var(--cyber-text);
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
