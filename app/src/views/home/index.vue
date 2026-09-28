<template>
  <div class="home-page" :class="['home-page--' + currentTimePeriod, { 'home-page--video': videoActive }]">
    <!-- 天空层：一日推移视频 + CSS 替身背景 -->
    <HomeSky
      v-model:video-active="videoActive"
      :period="currentTimePeriod"
      :video-time="targetVideoTime"
    />

    <!-- 导航栏 -->
    <HomeNav
      :brand-name="brandName"
      :logged-in="isLoggedIn"
      :period-name="timePeriodName"
      :period-icon="timePeriodIcon"
      :clock="formattedTime"
      :is-night="isNightView"
      :day-night-title="dayNightTitle"
      @toggle-day-night="toggleDayNight"
    />

    <!-- 主视觉 Hero：已登录展示个人小岛概览，未登录展示移居办理柜台 -->
    <HeroIsland v-if="isLoggedIn" :avatar-src="avatarSrc" :nickname="nickname" :stats="stats" />
    <HeroCounter v-else />

    <!-- 小岛导览：3D 功能分区巡游 -->
    <IslandTour :period="currentTimePeriod" @go="goTo" />

    <!-- 模块区：已登录展示“玩家背包栏 Grid”，未登录展示“小岛生态推荐手册 Highlights” -->
    <HomeModules :logged-in="isLoggedIn" @select="handleModuleClick" />

    <!-- 关于区：已登录展示“动森玩家岛民证 (Island Passport)”，未登录展示“大头针告示板 (Bulletin Board)” -->
    <section id="about" class="section">
      <div v-if="isLoggedIn">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">PASSPORT · 岛民证</div>
            <h2 class="section-title">Nook 岛民登记审查</h2>
          </div>
          <p class="section-sub">符合 Nook Inc. 移居小岛标准的官方认证卡，记录岛主身份与成就。</p>
        </div>

        <div class="passport-container">
          <IslandPassport :brand-name="brandName" :nickname="nickname" :avatar-src="avatarSrc" />
        </div>
      </div>

      <div v-else>
        <div class="section-head">
          <div>
            <div class="section-eyebrow">BULLETIN · 广场告示板</div>
            <h2 class="section-title">岛屿公告与基础设施栏 (Bulletin Board)</h2>
          </div>
          <p class="section-sub">记录博客小岛建设进程的大头针告示板，贴着最新的技术公告与移居资讯。</p>
        </div>

        <div class="passport-container">
          <BulletinBoard />
        </div>
      </div>
    </section>

    <!-- 尾部露营帐篷小山丘与页脚 -->
    <HomeCampFooter :logged-in="isLoggedIn" :nickname="nickname" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store";
import DashboardStatsAPI from "@/api/develop/dashboard-stats";
import type { DashboardMetrics } from "@/types/api/dashboard-stats";
import islanderSvg from "@/assets/home/islander.svg";
import { resolveAvatar } from "@/utils/avatar";
import { usePublicPageScroll } from "@/composables";
import { useDayCycle } from "./day-cycle";
import type { HomeStats } from "./home-stats";
import type { HomeModule } from "./home-modules";
import HomeSky from "./components/HomeSky.vue";
import HomeNav from "./components/HomeNav.vue";
import HeroIsland from "./components/HeroIsland.vue";
import HeroCounter from "./components/HeroCounter.vue";
import IslandTour from "./components/IslandTour.vue";
import HomeModules from "./components/HomeModules.vue";
import IslandPassport from "./components/IslandPassport.vue";
import BulletinBoard from "./components/BulletinBoard.vue";
import HomeCampFooter from "./components/HomeCampFooter.vue";

defineOptions({ name: "HomePage" });

usePublicPageScroll();

const router = useRouter();
const userStore = useUserStore();

const isLoggedIn = computed(() => userStore.isLoggedIn());
const nickname = computed(() => userStore.userInfo?.nickname || "岛主");
const avatarSrc = computed(() =>
  isLoggedIn.value
    ? resolveAvatar(userStore.userInfo?.avatar, userStore.userInfo?.gender)
    : islanderSvg
);
const brandName = computed(() =>
  isLoggedIn.value ? `${nickname.value}的小岛` : "博客小岛"
);

const {
  videoActive,
  currentTimePeriod,
  timePeriodName,
  timePeriodIcon,
  formattedTime,
  isNightView,
  dayNightTitle,
  toggleDayNight,
  targetVideoTime,
} = useDayCycle();

/* ---- 首页 KPI 统计数据 ---- */
const metrics = ref<DashboardMetrics | null>(null);

