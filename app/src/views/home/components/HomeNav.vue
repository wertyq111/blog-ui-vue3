<!-- 首页导航栏 -->
<template>
  <nav class="nav">
    <div class="brand">
      <div class="brand-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21c4 0 8-2 11-7 2-3 3-7 3-11-4 0-8 1-11 4-3 3-5 7-5 12 0 1 0 2 2 2z"/>
        </svg>
      </div>
      <span class="brand-text">{{ brandName }}</span>
    </div>
    <div class="nav-links">
      <a class="nav-link nav-link-active" href="javascript:void(0)" @click="scrollToSection('hero')">
        <span class="nav-link-finger"></span>
        <span class="nav-link-text">概览</span>
      </a>
      <a class="nav-link" href="javascript:void(0)" @click="scrollToSection('modules')">
        <span class="nav-link-finger"></span>
        <span class="nav-link-text">模块</span>
      </a>
      <a class="nav-link" href="javascript:void(0)" @click="scrollToSection('about')">
        <span class="nav-link-finger"></span>
        <span class="nav-link-text">关于</span>
      </a>
    </div>
    <div class="nav-spacer"></div>
    
    <!-- 动态本地时钟小挂件 -->
    <div class="nav-clock" :title="'当前时段: ' + periodName">
      <span class="clock-icon">{{ periodIcon }}</span>
      <span class="clock-text">{{ clock }}</span>
    </div>

    <!-- 昼夜开关：手动覆盖时段，刷新后回到跟随本机时间 -->
    <button
      type="button"
      class="nav-daynight"
      :class="{ 'nav-daynight--on': isNight }"
      :title="dayNightTitle"
      :aria-pressed="isNight"
      aria-label="昼夜切换"
      @click="emit('toggle-day-night')"
    >
      <span class="nav-daynight__knob">
        <span class="nav-daynight__glyph">
          <svg v-if="isNight" class="glyph-moon" viewBox="0 0 24 24" fill="currentColor">
            <path
              class="moon-body"
              d="M14 3.5C9.86 3.5 6.5 6.86 6.5 11c0 4.14 3.36 7.5 7.5 7.5 1.7 0 3.26-.57 4.53-1.53-3.23-.48-5.71-3.23-5.71-6.62 0-3.39 2.48-6.14 5.71-6.62C17.26 4.07 15.7 3.5 14 3.5z"
            />
            <path
              class="moon-star"
              d="M19 7c0-.9.7-1.6 1.6-1.6-.9 0-1.6-.7-1.6-1.6 0 .9-.7 1.6-1.6 1.6.9 0 1.6.7 1.6 1.6z"
            />
          </svg>
          <svg v-else class="glyph-sun" viewBox="0 0 24 24" fill="currentColor">
            <g class="sun-rays">
              <circle cx="12" cy="2.5" r="1.5" />
              <circle cx="12" cy="21.5" r="1.5" />
              <circle cx="2.5" cy="12" r="1.5" />
              <circle cx="21.5" cy="12" r="1.5" />
              <circle cx="5.28" cy="5.28" r="1.5" />
              <circle cx="18.72" cy="18.72" r="1.5" />
              <circle cx="5.28" cy="18.72" r="1.5" />
              <circle cx="18.72" cy="5.28" r="1.5" />
            </g>
            <circle class="sun-core" cx="12" cy="12" r="5" />
          </svg>
        </span>
      </span>
    </button>

    <router-link v-if="!loggedIn" class="btn-ai btn-ai-sm btn-ai-primary" to="/login">
      <span class="btn-ai-finger"></span>
      <span class="btn-ai-text">办理登岛手续 ✈️</span>
    </router-link>
    <router-link v-else class="btn-ai btn-ai-sm btn-ai-primary" to="/dashboard">
      <span class="btn-ai-finger"></span>
      <span class="btn-ai-text">进入工作台</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { scrollToSection } from "../scroll-to-section";

defineOptions({ name: "HomeNav" });

defineProps<{
  brandName: string;
  loggedIn: boolean;
  periodName: string;
  periodIcon: string;
  clock: string;
  isNight: boolean;
  dayNightTitle: string;
}>();
const emit = defineEmits<{ "toggle-day-night": [] }>();
</script>

<style scoped lang="scss">
@use "../styles/shared";

.home-page--night .nav {
  background: rgba(21, 30, 63, 0.85);
  border-bottom-color: #2c3859;
}

.home-page--night .brand-text {
  color: #fffdec !important;
}

.home-page--night .nav-clock {
  background: #1c274c;
  border-color: #2c3859;
  color: #fffdec;
}

.home-page--night .nav-daynight {
  border-color: #2c3859;
}

// 这两个 chip 的底是硬编码 #ffffff，夜间文字跟着 --ai-text 翻成近白就没了。
// 按 .nav-clock 的既有夜间做法改成深色 chip。
.home-page--night .nav-link-active {
  background: #1c274c;
  border-color: #2c3859;
  color: #fffdec;
}

// ============================================
// 3. 顶栏导航 (Navbar)
// ============================================
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 16px 40px;
  background: rgba(253, 253, 245, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 2px solid var(--ai-border);
  box-shadow: 0 4px 16px rgba(121, 79, 39, 0.04);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 18px;
  color: var(--ai-text);
  cursor: pointer;
}

