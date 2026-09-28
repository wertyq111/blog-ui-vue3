<!-- 首页未登录 hero（移居柜台） -->
<template>
  <section id="hero" class="hero hero--unauth">
    <div class="hero-grid">
      <div class="hero-text">
        <span class="hero-tag hero-tag--unauth">
          <span class="hero-tag-dot"></span>
          NOOK INC. · 移居小岛计划
        </span>
        <div class="hero-title-row">
          <h1 class="hero-title">
            博客<br/>小岛.
          </h1>
        </div>
        <p class="hero-sub">
          想要开启悠闲又充实的开发第二人生吗？<br />
          这里是 <b>Nook Inc. 移居小岛计划柜台</b>，我们将协助你办理博客小岛的定居登记，收集每日灵感，开启趣味生活！
        </p>
        <div class="hero-actions">
          <router-link class="btn-ai btn-ai-primary btn-ai-lg" to="/login">
            <span class="btn-ai-finger"></span>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="btn-arrow-ico"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
            <span class="btn-ai-text">填写移居申请卡 🎫</span>
          </router-link>
          <a class="btn-ai btn-ai-lg" href="javascript:void(0)" @click="scrollToSection('modules')">
            <span class="btn-ai-finger"></span>
            <span class="btn-ai-text">小岛生态指南 🔍</span>
          </a>
        </div>
      </div>

      <!-- 动森移居柜台前台接待处 (粒狸与豆狸经典对话插图) -->
      <div class="hero-avatar-wrap hero-avatar-wrap--unauth">
        <!-- 动森经典特产叶子 🍃 -->
        <div class="deco-nook-leaf">
          <svg viewBox="0 0 40 40" fill="#58a032">
            <path d="M5 35c10 0 20-5 28-13 5-5 7-12 7-22-10 0-17 2-22 7-8 8-13 18-13 28z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M5 35c8-8 16-14 26-20" stroke="#794f27" stroke-width="1.5" fill="none"/>
          </svg>
        </div>

        <!-- 木纹柜台 Desk -->
        <div class="nook-counter">
          <div class="nook-counter-top"></div>
          <div class="nook-counter-body">
            <span class="nook-counter-sign">NOOK INC. 移居小岛前台</span>
          </div>
        </div>

        <!-- 漂浮在空中的 Dodo Airlines 机票 🎫 -->
        <div class="deco-dodo-ticket">
          <div class="ticket-header">DODO AIRLINES</div>
          <div class="ticket-body">
            <span class="ticket-icon">✈️</span>
            <span class="ticket-text">PASS</span>
          </div>
        </div>

        <!-- 粒狸的缝线对话气泡 -->
        <div class="nook-bubble nook-bubble--timmy">
          <div class="nook-bubble-name">🌿 粒狸 (Timmy)</div>
          <div class="nook-bubble-content">
            “欢迎光临！今天是要办理博客小岛的移居定居登记对吧？”
          </div>
        </div>

        <!-- 豆狸的小声复读缝线对话气泡 -->
        <div class="nook-bubble nook-bubble--tommy">
          <div class="nook-bubble-name">🌿 豆狸 (Tommy)</div>
          <div class="nook-bubble-content">
            “...对吧！”
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { scrollToSection } from "../scroll-to-section";

defineOptions({ name: "HeroCounter" });
</script>

<style scoped lang="scss">
@use "../styles/shared";
@use "../styles/hero";

.hero-avatar-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

// ============================================
// 11. 未登录动森移居柜台前台视觉 (Unauth Counter)
// ============================================
.hero--unauth {
  padding-bottom: 90px;
}

.hero-tag--unauth {
  color: #58a032 !important;
  border-color: var(--ai-outline) !important;
}

.hero-avatar-wrap--unauth {
  height: 380px;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

// 柜台木质底座
.nook-counter {
  width: 280px;
  height: 120px;
  position: relative;
  z-index: 2;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.nook-counter-top {
  height: 14px;
  background: #a98056;
  border: 3.5px solid var(--ai-outline);
  border-radius: 8px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.08);
}

.nook-counter-body {
  flex: 1;
  background: #eed09d;
  border: 3.5px solid var(--ai-outline);
  border-top: none;
  border-radius: 0 0 16px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(121, 79, 39, 0.08);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    top: 8px;
    border: 2px dashed rgba(121, 79, 39, 0.15);
    border-radius: 8px;
    pointer-events: none;
  }
}