function formatWords(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

const statWords = computed(() => metrics.value ? formatWords(metrics.value.total_words.value) : "8.4k");
const statLogs = computed(() => metrics.value ? String(metrics.value.total_logs.value) : "42");
const statStreak = computed(() => metrics.value ? String(metrics.value.longest_streak.value) : "7");
const statPeak = computed(() => metrics.value?.peak_hour?.label || "14点");
const stats = computed<HomeStats>(() => ({
  words: statWords.value,
  logs: statLogs.value,
  streak: statStreak.value,
  peak: statPeak.value,
}));

onMounted(async () => {
  if (!isLoggedIn.value) return;
  try {
    const data = await DashboardStatsAPI.getStats("overview", "all");
    metrics.value = data.metrics;
  } catch {
    // 异常时保持静态兜底以保证 wow 体验
  }
});

// 未登录一律去登录；已登录直达目标功能页
const goTo = (path: string) => {
  router.push(isLoggedIn.value ? path : "/login");
};

const handleModuleClick = (mod: HomeModule) => goTo(mod.path);

</script>

<style lang="scss" scoped>
@use "./styles/shared";

.home-page {
  // ── 昼夜 token（昼间值 = 抽取前的字面值，等值重构）────────────
  // 夜间覆盖见 .home-page--night
  --ai-text: var(--ai-text);          // 正文/标题棕
  --ai-text-2: var(--ai-text-2);        // 次级文字
  --ai-primary: var(--ai-primary);       // 主题青
  --ai-primary-active: var(--ai-primary-active);
  --ai-border: var(--ai-border);        // 浅描边
  --ai-outline: var(--ai-text);       // 拟物粗描边（与 --ai-text 昼间同值、夜间相反）
  --ai-btn-face: #fffef6;      // 按钮/卡片面
  --ai-btn-shadow: #d4c9b4;    // 拟物投影
  --ai-shadow-color: var(--ai-shadow-color);  // 柔和阴影

  // ── 首页专有槽 ──────────────────────────────────────────
  --home-hill-back: var(--ai-success);      // 后层山丘
  --home-hill-back-op: 0.45;
  --home-hill-front: #8ac68a;     // 前层山丘
  --home-hill-front-op: 0.65;
  --home-cloud-fill: #fff;        // 云朵填充
  --home-particle-op: 1;          // 飘落 🍃🌸 透明度
  // 浅色 chip（图标底、黄色称号 pill）上的墨。这些底色是硬编码的浅色、
  // 不随昼夜翻转，所以墨也必须常驻深色，不能跟着 --ai-text 走。
  --home-chip-ink: #794f27;
  --home-switch-track: #fffef0;   // 昼夜开关轨道
  --home-switch-knob: #ffd85e;    // 昼夜开关拨钮（昼间＝太阳黄）
  --home-sign-wood-top: #c8905a; // 木牌上半
  --home-sign-wood-bottom: #a86f3d; // 木牌下半
  --home-sign-wood-shadow: #6b4520; // 木牌投影
  --home-sign-rope: #794f27; // 挂绳
  // 背景视频蒙版：视频是 fixed 铺满视口的，下半部的草地细节会压在正文下面，
  // 不压一层纸色正文就读不清。上淡下浓，天空区尽量保留原画。
  --home-video-veil: linear-gradient(
    180deg,
    rgba(253, 253, 245, 0.12) 0%,
    rgba(253, 253, 245, 0.38) 45%,
    rgba(253, 253, 245, 0.52) 100%
  );

  position: relative;
  width: 100%;
  font-family: var(--el-font-family);
  user-select: none;
  transition: background 1.5s ease-in-out;
}

// ============================================
// 1. 四套唯美天空时域背景 CSS 定义
// ============================================

// 🌤 清晨天空
.home-page--morning {
  background: linear-gradient(180deg, #fcead2 0%, #ecdcb9 40%, #c1dbbe 100%);
}

// ☀️ 白昼天空 (经典青绿)
.home-page--afternoon {
  background: linear-gradient(180deg, #dbf3fa 0%, #eaf6db 60%, #e1edd0 100%);
}

// 🌇 黄昏落日
.home-page--sunset {
  background: linear-gradient(180deg, #fcd5b5 0%, #e5a48b 50%, #af879d 100%);
}

// 🌌 夜空闪烁
.home-page--night {
  // ── 夜间 token 覆盖（取值来自 夜晚模板.dc.html 的 [data-mode="night"]）──
  // 这一组接管全页约 120 处 token 引用；下方的逐元素规则只处理 token 之外的特例
  --ai-text: #fffdec;
  --ai-text-2: #a9b3d8;
  --ai-primary: #a5b4fc;
  --ai-primary-active: #8b9cf5;
  --ai-border: #2c3859;
  --ai-outline: #0f1731;
  --ai-btn-face: #223058;
  --ai-btn-shadow: #0a1024;
  --ai-shadow-color: #0b1123;

  --home-hill-back: #24406b;
  --home-hill-back-op: 1;      // 暗色山丘不能再压透明度，否则糊成一片
  --home-hill-front: #1a3054;
  --home-hill-front-op: 1;
  --home-cloud-fill: rgba(200, 210, 240, 0.35);
  --home-particle-op: 0.35;
  --home-switch-track: #151e3f;
  --home-switch-knob: #24355f;
  --home-sign-wood-top: #6b4a2e;
  --home-sign-wood-bottom: #54381f;
  --home-sign-wood-shadow: #2c1c0e;
  --home-sign-rope: #a98a66; // 夜空里挂绳要比描边亮，否则看不见
  --home-video-veil: linear-gradient(
    180deg,
    rgba(21, 30, 63, 0.18) 0%,
    rgba(21, 30, 63, 0.46) 45%,
    rgba(21, 30, 63, 0.6) 100%
  );

  background: linear-gradient(180deg, #151e3f 0%, #213352 60%, #1e2836 100%);
  color: var(--ai-text);
}


// .home-page 是 position:relative / z-index:auto，不产生堆叠上下文，
// 所以 .sky（z-index:-2）在根堆叠上下文里排在它的背景之前绘制——
// 页面渐变是不透明的，会把视频整个盖掉。视频接管时必须让出这层背景。
// 用两个类叠加提高特异性，免得依赖它和 .home-page--night 的源码先后顺序。
.home-page.home-page--video {
  background: none;
}

// ============================================
// 8. 岛民证 (Passport)
// ============================================
.passport-container {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
