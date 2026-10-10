<!-- 首页帐篷小山丘与页脚 -->
<template>
  <div class="home-camp-footer">
    <!-- 尾部露营帐篷小山丘交互条 -->
    <section class="island">
      <div class="island-inner">
        <!-- 露营帐篷矢量插图 -->
        <div class="camp-tent-svg">
          <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 帐篷主体 (乳白色配橙条纹) -->
            <path d="M10 50 L50 15 L90 50 Z" fill="#fffef0" stroke="#794f27" stroke-width="2.5" />
            <path d="M30 32 L50 15 L70 32 Z" fill="#e59266" opacity="0.8" />
            <!-- 帐篷拉链门 (打开) -->
            <path d="M40 50 L50 25 L60 50 Z" fill="#794f27" />
            <path d="M40 50 L45 35 M60 50 L55 35" stroke="#fff" stroke-width="1.5" />
            <!-- 地面铺垫 -->
            <rect x="5" y="49" width="90" height="4" rx="2" fill="#794f27" />
            <!-- 旁边的篝火 -->
            <path d="M22 49 L28 44 M28 49 L22 44" stroke="#794f27" stroke-width="3" stroke-linecap="round" />
            <circle cx="25" cy="42" r="5" fill="#fc736d" class="camp-fire" />
          </svg>
        </div>

        <h3 class="island-title">
          <span v-if="loggedIn">今天也是慢慢长大的一天 🌱</span>
          <span v-else>小岛的生活，从一张机票开始 ✈️</span>
        </h3>
        <p class="island-sub">
          <span v-if="loggedIn">在这里不焦虑。每天收集一些灵感，搭建好玩的功能。今天的小岛有没有比昨天更欢乐一点点呢？</span>
          <span v-else>这里是没有焦虑和催促的像素绿洲。每天整理你的随笔，沉淀开发心得。今天的小岛有没有比昨天更欢乐一点点呢？</span>
        </p>
        <div class="island-actions">
          <router-link v-if="loggedIn" class="btn-ai btn-ai-primary" to="/dashboard">
            <span class="btn-ai-finger"></span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="btn-arrow-ico"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
            <span class="btn-ai-text">进入工作台</span>
          </router-link>
          <router-link v-else class="btn-ai btn-ai-primary" to="/login">
            <span class="btn-ai-finger"></span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="btn-arrow-ico"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
            <span class="btn-ai-text">领取我的登岛机票 🎫</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 脚部 -->
    <footer class="foot">
      <div v-if="loggedIn" class="foot-credit">© 2026 {{ nickname }} · 基于 animal-island-vue3 拟物引擎 · MIT License</div>
      <div v-else class="foot-credit">© 2026 Nook Inc. · 基于 animal-island-vue3 拟物引擎 · MIT License</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "HomeCampFooter" });

defineProps<{ loggedIn: boolean; nickname: string }>();
</script>

<style scoped lang="scss">
@use "../styles/shared";

// 包裹层不产生盒子，帐篷区与页脚仍是页面根的直接布局子项
.home-camp-footer {
  display: contents;
}

.home-page--night .island-inner {
  background: linear-gradient(180deg, #1c274c 0%, #151e3f 100%);
  border-color: #2c3859;
  box-shadow: 0 8px 0 0 #151d38;
}

.home-page--night .island-title {
  color: #fffdec;
}

.home-page--night .foot {
  color: rgba(255, 255, 255, 0.4);
}

// ============================================
// 9. 露营帐篷/页脚收尾
// ============================================
.island {
  margin-top: 48px;
  padding: 60px 40px 40px;
}

.island-inner {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--ai-btn-face);
  border-radius: 48px;
  border: 3.5px solid var(--ai-outline);
  padding: 48px 40px;
  text-align: center;
  position: relative;
  box-shadow: 0 8px 0 0 var(--ai-btn-shadow);
}

// 露营帐篷
.camp-tent-svg {
  width: 90px;
  height: 60px;
  margin: 0 auto 16px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.camp-fire {
  transform-origin: 25px 42px;
  animation: ac-fire-flicker 0.4s ease infinite alternate;
}

@keyframes ac-fire-flicker {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(1.2); opacity: 1; }
}

.island-title {
  font-size: 34px;
  line-height: 1.1;
  color: var(--ai-text);
  margin: 0 0 12px;
  font-weight: 900;
}

.island-sub {
  color: var(--ai-text-2);
  font-weight: 700;
  max-width: 500px;
  margin: 0 auto 28px;
  font-size: 14px;
  line-height: 1.75;
}

.island-actions { display: inline-flex; gap: 14px; }

.foot {
  text-align: center;
  padding: 24px 0 60px;
  color: var(--ai-text-2);
  font-size: 12px;
  font-weight: 700;
}
</style>