.nook-counter-sign {
  font-size: 13px;
  font-weight: 900;
  color: var(--ai-text);
  background: var(--ai-btn-face);
  border: 2px solid var(--ai-outline);
  border-radius: 8px;
  padding: 4px 10px;
  box-shadow: 0 2.5px 0 0 var(--ai-outline);
  letter-spacing: 1px;
}

// 动森小树叶 Nook 标志
.deco-nook-leaf {
  position: absolute;
  top: 170px;
  left: 60px;
  width: 38px;
  height: 38px;
  z-index: 1;
  transform: rotate(-15deg);
  animation: ac-leaf-sway 4s ease-in-out infinite alternate;
}

@keyframes ac-leaf-sway {
  0% { transform: rotate(-20deg) scale(0.95); }
  100% { transform: rotate(-5deg) scale(1.05); }
}

// Dodo 机票 🎫
.deco-dodo-ticket {
  position: absolute;
  top: 150px;
  right: 60px;
  width: 72px;
  height: 100px;
  background: #fffdf0;
  border: 3px solid var(--ai-outline);
  border-radius: 12px;
  z-index: 1;
  transform: rotate(18deg);
  box-shadow: 0 6px 12px rgba(121, 79, 39, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ac-ticket-bob 5s ease-in-out infinite;

  .ticket-header {
    background: #6a86d8;
    color: #fff;
    font-size: 8px;
    font-weight: 900;
    text-align: center;
    padding: 3px 0;
    border-bottom: 2.5px solid var(--ai-outline);
  }

  .ticket-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    position: relative;

    &::before, &::after {
      content: "";
      position: absolute;
      top: 50%;
      width: 8px;
      height: 8px;
      background: #eaf6db; // 默认匹配天空时域的混合
      border: 3px solid var(--ai-outline);
      border-radius: 50%;
    }
    &::before { left: -7px; }
    &::after { right: -7px; }
  }

  .ticket-icon { font-size: 18px; }
  .ticket-text {
    font-size: 9px;
    font-weight: 900;
    color: var(--ai-text);
    background: var(--ai-warning);
    border: 1.5px solid var(--ai-outline);
    border-radius: 4px;
    padding: 1px 4px;
  }
}

@keyframes ac-ticket-bob {
  0%, 100% { transform: rotate(18deg) translateY(0); }
  50% { transform: rotate(14deg) translateY(-10px); }
}

// Timmy & Tommy 对话泡泡
.nook-bubble {
  position: absolute;
  background: #fffdf2;
  border: 3px solid var(--ai-outline);
  border-radius: 20px;
  padding: 12px 16px;
  box-shadow: 0 8px 0 rgba(121, 79, 39, 0.05), 0 12px 24px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  z-index: 3;
  width: 250px;

  &::after {
    content: "";
    position: absolute;
    bottom: -13px;
    left: 30px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 10px 0 10px;
    border-color: #fffdf2 transparent transparent transparent;
  }

  &::before {
    content: "";
    position: absolute;
    bottom: -17px;
    left: 28px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 12px 12px 0 12px;
    border-color: var(--ai-outline) transparent transparent transparent;
    z-index: -1;
  }

  .nook-bubble-name {
    font-size: 10px;
    font-weight: 900;
    color: var(--ai-primary-active);
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  }

  .nook-bubble-content {
    font-size: 12px;
    font-weight: 800;
    color: var(--ai-text);
    line-height: 1.5;
  }

  &--timmy {
    top: 10px;
    left: 20px;
    animation: ac-bubble-float 4.5s ease-in-out infinite alternate;
  }

  &--tommy {
    top: 90px;
    right: 20px;
    width: 140px;
    padding: 8px 12px;
    opacity: 0.85;
    animation: ac-bubble-float-rev 5s ease-in-out infinite alternate;

    &::after {
      left: auto;
      right: 30px;
    }
    &::before {
      left: auto;
      right: 28px;
    }

    .nook-bubble-name {
      color: var(--ai-text-2);
    }

    .nook-bubble-content {
      font-size: 11px;
      font-style: italic;
    }
  }
}

@keyframes ac-bubble-float {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-6px) scale(1.02); }
}

@keyframes ac-bubble-float-rev {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(5px) scale(0.98); }
}

@media (max-width: 768px) {
  .nook-bubble--tommy {
    display: none;
  }
}
</style>
