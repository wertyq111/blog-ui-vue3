<!-- 首页已登录 hero -->
<template>
  <section id="hero" class="hero">
    <div class="hero-grid">
      <div class="hero-text">
        <span class="hero-tag">
          <span class="hero-tag-dot"></span>
          WELCOME · 博客小岛
        </span>
        <HeroSign />
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
          <button type="button" class="btn-ai btn-ai-lg" @click="introVisible = true">
            <span class="btn-ai-finger"></span>
            <span class="btn-ai-text">🎬 《Check It Off!》</span>
          </button>
        </div>
      </div>

      <HeroAvatar :avatar-src="avatarSrc" :nickname="nickname" :stats="stats" />
    </div>

    <AdminAnimalModal
      v-model:visible="introVisible"
      title="《Check It Off!》"
      width="min(92vw, 1000px)"
      :show-footer="false"
    >
      <video
        class="intro-video"
        src="/home/island-intro.mp4"
        poster="/home/island-intro-poster.jpg"
        controls
        autoplay
        playsinline
      ></video>
    </AdminAnimalModal>
  </section>
</template>

<script setup lang="ts">
import HeroSign from "./HeroSign.vue";
import HeroAvatar from "./HeroAvatar.vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import type { HomeStats } from "../home-stats";

defineOptions({ name: "HeroIsland" });

defineProps<{ avatarSrc: string; nickname: string; stats: HomeStats }>();

const introVisible = ref(false);
</script>

<style scoped lang="scss">
@use "../styles/shared";
@use "../styles/hero";

// 介绍视频为 16:9 横版，宽度受视口高度约束，避免弹窗内容区出现滚动条
.intro-video {
  display: block;
  width: min(100%, calc(52vh * 16 / 9));
  height: auto;
  aspect-ratio: 16 / 9;
  margin: 0 auto;
  background: #fef8e6;
  border-radius: 12px;
}
</style>
