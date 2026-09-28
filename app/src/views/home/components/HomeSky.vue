<!-- 首页天空层 -->
<template>
  <div class="home-sky" :class="{ 'home-sky--video': videoActive }">
    <div class="sky">
      <!-- 一日推移背景视频：从不 play，只按滚动进度 seek（见 ScrubVideoBackground） -->
      <ScrubVideoBackground
        v-model:active="videoActive"
        src="/home/day-cycle.mp4"
        poster="/home/day-cycle-poster.jpg"
        :time="videoTime"
      />

      <!-- 繁星点缀仅在夜间展示 -->
      <div v-if="period === 'night'" class="starry-night-stars">
        <span class="star star--1">✦</span>
        <span class="star star--2">✦</span>
        <span class="star star--3">✦</span>
        <span class="star star--4">✦</span>
        <span class="star star--5">✦</span>
        <span class="star star--6">✦</span>
      </div>

      <!-- 夜景层：月亮 + 萤火虫，仅夜间渲染 -->
      <div v-if="period === 'night'" class="night-scene">
        <div class="night-moon">
          <span class="night-moon__crater night-moon__crater--1"></span>
          <span class="night-moon__crater night-moon__crater--2"></span>
          <span class="night-moon__crater night-moon__crater--3"></span>
        </div>
        <span class="night-firefly night-firefly--1"></span>
        <span class="night-firefly night-firefly--2"></span>
        <span class="night-firefly night-firefly--3"></span>
        <span class="night-firefly night-firefly--4"></span>
        <span class="night-shooting-star"></span>
      </div>
    </div>

    <!-- 漂浮的白云 -->
    <svg class="cloud cloud-1" viewBox="0 0 140 70">
      <ellipse cx="40" cy="45" rx="40" ry="22"/><ellipse cx="80" cy="35" rx="35" ry="22"/><ellipse cx="115" cy="48" rx="22" ry="16"/>
    </svg>
    <svg class="cloud cloud-2" viewBox="0 0 100 50">
      <ellipse cx="30" cy="30" rx="28" ry="16"/><ellipse cx="65" cy="22" rx="24" ry="16"/><ellipse cx="85" cy="34" rx="14" ry="11"/>
    </svg>
    <svg class="cloud cloud-3" viewBox="0 0 80 40">
      <ellipse cx="22" cy="22" rx="22" ry="12"/><ellipse cx="52" cy="18" rx="20" ry="13"/><ellipse cx="70" cy="26" rx="10" ry="8"/>
    </svg>

    <!-- 飘落的绿叶和樱花装饰 -->
    <div class="falling-particles">
      <span class="particle particle--leaf-1">🍃</span>
      <span class="particle particle--flower-1">🌸</span>
      <span class="particle particle--leaf-2">🍃</span>
      <span class="particle particle--flower-2">🌸</span>
      <span class="particle particle--leaf-3">🍁</span>
    </div>

    <!-- 3D 拟物立体双层山坡草地装饰 -->
    <div class="grass-hills">
      <div class="grass-hill grass-hill--back"></div>
      <div class="grass-hill grass-hill--front"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ScrubVideoBackground from "@/components/ScrubVideoBackground/index.vue";
import type { TimePeriod } from "../day-cycle";

defineOptions({ name: "HomeSky" });

defineProps<{ period: TimePeriod; videoTime: number }>();
const videoActive = defineModel<boolean>("videoActive", { required: true });
</script>

<style scoped lang="scss">
// 包裹层不产生盒子，天空、云、粒子、草坡的定位与层叠和拆分前一致
.home-sky {
  display: contents;
}

.home-page--morning .sky {
  background: radial-gradient(1000px 500px at 70% 0%, rgba(254, 219, 178, 0.4) 0%, transparent 60%);
}

.home-page--afternoon .sky {
  background: radial-gradient(1000px 500px at 80% 0%, rgba(25, 200, 185, 0.08) 0%, transparent 60%);
}

.home-page--sunset .sky {
  background: radial-gradient(1100px 600px at 80% 10%, rgba(252, 115, 109, 0.3) 0%, transparent 60%);
}

.home-page--night .sky {
  background: radial-gradient(1000px 500px at 20% 0%, rgba(136, 157, 240, 0.15) 0%, transparent 60%);
}

// 慢动天空层
.sky {
  position: fixed;
  inset: 0;
  z-index: -2;
  transition: all 1.5s ease;
}

