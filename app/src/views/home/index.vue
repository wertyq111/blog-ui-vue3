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
    <HeroIsland
      v-if="isLoggedIn"
      :avatar-src="avatarSrc"
      :nickname="nickname"
      :stat-words="statWords"
      :stat-streak="statStreak"
    />
    <HeroCounter v-else />

    <!-- 岛民广播属性统计面板 (仅在已登录状态展示) -->
    <HomeKpiStrip v-if="isLoggedIn" :stats="stats" />

    <!-- 模块区：已登录展示“玩家背包栏 Grid”，未登录展示“小岛生态推荐手册 Highlights” -->
    <section id="modules" class="section">
      <div v-if="isLoggedIn">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">MODULES · 岛屿口袋</div>
            <h2 class="section-title">我的背包格子 (Pocket Slots)</h2>
          </div>
          <p class="section-sub">小岛里的常用入口，化为随身背包里的各种神奇道具，点击即可掏出使用。</p>
        </div>
        
        <div class="modules-pocket">
          <div v-for="mod in modules" :key="mod.key" class="pocket-slot" :class="'pocket-slot--' + mod.color" @click="handleModuleClick(mod.key)">
            <!-- 背包格子的圆圈标记角标 -->
            <span class="pocket-slot-tag">{{ mod.tag }}</span>
            
            <div class="pocket-slot-ico-wrap">
              <div class="pocket-slot-ico">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="mod.icon" />
                </svg>
              </div>
            </div>
            <div class="pocket-slot-title">{{ mod.title }}</div>
            <div class="pocket-slot-sub">{{ mod.sub }}</div>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="section-head">
          <div>
            <div class="section-eyebrow">HIGHLIGHTS · 岛屿生态手册</div>
            <h2 class="section-title">小岛推荐指南 (Getaway Highlights)</h2>
          </div>
          <p class="section-sub">Nook 移居计划官方倾情推荐，为您全方位展示博客小岛的悠闲生活与核心建设生态。</p>
        </div>
        
        <div class="modules-pocket">
          <div v-for="mod in unauthModules" :key="mod.key" class="pocket-slot" :class="'pocket-slot--' + mod.color" @click="handleModuleClick(mod.key)">
            <!-- 背包格子的圆圈标记角标 -->
            <span class="pocket-slot-tag">{{ mod.tag }}</span>
            
            <div class="pocket-slot-ico-wrap">
              <div class="pocket-slot-ico">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
          <div class="ac-passport">
            <!-- 岛民证头部缝线装饰 -->
            <div class="ac-passport__header">
              <div class="ac-passport__title-group">
                <h3>PASSPORT</h3>
                <span>Nook Inc. 岛民护照登记卡</span>
              </div>
              <!-- Dodo 联运 Approved 防伪印章 -->
              <div class="ac-passport__stamp-dodo">
                <span>DODO APPR.</span>
                <span class="sub">10.10.9.184</span>
              </div>
            </div>
            
            <div class="ac-passport__card">
              <!-- 左侧大头照照相机区域 -->
              <div class="ac-passport__photo-area">
                <div class="ac-passport__photo">
                  <img :src="avatarSrc" :alt="nickname" />
                </div>
                <div class="ac-passport__photo-stamp">PASSPORT PHOTO</div>
                <!-- 印在照片上的小海鸥 Approved 浅色水印 -->
                <div class="ac-passport__photo-watermark">🍃</div>
              </div>
              
              <!-- 右侧玩家手绘属性明细面联 -->
              <div class="ac-passport__details">
                <div class="ac-passport__row">
                  <div class="ac-passport__item">
                    <span class="label">PASSENGER NAME / 岛民姓名</span>
                    <span class="value">🌿 {{ nickname }}</span>
                  </div>
                  <div class="ac-passport__item">
                    <span class="label">NATIVE FRUIT / 特产水果</span>
                    <span class="value fruit-color">{{ userFruit }}</span>
                  </div>
                </div>
                
                <!-- 胶囊称号 (Title) -->
                <div class="ac-passport__row">
                  <div class="ac-passport__item ac-passport__item--title">
                    <span class="label">TITLE / 岛民称号</span>
                    <div class="value-title-wrap">
                      <span class="title-pill">{{ userTitle1 }}</span>
                      <span class="title-pill">{{ userTitle2 }}</span>
                    </div>
                  </div>
                </div>

                <div class="ac-passport__row">
                  <div class="ac-passport__item">
                    <span class="label">ISLAND NAME / 注册岛名</span>
                    <span class="value">{{ brandName }}</span>
                  </div>
                  <div class="ac-passport__item">
                    <span class="label">FIRST DEPARTURE / 移居日期</span>
                    <span class="value">2023-01-20</span>
                  </div>
                </div>

                <div class="ac-passport__row">
                  <div class="ac-passport__item">
                    <span class="label">ISLAND COMMENT / 岛民寄语</span>
                    <span class="value comment">“ 不催稿、不焦虑。写点东西、做点项目，让小岛今天比昨天再绿一点。 🌱 ”</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
          <!-- 大头针告示板 (Bulletin Board) 1:1 复刻 -->
          <div class="bulletin-board">
            <!-- 告示板大头针 -->
            <div class="board-pin pin-left">📌</div>
            <div class="board-pin pin-right">📌</div>
            
            <div class="board-header">
              <span class="board-title">📢 博客小岛 · 今日快讯</span>
              <!-- 顶部两只可爱的小鸟剪影 -->
              <div class="board-birds">
                <span class="board-bird">🐦</span>
                <span class="board-bird">🐤</span>
              </div>
            </div>
            
            <div class="board-body">
              <!-- 便签 1：技术基石 -->
              <div class="board-sticky sticky-tech">
                <div class="sticky-head">📋 岛屿基础设施公告</div>
                <div class="sticky-content">
                  本岛已完成技术现代化升级！前端搭载轻盈高效的 <strong>Vue 3.5 + Vite 8</strong> 拟物引擎，样式由 <strong>UnoCSS + Sass</strong> 随心调配；后端基于稳固的 <strong>Laravel 10 API</strong> 强力驱动，测试链则由 <strong>Pest PHP</strong> 严密守卫。🌱
                </div>
                <div class="sticky-foot">Nook 岛建委员会 · 宣</div>
              </div>
              
              <!-- 便签 2：乘客招募 -->
              <div class="board-sticky sticky-recruit">
                <div class="sticky-head">✉️ 登岛民移居招募通知</div>
                <div class="sticky-content">
                  欢迎各位开发者、创作者移居博客小岛！在这里我们不催稿、不焦虑。完成登岛移居手续后，即可当场获得您的专属官方<strong>「岛民证 (Island Passport)」</strong>，并解锁专属的<strong>「随身背包口袋」</strong>！✨
                </div>
                <div class="sticky-foot">Dodo Airlines 客服部</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

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
          <span v-if="isLoggedIn">今天也是慢慢长大的一天 🌱</span>
          <span v-else>小岛的生活，从一张机票开始 ✈️</span>
        </h3>
        <p class="island-sub">
          <span v-if="isLoggedIn">在这里不焦虑。每天收集一些灵感，搭建好玩的功能。今天的小岛有没有比昨天更绿一点点呢？</span>
          <span v-else>这里是没有焦虑和催促的像素绿洲。每天整理你的随笔，沉淀开发心得。今天的小岛有没有比昨天更绿一点点呢？</span>
        </p>
        <div class="island-actions">
          <router-link v-if="isLoggedIn" class="btn-ai btn-ai-primary" to="/dashboard">
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
      <div v-if="isLoggedIn" class="foot-credit">© 2026 {{ nickname }} · 基于 animal-island-vue3 拟物引擎 · MIT License</div>
      <div v-else class="foot-credit">© 2026 Nook Inc. · 基于 animal-island-vue3 拟物引擎 · MIT License</div>
    </footer>
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
import HomeSky from "./components/HomeSky.vue";
import HomeNav from "./components/HomeNav.vue";
import HeroIsland from "./components/HeroIsland.vue";
import HeroCounter from "./components/HeroCounter.vue";
import HomeKpiStrip from "./components/HomeKpiStrip.vue";

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