.brand-mark {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, var(--ai-primary) 0%, #82d5bb 100%);
  border: 2px solid var(--ai-outline);
  border-radius: 50% 45% 50% 48% / 48% 50% 45% 50%;
  display: grid;
  place-items: center;
  box-shadow: 0 3px 0 0 var(--ai-outline);

  svg { width: 22px; height: 22px; color: #fff; }
}

.nav-links {
  display: flex;
  gap: 8px;
  margin-left: 28px;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  border-radius: 999px;
  font-weight: 800;
  color: var(--ai-text-2);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.25, 1, 0.5, 1);
  text-decoration: none;
  overflow: hidden;

  // lessons.md 文字避让小手指 hover 交互规范
  .nav-link-finger {
    position: absolute;
    left: 8px;
    width: 14px;
    height: 14px;
    background: url('/src/assets/select-cursor.svg') no-repeat center;
    background-size: contain;
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .nav-link-text {
    transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  &:hover {
    background: #f0e8d8;
    color: var(--ai-text);

    .nav-link-finger {
      opacity: 1;
      transform: translateX(0);
    }

    .nav-link-text {
      transform: translateX(8px); // 文字向右偏移避让
    }
  }
}

.nav-link-active {
  background: #ffffff;
  color: var(--ai-text);
  border: 1.5px solid var(--ai-border);
  box-shadow: 0 3px 6px rgba(61, 52, 40, 0.05);
}

// 本地时钟挂件
.nav-clock {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #fffef0;
  border: 2px solid var(--ai-border);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 800;
  color: var(--ai-text);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-right: 6px;

  .clock-icon {
    font-size: 15px;
  }
}

// 昼夜开关（拨杆形态，与时钟挂件同一套描边/圆角/底色）
.nav-daynight {
  position: relative;
  flex-shrink: 0;
  width: 58px;
  height: 30px;
  padding: 0;
  margin-right: 10px;
  background: var(--home-switch-track);
  border: 2px solid var(--ai-border);
  border-radius: 999px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    background 320ms cubic-bezier(0.23, 1, 0.32, 1),
    border-color 320ms cubic-bezier(0.23, 1, 0.32, 1);

  &:hover .nav-daynight__knob {
    transform: translateX(var(--home-switch-x)) scale(1.06);
  }

  &:focus-visible {
    outline: 2px solid var(--ai-primary);
    outline-offset: 2px;
  }
}

// 图标放在拨钮里。原先两个 face 贴在轨道左右两端，而拨钮宽 22px、位移 28px，
// 正好把当前那一侧的图标整个盖住，结果开关只剩一个空壳加白点。
.nav-daynight__glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: none;

  svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  // 🌞 动森小太阳与光芒旋转动效
  .glyph-sun {
    color: #794f27;
    animation: sun-pop-in 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both;

    .sun-rays {
      transform-origin: 12px 12px;
      animation: sun-rays-spin 12s linear infinite;
    }

    .sun-core {
      transform-origin: 12px 12px;
      animation: sun-core-breathe 2.5s ease-in-out infinite alternate;
    }
  }

  // 🌙 动森小弯月与星星闪烁动效
  .glyph-moon {
    color: #ffd85e;
    filter: drop-shadow(0 0 2px rgba(255, 216, 94, 0.6));
    animation: moon-pop-in 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both;

    .moon-body {
      transform-origin: 12px 12px;
      animation: moon-cradle 3.2s ease-in-out infinite alternate;
    }

    .moon-star {
      transform-origin: 19px 7px;
      animation: star-twinkle 1.8s ease-in-out infinite alternate;
    }
  }
}

// 悬浮时太阳转速稍加快
.nav-daynight:hover .sun-rays {
  animation-duration: 4s;
}

@keyframes sun-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.2) rotate(-60deg);
  }
  70% {
    transform: scale(1.15) rotate(8deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes sun-rays-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes sun-core-breathe {
  0% {
    transform: scale(0.94);
  }
  100% {
    transform: scale(1.06);
  }
}

@keyframes moon-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.2) rotate(-40deg);
  }
  70% {
    transform: scale(1.15) rotate(6deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes moon-cradle {
  0% {
    transform: rotate(-4deg);
  }
  100% {
    transform: rotate(6deg);
  }
}

@keyframes star-twinkle {
  0% {
    opacity: 0.35;
    transform: scale(0.75);
  }
  100% {
    opacity: 1;
    transform: scale(1.25);
  }
}

// 拨钮：位移量由 --home-switch-x 统一驱动，hover 缩放才不会把位移覆盖掉
.nav-daynight__knob {
  --home-switch-x: 0px;

  position: absolute;
  top: 50%;
  left: 2px;
  width: 22px;
  height: 22px;
  margin-top: -11px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--home-switch-knob);
  border: 2px solid var(--ai-outline);
  box-shadow: 0 2px 0 0 var(--ai-btn-shadow);
  transform: translateX(var(--home-switch-x));
  transition: transform 320ms cubic-bezier(0.23, 1, 0.32, 1), background 320ms ease;
}

.nav-daynight--on .nav-daynight__knob {
  --home-switch-x: 28px;
}

@media (prefers-reduced-motion: reduce) {
  .nav-daynight,
  .nav-daynight__knob,
  .glyph-sun,
  .glyph-moon,
  .sun-rays,
  .sun-core,
  .moon-body,
  .moon-star {
    transition: none;
    animation: none;
  }
}

.nav-spacer { flex: 1; }

@media (max-width: 900px) {
  .nav { padding: 12px 20px; gap: 12px; }
  .nav-links { display: none; }
}
</style>
