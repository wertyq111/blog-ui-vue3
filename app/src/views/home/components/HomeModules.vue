<!-- 首页模块格子：已登录为背包格子，未登录为生态推荐手册 -->
<template>
  <section id="modules" class="section">
    <div>
      <div class="section-head">
        <div>
          <div class="section-eyebrow">{{ head.eyebrow }}</div>
          <h2 class="section-title">{{ head.title }}</h2>
        </div>
        <p class="section-sub">{{ head.sub }}</p>
      </div>

      <div class="modules-pocket">
        <div
          v-for="mod in homeModules"
          :key="mod.key"
          class="pocket-slot"
          :class="'pocket-slot--' + mod.color"
          @click="emit('select', mod)"
        >
          <!-- 背包格子的圆圈标记角标 -->
          <span class="pocket-slot-tag">{{ mod.tag }}</span>

          <div class="pocket-slot-ico-wrap">
            <div class="pocket-slot-ico">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path :d="mod.icon" />
              </svg>
            </div>
          </div>
          <div class="pocket-slot-title">{{ mod.title }}</div>
          <div class="pocket-slot-sub">{{ mod.sub }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { homeModules, type HomeModule } from "../home-modules";

defineOptions({ name: "HomeModules" });

const props = defineProps<{ loggedIn: boolean }>();
const emit = defineEmits<{ select: [mod: HomeModule] }>();

const head = computed(() =>
  props.loggedIn
    ? {
        eyebrow: "MODULES · 岛屿口袋",
        title: "我的背包格子 (Pocket Slots)",
        sub: "小岛里的常用入口，化为随身背包里的各种神奇道具，点击即可掏出使用。",
      }
    : {
        eyebrow: "HIGHLIGHTS · 岛屿生态手册",
        title: "小岛推荐指南 (Getaway Highlights)",
        sub: "Nook 移居计划官方倾情推荐，为您全方位展示博客小岛的悠闲生活与核心建设生态。",
      }
);
</script>

<style scoped lang="scss">
@use "../styles/shared";

.home-page--night .pocket-slot {
  background: rgba(28, 39, 76, 0.85);
  border-color: #2c3859;

  &:hover {
    background: #1c274c;
  }
}

.modules-pocket {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

// 动森经典背包格子道具卡片
.pocket-slot {
  position: relative;
  background: var(--ai-btn-face);
  border: 3px solid var(--ai-outline);
  border-radius: 28px;
  padding: 24px 20px;
  height: 206px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;
  box-shadow: 0 5px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
  text-decoration: none;

  // 内阴影和极柔格子平铺底纹
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(121, 79, 39, 0.01) 0px,
      rgba(121, 79, 39, 0.01) 4px,
      transparent 4px,
      transparent 8px
    );
    pointer-events: none;
    z-index: 0;
  }

  .pocket-slot-ico-wrap {
    width: 60px;
    height: 60px;
    display: grid;
    place-items: center;
    background: var(--ai-border);
    border: 2px solid var(--ai-outline);
    border-radius: 18px;
    margin-bottom: auto;
    z-index: 1;
    transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .pocket-slot-ico {
    color: var(--home-chip-ink);
    display: grid;
    place-items: center;
  }

  .pocket-slot-title {
    font-size: 18px;
    font-weight: 900;
    margin-top: 14px;
    letter-spacing: 0.02em;
    z-index: 1;
  }

  .pocket-slot-sub {
    font-size: 12px;
    color: var(--ai-text-2);
    font-weight: 800;
    margin-top: 4px;
    z-index: 1;
  }

  // 动森手指光标避让
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 10px 0 0 var(--ai-btn-shadow);
    border-color: var(--ai-primary);
    color: var(--ai-primary-active);

    .pocket-slot-ico-wrap {
      transform: scale(1.1) rotate(6deg);
      background: #e6f9f6;
      border-color: var(--ai-primary);
      color: var(--ai-primary-active);
    }

    .pocket-slot-sub {
      color: var(--ai-primary);
    }
  }

  &:active {
    transform: translateY(3px) scale(0.98);
    box-shadow: 0 2px 0 0 var(--ai-btn-shadow);
  }
}

// 背包格子标签角标
.pocket-slot-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(121, 79, 39, 0.08);
  border: 1.5px solid var(--ai-outline);
  color: var(--ai-text);
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.5px;
  z-index: 1;
}

// 对各颜色包格做细腻的拟色适配
.pocket-slot--pink { .pocket-slot-ico-wrap { background: #ffe6eb; } }
.pocket-slot--yellow { .pocket-slot-ico-wrap { background: #fff8d6; } }
.pocket-slot--teal { .pocket-slot-ico-wrap { background: #e3faf2; } }
.pocket-slot--orange { .pocket-slot-ico-wrap { background: #ffebd6; } }

@media (max-width: 900px) {
  .modules-pocket {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
