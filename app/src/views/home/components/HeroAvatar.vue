<!-- 首页岛主头像区（头像、名牌、四角 KPI 挂件、叶子装饰） -->
<template>
  <div class="hero-avatar-wrap">
    <!-- 挂角动森树叶装饰 🍃 -->
    <svg class="deco deco-leaf-1" viewBox="0 0 40 40" fill="#8ac68a">
      <path d="M5 35c10 0 20-5 28-13 5-5 7-12 7-22-10 0-17 2-22 7-8 8-13 18-13 28z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M5 35c8-8 16-14 26-20" stroke="#794f27" stroke-width="1.5" fill="none"/>
    </svg>
    <svg class="deco deco-leaf-2" viewBox="0 0 40 40" fill="#d1da49">
      <path d="M35 5c0 10-5 20-13 28-5 5-12 7-22 7 0-10 2-17 7-22 8-8 18-13 28-13z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M35 5c-8 8-16 14-26 20" stroke="#794f27" stroke-width="1.5" fill="none"/>
    </svg>

    <!-- 头像框：徽章以它为定位基准，保证随头像尺寸一起缩放 -->
    <div class="hero-avatar-frame">
      <div class="hero-avatar">
        <img :src="avatarSrc" :alt="nickname" />
      </div>

      <!-- 四角 KPI 挂件 -->
      <div class="hero-badge hero-badge--tl">
        <span class="hero-badge__ico">🎈</span>
        <span class="hero-badge__body">{{ stats.words }}<small>本年字数</small></span>
      </div>
      <div class="hero-badge hero-badge--tr">
        <span class="hero-badge__ico">🦴</span>
        <span class="hero-badge__body">{{ stats.streak }} 天<small>最长连续</small></span>
      </div>
      <div class="hero-badge hero-badge--bl">
        <span class="hero-badge__ico">📝</span>
        <span class="hero-badge__body">{{ stats.logs }} 条<small>累计日志</small></span>
      </div>
      <div class="hero-badge hero-badge--br">
        <span class="hero-badge__ico">⏰</span>
        <span class="hero-badge__body">{{ stats.peak }}<small>高产时段</small></span>
      </div>
    </div>
    <div class="hero-name">🌿 {{ nickname }} · 岛民岛主</div>
  </div>
</template>

<script setup lang="ts">
import type { HomeStats } from "../home-stats";

defineOptions({ name: "HeroAvatar" });

defineProps<{ avatarSrc: string; nickname: string; stats: HomeStats }>();
</script>

<style scoped lang="scss">
.hero-avatar-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

.hero-avatar {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffffff 0%, #fff7e0 100%);
  border: 5px solid var(--ai-outline); // 动森深褐黑相框粗边
  box-shadow:
    0 0 0 4px #eef9d6,
    0 16px 36px rgba(90, 58, 24, 0.14);
  position: relative;
  z-index: 2;
  overflow: hidden;
  display: grid;
  place-items: center;

  img { width: 92%; height: 92%; object-fit: cover; border-radius: 50%; }
}

.hero-avatar-frame {
  position: relative;
  width: min(340px, 75vw);
}

// 四角 KPI 挂件：奶油底 + 棕描边，跟随昼夜 token
.hero-badge {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--ai-btn-face);
  border: 2px solid var(--ai-outline);
  border-radius: 14px;
  box-shadow: 0 3px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
  font-weight: 900;
  font-size: 14px;
  white-space: nowrap;
  animation: hero-badge-bob 3s ease-in-out infinite;
}

.hero-badge__ico {
  font-size: 20px;
  line-height: 1;
}

.hero-badge__body {
  display: flex;
  flex-direction: column;
  line-height: 1.15;

  small {
    font-size: 10px;
    font-weight: 800;
    opacity: 0.7;
  }
}

.hero-badge--tl { top: 2%; left: -10%; animation-duration: 2.8s; }
.hero-badge--tr { top: 8%; right: -10%; animation-duration: 3.2s; animation-delay: 0.4s; }
.hero-badge--bl { bottom: 14%; left: -12%; animation-duration: 3s; animation-delay: 0.9s; }
.hero-badge--br { bottom: 10%; right: -12%; animation-duration: 2.6s; animation-delay: 1.3s; }

@keyframes hero-badge-bob {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }
  50% {
    transform: translateY(-10px) rotate(3deg);
  }
}

// 窄屏：徽章收小，避免超出视口
@media (max-width: 480px) {
  .hero-badge {
    padding: 4px 8px;
    font-size: 12px;
  }

  .hero-badge__ico {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-badge {
    animation: none;
  }
}

.hero-name {
  margin-top: 18px;
  padding: 6px 24px;
  background: var(--ai-btn-face);
  border: 2px.5 solid var(--ai-outline);
  border-radius: 24px 30px 28px 26px / 26px 24px 30px 28px;
  font-weight: 900;
  font-size: 16px;
  color: var(--ai-text);
  box-shadow: 0 4px 0 0 var(--ai-btn-shadow);
}

.deco { position: absolute; }
.deco-leaf-1 { top: -14px; right: -14px; width: 52px; transform: rotate(18deg); z-index: 3; }
.deco-leaf-2 { bottom: -14px; left: -14px; width: 44px; transform: rotate(-18deg); z-index: 3; }
</style>
