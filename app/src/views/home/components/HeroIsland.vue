<!-- 首页已登录 hero -->
<template>
  <section id="hero" class="hero">
    <div class="hero-grid">
      <div class="hero-text">
        <span class="hero-tag">
          <span class="hero-tag-dot"></span>
          WELCOME · 博客小岛
        </span>
        <div class="hero-title-row">
          <h1 class="hero-title">
            博客<br/>小岛.
          </h1>
        </div>
        <p class="hero-sub">
          记录开发日常、沉淀项目文档、管理平台来源与工具配置。<br />
          这里是 <b>{{ nickname }}</b> 的小岛 —— 收集本周的灵感、整理项目的航向，也保留一些悠闲发呆的余地。
        </p>
        <div class="hero-actions">
          <router-link class="btn-ai btn-ai-primary btn-ai-lg" to="/dashboard">
            <span class="btn-ai-finger"></span>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="btn-arrow-ico"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
            <span class="btn-ai-text">进入工作台</span>
          </router-link>
        </div>
      </div>

      <HeroAvatar
        :avatar-src="avatarSrc"
        :nickname="nickname"
        :stat-words="statWords"
        :stat-streak="statStreak"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import HeroAvatar from "./HeroAvatar.vue";

defineOptions({ name: "HeroIsland" });

defineProps<{ avatarSrc: string; nickname: string; statWords: string; statStreak: string }>();
</script>

<style scoped lang="scss">
@use "../styles/shared";
@use "../styles/hero";
</style>