/* ---- 动态哈希特产水果与胶囊称号生成 ---- */
const fruits = ["🍒 樱桃", "🍑 蜜桃", "🍊 橘子", "🍎 苹果", "🍐 梨子", "🥥 椰子"];
const titlesFirst = ["刚起步的", "全能的", "悠闲的", "闪闪发光的", "充满灵感的", "传说中的", "爱发呆的", "新来的"];
const titlesSecond = ["岛民", "写作者", "梦想家", "开发者", "收藏家", "园艺家", "旅行者", "创作者"];

const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const userFruit = computed(() => {
  const hash = getHash(nickname.value);
  return fruits[hash % fruits.length];
});

const userTitle1 = computed(() => {
  const hash = getHash(nickname.value);
  return titlesFirst[hash % titlesFirst.length];
});

const userTitle2 = computed(() => {
  const hash = getHash(nickname.value + "-suffix");
  return titlesSecond[hash % titlesSecond.length];
});

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
const stats = computed(() => ({
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

const handleModuleClick = (key: string) => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }
  // 点击背包物品进入对应的功能路由
  if (key === "me" || key === "user") {
    router.push("/profile");
  } else {
    router.push("/dashboard");
  }
};

const unauthModules = [
  { key: "daily", color: "pink", tag: "DAILY · 日常", title: "工作日常", sub: "日报 · 周报 · 月报的打理", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { key: "docs", color: "yellow", tag: "DOCS · 开发", title: "开发文档", sub: "小岛技术结晶与沉淀", icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
  { key: "docker", color: "blue", tag: "TRANSIT · 联运", title: "Dodo 联运", sub: "本地远端服务无缝对接", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { key: "site", color: "green", tag: "BLUEPRINT · 蓝图", title: "建设蓝图", sub: "站点字典参数系统配置", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
];

const modules = [
  { key: "daily", color: "pink", tag: "DAILY", title: "工作日常", sub: "日报 · 周报 · 月报", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { key: "docs", color: "yellow", tag: "DOCS", title: "开发文档", sub: "项目资料沉淀", icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
  { key: "source", color: "blue", tag: "SOURCE", title: "平台来源", sub: "绑定项目上下文", icon: "M6 3h12l4 6-10 13L2 9z" },
  { key: "route", color: "teal", tag: "ROUTE", title: "路径转换", sub: "网址与服务器地址", icon: "M13 2L3 14h9l-1 8 10-12h-9z" },
  { key: "init", color: "orange", tag: "INIT", title: "模型初始化", sub: "框架模板配置", icon: "M12 3v18M3 12h18" },
  { key: "user", color: "purple", tag: "USER", title: "会员管理", sub: "用户资料与头像", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
  { key: "sys", color: "green", tag: "SYS", title: "系统管理", sub: "菜单 · 角色 · 权限", icon: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" },
  { key: "site", color: "peach", tag: "SITE", title: "站点配置", sub: "字典 · 参数 · 日志", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
  { key: "api", color: "lime", tag: "API", title: "接口后台", sub: "Laravel API", icon: "M18 20V10M12 20V4M6 20v-6" },
  { key: "docker", color: "red", tag: "DOCKER", title: "远端验证", sub: "Docker 运行环境", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { key: "mini", color: "brown", tag: "MINI", title: "小程序内容", sub: "壁纸 · 相册 · 记录", icon: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z" },
  { key: "me", color: "mint", tag: "ME", title: "个人中心", sub: "岛主信息与偏好", icon: "M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" },
];
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
  
  .sky {
    background: radial-gradient(1000px 500px at 70% 0%, rgba(254, 219, 178, 0.4) 0%, transparent 60%);
  }
}

// ☀️ 白昼天空 (经典青绿)
.home-page--afternoon {
  background: linear-gradient(180deg, #dbf3fa 0%, #eaf6db 60%, #e1edd0 100%);
  
  .sky {
    background: radial-gradient(1000px 500px at 80% 0%, rgba(25, 200, 185, 0.08) 0%, transparent 60%);
  }
}

// 🌇 黄昏落日
.home-page--sunset {
  background: linear-gradient(180deg, #fcd5b5 0%, #e5a48b 50%, #af879d 100%);
  
  .sky {
    background: radial-gradient(1100px 600px at 80% 10%, rgba(252, 115, 109, 0.3) 0%, transparent 60%);
  }
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
  --home-video-veil: linear-gradient(
    180deg,
    rgba(21, 30, 63, 0.18) 0%,
    rgba(21, 30, 63, 0.46) 45%,
    rgba(21, 30, 63, 0.6) 100%
  );

  background: linear-gradient(180deg, #151e3f 0%, #213352 60%, #1e2836 100%);
  color: var(--ai-text);

  .about-card {
    background: #1c274c;
    border-color: #2c3859;

    p {
      // 原字面值 var(--ai-shadow-color) 在这里是「柔和正文色」，不是阴影色。
      // token 化时按昼间语义归给了 --ai-shadow-color，其夜间值 #0b1123
      // 会在 #1c274c 卡片上变成近黑字，故改用语义正确的 --ai-text-2。
      color: var(--ai-text-2);
    }
  }

  .about-list-row span:last-child {
    color: #fffdec;
  }

  .pocket-slot {
    background: rgba(28, 39, 76, 0.85);
    border-color: #2c3859;

    &:hover {
      background: #1c274c;
    }
  }

  .ac-passport {
    background: #1c274c;
    border-color: var(--ai-outline);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .ac-passport__header {
    background: linear-gradient(180deg, #24355a 0%, #1c274c 100%);
    border-bottom-color: rgba(255, 255, 255, 0.1);

    .ac-passport__stamp-dodo {
      border-color: rgba(61, 212, 198, 0.7);
      color: #3dd4c6;
    }
  }

  .ac-passport__card {
    background: #1e2836;
    border-color: var(--ai-outline);
  }

  .ac-passport__details .label {
    color: rgba(255, 255, 255, 0.35);
  }

  .ac-passport__details .value {
    color: #fffdec;
  }

  .island-inner {
    background: linear-gradient(180deg, #1c274c 0%, #151e3f 100%);
    border-color: #2c3859;
    box-shadow: 0 8px 0 0 #151d38;
  }

  .island-title {
    color: #fffdec;
  }

  .foot {
    color: rgba(255, 255, 255, 0.4);
  }
}


// .home-page 是 position:relative / z-index:auto，不产生堆叠上下文，
// 所以 .sky（z-index:-2）在根堆叠上下文里排在它的背景之前绘制——
// 页面渐变是不透明的，会把视频整个盖掉。视频接管时必须让出这层背景。
// 用两个类叠加提高特异性，免得依赖它和 .home-page--night 的源码先后顺序。
.home-page.home-page--video {
  background: none;
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
.pocket-slot--blue { .pocket-slot-ico-wrap { background: #e8f0ff; } }
.pocket-slot--teal { .pocket-slot-ico-wrap { background: #e3faf2; } }
.pocket-slot--orange { .pocket-slot-ico-wrap { background: #ffebd6; } }
.pocket-slot--purple { .pocket-slot-ico-wrap { background: #f6ebff; } }
.pocket-slot--green { .pocket-slot-ico-wrap { background: #ebffe6; } }
.pocket-slot--peach { .pocket-slot-ico-wrap { background: #ffebd6; } }
.pocket-slot--lime { .pocket-slot-ico-wrap { background: #fdffe6; } }
.pocket-slot--red { .pocket-slot-ico-wrap { background: #ffe6e6; } }
.pocket-slot--brown { .pocket-slot-ico-wrap { background: #fdfaf0; } }
.pocket-slot--mint { .pocket-slot-ico-wrap { background: #e3faf2; } }

// ============================================
// 8. 岛民证 (Passport)
// ============================================
.passport-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.ac-passport {
  width: 100%;
  max-width: 720px;
  background: #fffef2;
  border: 3.5px solid var(--ai-outline);
  border-radius: 36px;
  box-shadow: 0 16px 40px rgba(121, 79, 39, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.ac-passport__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px;
  background: linear-gradient(180deg, #fffae8 0%, #fff6d1 100%);
  border-bottom: 3px dashed rgba(121, 79, 39, 0.2);

  .ac-passport__title-group {
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 900;
      color: var(--ai-text);
      letter-spacing: 2px;
      line-height: 1;
    }
    span {
      font-size: 10px;
      font-weight: 800;
      color: var(--ai-text-2);
      letter-spacing: 0.5px;
    }
  }
}

// 渡渡航空防伪盖章印记
.ac-passport__stamp-dodo {
  border: 3px double rgba(25, 200, 185, 0.4);
  border-radius: 10px;
  color: rgba(25, 200, 185, 0.5);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 4px 10px;
  transform: rotate(-8deg);
  line-height: 1;
  text-align: center;
  display: flex;
  flex-direction: column;

  .sub {
    font-size: 7px;
    font-weight: 800;
    margin-top: 1px;
  }
}

.ac-passport__card {
  display: flex;
  padding: 28px;
  gap: 28px;
  background: var(--ai-btn-face);
}

// 大头照片框
.ac-passport__photo-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.ac-passport__photo {
  width: 170px;
  height: 170px;
  border: 3px solid var(--ai-outline);
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ac-passport__photo-stamp {
  margin-top: 8px;
  font-size: 9px;
  font-weight: 900;
  color: var(--ai-text-2);
  letter-spacing: 1px;
}

.ac-passport__photo-watermark {
  position: absolute;
  right: 10px;
  bottom: 30px;
  font-size: 32px;
  color: rgba(124, 186, 112, 0.22);
  pointer-events: none;
  z-index: 1;
  transform: rotate(15deg);
}

// 信息字段
.ac-passport__details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ac-passport__row {
  display: flex;
  gap: 20px;
}

.ac-passport__item {
  display: flex;
  flex-direction: column;
  flex: 1;

  .label {
    font-size: 9px;
    font-weight: 800;
    color: var(--ai-text-3);
    letter-spacing: 0.5px;
    margin-bottom: 3px;
  }

  .value {
    font-size: 15px;
    font-weight: 900;
    color: var(--ai-text);

    &.fruit-color {
      color: var(--ai-red); // 特产色
    }

    &.comment {
      font-style: italic;
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--ai-text);
    }
  }
}

// 胶囊称号
.value-title-wrap {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.title-pill {
  background: var(--ai-warning);
  border: 2px solid var(--ai-outline);
  color: var(--home-chip-ink);
  font-size: 11px;
  font-weight: 900;
  padding: 3px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 0 0 var(--ai-outline);
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

// ============================================
// 10. 响应式适配
// ============================================
@media (max-width: 1200px) {
  .modules-pocket { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 900px) {
  .modules-pocket { grid-template-columns: repeat(2, 1fr); }
  
  .ac-passport {
    border-radius: 24px;
  }
  
  .ac-passport__card {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .ac-passport__photo {
    width: 150px;
    height: 150px;
  }
  
  .ac-passport__header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .ac-passport__stamp-dodo {
    align-self: flex-end;
  }
}

// ============================================
// 12. 大头针告示板 (Bulletin Board) 样式
// ============================================
.bulletin-board {
  width: 100%;
  max-width: 720px;
  background: #e5cc9c; // 温暖的软木塞底色
  border: 12px solid #946f48; // 木纹厚边框
  border-radius: 24px;
  padding: 24px;
  box-shadow:
    inset 0 0 20px rgba(78, 54, 30, 0.25),
    0 16px 40px rgba(121, 79, 39, 0.12);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.board-pin {
  position: absolute;
  top: -12px;
  font-size: 20px;
  z-index: 3;
  filter: drop-shadow(0 4px 3px rgba(0,0,0,0.15));

  &.pin-left { left: 40px; transform: rotate(-10deg); }
  &.pin-right { right: 40px; transform: rotate(10deg); }
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3.5px dashed rgba(121, 79, 39, 0.15);
  padding-bottom: 12px;

  .board-title {
    font-size: 18px;
    font-weight: 900;
    color: var(--ai-text);
    letter-spacing: 1px;
  }
}

.board-birds {
  display: flex;
  gap: 12px;
  margin-top: -14px;
}

.board-bird {
  font-size: 20px;
  animation: ac-bird-sing 0.8s ease infinite alternate;

  &:last-child {
    animation-delay: 0.4s;
    transform: scaleX(-1);
  }
}

@keyframes ac-bird-sing {
  0% { transform: translateY(0) rotate(-4deg); }
  100% { transform: translateY(-4px) rotate(4deg); }
}

.board-body {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 20px;
}

// 告示板便签纸
.board-sticky {
  background: #fffdf0;
  border: 2.5px solid var(--ai-outline);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 4px 6px 0 rgba(78, 54, 30, 0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;

  .sticky-head {
    font-size: 13px;
    font-weight: 900;
    color: var(--ai-text);
    border-bottom: 1.5px dashed rgba(121, 79, 39, 0.15);
    padding-bottom: 6px;
  }

  .sticky-content {
    font-size: 12px;
    font-weight: 800;
    color: var(--ai-text);
    line-height: 1.6;
    flex: 1;

    strong {
      color: var(--ai-primary-active);
      font-weight: 900;
    }
  }

  .sticky-foot {
    font-size: 10px;
    font-weight: 800;
    color: var(--ai-shadow-color);
    text-align: right;
  }
}

.sticky-tech {
  background: #fdfcee; // 浅黄
  transform: rotate(-2.5deg);
}

.sticky-recruit {
  background: #edfbee; // 浅绿
  transform: rotate(2deg);

  .sticky-content strong {
    color: #6a86d8;
  }
}

// 针对移动端的适配
@media (max-width: 768px) {
  .board-body {
    grid-template-columns: 1fr;
  }
  .sticky-tech, .sticky-recruit {
    transform: none;
  }
}
</style>