// ::after 不加 position 会当行内内容绘制、排在 absolute 的视频下面，必须显式定位。
.home-sky--video .sky::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--home-video-veil);
}

// 视频接管后，云 / 草坡 / 飘落粒子 / 夜景层这些 CSS 替身全部撤掉——
// 视频画面里本来就有，叠着会重影。display:none 同时也停掉它们的动画。
.home-sky--video {
  .cloud,
  .grass-hills,
  .falling-particles,
  .starry-night-stars,
  .night-scene {
    display: none;
  }
}

// 夜空闪烁的繁星
// ============================================
// 夜景层（月亮 / 萤火虫），仅 period === "night" 时渲染。
// 走 v-if 而非 opacity 开关：昼间零 DOM、零动画、零合成层。
// 缓动取自 Emil Kowalski 的标准曲线，不用内置 ease-out（太弱）。
// ============================================
.night-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.night-moon {
  position: absolute;
  top: 10%;
  right: 9%;
  width: 96px;
  height: 96px;
  background: radial-gradient(circle at 34% 32%, #fff8dc 0%, #ffe9a8 52%, #f4d489 100%);
  border-radius: 50%;
  box-shadow:
    0 0 0 12px rgba(255, 233, 168, 0.1),
    0 0 70px 22px rgba(255, 233, 168, 0.22);
  animation: night-moonrise 2.4s cubic-bezier(0.23, 1, 0.32, 1) both;

  &__crater {
    position: absolute;
    background: rgba(200, 170, 110, 0.32);
    border-radius: 50%;

    &--1 {
      top: 26px;
      left: 22px;
      width: 16px;
      height: 16px;
    }

    &--2 {
      top: 54px;
      left: 46px;
      width: 11px;
      height: 11px;
      opacity: 0.85;
    }

    &--3 {
      top: 34px;
      left: 58px;
      width: 8px;
      height: 8px;
      opacity: 0.7;
    }
  }
}

.night-firefly {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ffe9a8;
  border-radius: 50%;
  box-shadow: 0 0 12px 4px rgba(255, 233, 168, 0.5);
  animation: night-firefly-drift 10s cubic-bezier(0.77, 0, 0.175, 1) infinite;

  &--1 {
    bottom: 22%;
    left: 14%;
    width: 7px;
    height: 7px;
    animation-duration: 9s;
  }

  &--2 {
    bottom: 16%;
    left: 34%;
    width: 5px;
    height: 5px;
    animation-duration: 11s;
    animation-delay: 1.5s;
  }

  &--3 {
    bottom: 28%;
    left: 58%;
    animation-duration: 10s;
    animation-delay: 0.8s;
  }

  &--4 {
    bottom: 19%;
    left: 74%;
    width: 5px;
    height: 5px;
    animation-duration: 12s;
    animation-delay: 2.2s;
  }
}

// 流星：22s 一次，实际掠过只占 0.7s（3.2%），其余时间靠关键帧停在终点透明处充当间隔。
// 用 linear —— 流星是匀速掠过，且 ease-in 会让它「起步慢」，正好错过用户在看的那一瞬。
.night-shooting-star {
  position: absolute;
  top: 6%;
  right: 26%;
  width: 64px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fffdec);
  border-radius: 2px;
  opacity: 0;
  animation: night-shoot 22s linear 4s infinite;
}

@keyframes night-shoot {
  0% {
    opacity: 0;
    transform: translate(0, 0) rotate(28deg);
  }

  0.5% {
    opacity: 1;
  }

  3.2% {
    opacity: 0;
    transform: translate(-360px, 220px) rotate(28deg);
  }

  100% {
    opacity: 0;
    transform: translate(-360px, 220px) rotate(28deg);
  }
}

@keyframes night-moonrise {
  from {
    opacity: 0;
    transform: translateY(34px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 关键帧名与 .night-firefly 类名刻意错开，避免读代码时把两者当成一个东西
@keyframes night-firefly-drift {
  0% {
    opacity: 0.15;
    transform: translate(0, 0);
  }

  25% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
    transform: translate(60px, -38px);
  }

  75% {
    opacity: 1;
  }

  100% {
    opacity: 0.15;
    transform: translate(0, 0);
  }
}

// 无障碍：前庭敏感用户去掉位移，保留静态存在感（gentler，不是 zero）
@media (prefers-reduced-motion: reduce) {
  .night-moon {
    transform: none;
    animation: night-moon-fade 0.2s ease both;
  }

  .night-firefly {
    opacity: 0.6;
    animation: none;
  }

  // 流星没有「更温和的版本」——静止的白杠是视觉垃圾，直接隐藏才对
  .night-shooting-star {
    opacity: 0;
    animation: none;
  }

  @keyframes night-moon-fade {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
}

.starry-night-stars {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  color: #fff;
  opacity: 0.8;
  font-size: 14px;
  animation: ac-star-blink 3s infinite alternate;

  &--1 { top: 12%; left: 15%; animation-duration: 2.2s; }
  &--2 { top: 8%; left: 45%; animation-duration: 3.5s; animation-delay: 0.5s; }
  &--3 { top: 18%; right: 18%; animation-duration: 2.8s; animation-delay: 1.2s; }
  &--4 { top: 32%; left: 30%; animation-duration: 4.1s; }
  &--5 { top: 25%; right: 40%; animation-duration: 3.1s; animation-delay: 0.8s; }
  &--6 { top: 40%; right: 12%; animation-duration: 2.5s; }
}

@keyframes ac-star-blink {
  0% { opacity: 0.1; transform: scale(0.7) rotate(0deg); }
  100% { opacity: 0.9; transform: scale(1.1) rotate(15deg); }
}

// Cloud漂移
.cloud {
  position: fixed;
  z-index: -1;
  pointer-events: none;
  opacity: 0.8;
  filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.03));
  fill: var(--home-cloud-fill);
}

.cloud-1 { top: 8%; left: 6%; width: 130px; animation: ac-cloud-float 50s linear infinite; }
.cloud-2 { top: 15%; right: 8%; width: 100px; animation: ac-cloud-float-rev 60s linear infinite; }
.cloud-3 { top: 30%; left: 12%; width: 85px; animation: ac-cloud-float 55s linear infinite 5s; }

@keyframes ac-cloud-float {
  0% { transform: translateX(-120px); }
  100% { transform: translateX(100vw); }
}

@keyframes ac-cloud-float-rev {
  0% { transform: translateX(120px); }
  100% { transform: translateX(-100vw); }
}

// 飘落花叶粒子层
.falling-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  font-size: 16px;
  opacity: var(--home-particle-op);
  animation: ac-particle-fall 14s linear infinite;

  &--leaf-1 { left: 5%; top: -5%; animation-duration: 10s; }
  &--flower-1 { left: 22%; top: -5%; animation-duration: 13s; animation-delay: 2s; }
  &--leaf-2 { left: 45%; top: -5%; animation-duration: 11s; animation-delay: 0.5s; }
  &--flower-2 { left: 70%; top: -5%; animation-duration: 14s; animation-delay: 3s; }
  &--leaf-3 { left: 88%; top: -5%; animation-duration: 12s; }
}

@keyframes ac-particle-fall {
  0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateY(110vh) rotate(360deg) translateX(70px); opacity: 0; }
}

// ============================================
// 2. 裸眼 3D 立体波浪双层草坡 (Hills Overlay)
// ============================================
.grass-hills {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 240px;
  z-index: -1;
  pointer-events: none;
  // 两层山丘 width:120% / left:-8%~-10%，右端伸出视口 154px 会撑出横向滚动条；
  // 视觉上本就该被视口切掉，这里直接裁掉（同 .ac404__sky 的处理）
  overflow: hidden;
}

.grass-hill {
  position: absolute;
  bottom: -40px;
  width: 120%;
  height: 200px;
  border-radius: 50%;
  
  &--back {
    left: -10%;
    background: var(--home-hill-back);
    opacity: var(--home-hill-back-op);
    animation: ac-hill-wave 16s ease-in-out infinite alternate;
  }

  &--front {
    left: -8%;
    background: var(--home-hill-front);
    opacity: var(--home-hill-front-op);
    height: 170px;
    animation: ac-hill-wave-rev 12s ease-in-out infinite alternate;
  }
}

@keyframes ac-hill-wave {
  0% { transform: translate(0, 0) scaleY(1); }
  100% { transform: translate(-30px, 8px) scaleY(1.05); }
}

@keyframes ac-hill-wave-rev {
  0% { transform: translate(0, 0) scaleY(1); }
  100% { transform: translate(25px, -6px) scaleY(0.96); }
}

</style>
