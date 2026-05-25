<template>
  <div class="home-page" :class="'home-page--' + currentTimePeriod">
    <!-- 天空背景容器 -->
    <div class="sky">
      <!-- 繁星点缀仅在夜间展示 -->
      <div v-if="currentTimePeriod === 'night'" class="starry-night-stars">
        <span class="star star--1">✦</span>
        <span class="star star--2">✦</span>
        <span class="star star--3">✦</span>
        <span class="star star--4">✦</span>
        <span class="star star--5">✦</span>
        <span class="star star--6">✦</span>
      </div>
    </div>

    <!-- 漂浮的白云 -->
    <svg class="cloud cloud-1" viewBox="0 0 140 70" fill="#fff">
      <ellipse cx="40" cy="45" rx="40" ry="22"/><ellipse cx="80" cy="35" rx="35" ry="22"/><ellipse cx="115" cy="48" rx="22" ry="16"/>
    </svg>
    <svg class="cloud cloud-2" viewBox="0 0 100 50" fill="#fff">
      <ellipse cx="30" cy="30" rx="28" ry="16"/><ellipse cx="65" cy="22" rx="24" ry="16"/><ellipse cx="85" cy="34" rx="14" ry="11"/>
    </svg>
    <svg class="cloud cloud-3" viewBox="0 0 80 40" fill="#fff">
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

    <!-- 导航栏 -->
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
      <div class="nav-clock" :title="'当前时段: ' + timePeriodName">
        <span class="clock-icon">{{ timePeriodIcon }}</span>
        <span class="clock-text">{{ formattedTime }}</span>
      </div>

      <router-link v-if="!isLoggedIn" class="btn-ai btn-ai-sm" to="/login">
        <span class="btn-ai-finger"></span>
        <span class="btn-ai-text">登录候机厅</span>
      </router-link>
      <router-link v-else class="btn-ai btn-ai-sm btn-ai-primary" to="/dashboard">
        <span class="btn-ai-finger"></span>
        <span class="btn-ai-text">进入工作台</span>
      </router-link>
    </nav>

    <!-- 主视觉 Hero -->
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

        <!-- 岛主大头贴与挂件装饰 (气球礼包与五角星化石) -->
        <div class="hero-avatar-wrap">
          <!-- 动森经典红色漂浮气球礼包 (字数统计) -->
          <div class="deco-balloon-present">
            <div class="balloon-svg">
              <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 气球主体 -->
                <path d="M30 10 C12 10, 8 28, 8 40 C8 52, 18 60, 30 60 C42 60, 52 52, 52 40 C52 28, 48 10, 30 10 Z" fill="#fc736d" stroke="#794f27" stroke-width="2.5" />
                <!-- 气球小嘴 -->
                <path d="M26 60 L34 60 L30 64 Z" fill="#fc736d" stroke="#794f27" stroke-width="2" />
                <!-- 悬挂线 -->
                <line x1="30" y1="64" x2="30" y2="76" stroke="#794f27" stroke-width="1.5" stroke-dasharray="2 2" />
              </svg>
            </div>
            <div class="present-box">
              <span class="present-box-ribbon"></span>
              <div class="present-box-content">
                <span class="lbl">累计字数</span>
                <span class="num">{{ statWords }}</span>
              </div>
            </div>
          </div>

          <!-- 动森五角星蓝色化石 (连续天数统计) -->
          <div class="deco-fossil-streak">
            <div class="fossil-icon">
              <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 蓝色化石底盘 -->
                <circle cx="30" cy="30" r="26" fill="#889df0" stroke="#794f27" stroke-width="3" />
                <circle cx="30" cy="30" r="21" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.6" />
                <!-- 蜗牛螺旋线 -->
                <path d="M30 16 C38 16, 44 22, 44 30 C44 38, 38 44, 30 44 C22 44, 18 38, 20 30 C21 24, 26 22, 30 22 C34 22, 36 25, 34 28 C33 29, 31 29, 30 28" stroke="#794f27" stroke-width="3" stroke-linecap="round" fill="none" />
                <!-- 小五角星 -->
                <path d="M30 24 L31 27 L34 27 L32 29 L33 32 L30 30 L27 32 L28 29 L26 27 L29 27 Z" fill="#fff" stroke="#794f27" stroke-width="1" />
              </svg>
            </div>
            <div class="fossil-content">
              <span class="lbl">连续天数</span>
              <span class="num">{{ statStreak }}<small>天</small></span>
            </div>
          </div>

          <!-- 挂角动森树叶装饰 🍃 -->
          <svg class="deco deco-leaf-1" viewBox="0 0 40 40" fill="#8ac68a">
            <path d="M5 35c10 0 20-5 28-13 5-5 7-12 7-22-10 0-17 2-22 7-8 8-13 18-13 28z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M5 35c8-8 16-14 26-20" stroke="#794f27" stroke-width="1.5" fill="none"/>
          </svg>
          <svg class="deco deco-leaf-2" viewBox="0 0 40 40" fill="#d1da49">
            <path d="M35 5c0 10-5 20-13 28-5 5-12 7-22 7 0-10 2-17 7-22 8-8 18-13 28-13z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M35 5c-8 8-16 14-26 20" stroke="#794f27" stroke-width="1.5" fill="none"/>
          </svg>

          <!-- 岛主圆形框头像 -->
          <div class="hero-avatar">
            <img :src="avatarSrc" :alt="nickname" />
          </div>
          <div class="hero-name">🌿 {{ nickname }} · 岛民岛主</div>
        </div>
      </div>
    </section>

    <!-- 岛民广播属性统计面板 -->
    <div class="hero-stats">
      <div class="stat">
        <div class="stat-ico stat-ico-mint">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19l4-12 3 9 3-6 2 5h4"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statWords }}<small>字</small></div>
          <div class="stat-lbl">本年累计文字</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ico stat-ico-yellow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h14M4 12h14M4 18h10"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statLogs }}<small>条日志</small></div>
          <div class="stat-lbl">累计随笔日志</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ico stat-ico-pink">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 2-4 0 2 2 2 2-4z"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statStreak }}<small>天</small></div>
          <div class="stat-lbl">最长连续记录</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ico stat-ico-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statPeak }}<small>时段</small></div>
          <div class="stat-lbl">高产量活跃时段</div>
        </div>
      </div>
    </div>

    <!-- 模块区：重构为动森经典的“玩家背包栏 Grid” -->
    <section id="modules" class="section">
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
    </section>

    <!-- 关于我：重构为 1:1 精美复刻的“动森玩家岛民证 (Island Passport)” -->
    <section id="about" class="section">
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

        <h3 class="island-title">今天也是慢慢长大的一天 🌱</h3>
        <p class="island-sub">在这里不焦虑。每天收集一些灵感，搭建好玩的功能。今天的小岛有没有比昨天更绿一点点呢？</p>
        <div class="island-actions">
          <router-link class="btn-ai btn-ai-primary" to="/dashboard">
            <span class="btn-ai-finger"></span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="btn-arrow-ico"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
            <span class="btn-ai-text">进入工作台</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 脚部 -->
    <footer class="foot">
      <div class="foot-credit">© 2026 {{ nickname }} · 基于 animal-island-vue3 拟物引擎 · MIT License</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store";
import DashboardStatsAPI from "@/api/develop/dashboard-stats";
import type { DashboardMetrics } from "@/types/api/dashboard-stats";
import islanderSvg from "@/assets/home/islander.svg";
import { resolveAvatar } from "@/utils/avatar";
import { usePublicPageScroll } from "@/composables";

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

/* ---- 24小时时段自动演进逻辑 ---- */
const currentTimePeriod = ref("afternoon"); // morning, afternoon, sunset, night
const formattedTime = ref("");
let clockTimer: any = null;

const timePeriodName = computed(() => {
  const map: Record<string, string> = {
    morning: "清晨",
    afternoon: "白天",
    sunset: "黄昏",
    night: "星夜",
  };
  return map[currentTimePeriod.value] || "白天";
});

const timePeriodIcon = computed(() => {
  const map: Record<string, string> = {
    morning: "🌅",
    afternoon: "☀️",
    sunset: "🌇",
    night: "🌌",
  };
  return map[currentTimePeriod.value] || "☀️";
});

const updateClock = () => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  formattedTime.value = `${hh}:${mm}`;

  const hour = d.getHours();
  if (hour >= 5 && hour < 8) {
    currentTimePeriod.value = "morning";
  } else if (hour >= 8 && hour < 17) {
    currentTimePeriod.value = "afternoon";
  } else if (hour >= 17 && hour < 19) {
    currentTimePeriod.value = "sunset";
  } else {
    currentTimePeriod.value = "night";
  }
};

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

onMounted(async () => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);

  if (!isLoggedIn.value) return;
  try {
    const data = await DashboardStatsAPI.getStats("overview", "all");
    metrics.value = data.metrics;
  } catch {
    // 异常时保持静态兜底以保证 wow 体验
  }
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});

const handleModuleClick = (key: string) => {
  // 点击背包物品进入对应的功能路由
  if (key === "me" || key === "user") {
    router.push("/profile");
  } else {
    router.push("/dashboard");
  }
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    
    // 更新导航栏上的高亮激活状态
    const links = document.querySelectorAll(".nav-link");
    links.forEach(link => link.classList.remove("nav-link-active"));
    
    const activeLink = Array.from(links).find(link => 
      link.querySelector(".nav-link-text")?.textContent === (id === "hero" ? "概览" : id === "modules" ? "模块" : "关于")
    );
    if (activeLink) {
      activeLink.classList.add("nav-link-active");
    }
  }
};

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
.home-page {
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
  background: linear-gradient(180deg, #151e3f 0%, #213352 60%, #1e2836 100%);
  color: #fffdec;
  
  .sky {
    background: radial-gradient(1000px 500px at 20% 0%, rgba(136, 157, 240, 0.15) 0%, transparent 60%);
  }

  .nav {
    background: rgba(21, 30, 63, 0.85);
    border-bottom-color: #2c3859;
  }

  .brand-text,
  .hero-sub,
  .section-title {
    color: #fffdec !important;
  }

  .hero-sub b {
    color: #3dd4c6 !important;
  }

  .stat {
    background: #1c274c;
    border-color: #2c3859;
  }

  .stat-num {
    color: #fffdec;
  }

  .nav-clock {
    background: #1c274c;
    border-color: #2c3859;
    color: #fffdec;
  }

  .about-card {
    background: #1c274c;
    border-color: #2c3859;

    p {
      color: #bdaea0;
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
    border-color: #794f27;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .ac-passport__card {
    background: #1e2836;
    border-color: #794f27;
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

// 慢动天空层
.sky {
  position: fixed;
  inset: 0;
  z-index: -2;
  transition: all 1.5s ease;
}

// 夜空闪烁的繁星
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

// 天空微动效（云朵漂移 + 水上飞机拉横幅）
.ac404__sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 250px;
  pointer-events: none;
  z-index: 1;
  overflow: hidden; // 阻断横掠小飞机造成宽度扩展溢出
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
}

.grass-hill {
  position: absolute;
  bottom: -40px;
  width: 120%;
  height: 200px;
  border-radius: 50%;
  
  &--back {
    left: -10%;
    background: #6fba2c;
    opacity: 0.45;
    animation: ac-hill-wave 16s ease-in-out infinite alternate;
  }

  &--front {
    left: -8%;
    background: #8ac68a;
    opacity: 0.65;
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
  border-bottom: 2px solid #e8e2d6;
  box-shadow: 0 4px 16px rgba(121, 79, 39, 0.04);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 18px;
  color: #794f27;
  cursor: pointer;
}

.brand-mark {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #19c8b9 0%, #82d5bb 100%);
  border: 2px solid #794f27;
  border-radius: 50% 45% 50% 48% / 48% 50% 45% 50%;
  display: grid;
  place-items: center;
  box-shadow: 0 3px 0 0 #794f27;

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
  color: #9f927d;
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
    color: #794f27;

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
  color: #794f27;
  border: 1.5px solid #e8e2d6;
  box-shadow: 0 3px 6px rgba(61, 52, 40, 0.05);
}

// 本地时钟挂件
.nav-clock {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #fffef0;
  border: 2px solid #e8e2d6;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 800;
  color: #794f27;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-right: 6px;

  .clock-icon {
    font-size: 15px;
  }
}

.nav-spacer { flex: 1; }

// ============================================
// 4. 按钮样式 (Buttons with Hand Wiggle hover)
// ============================================
.btn-ai {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 26px;
  font-family: inherit;
  font-weight: 900;
  font-size: 15px;
  color: #794f27;
  background: #fffef6;
  border: 2.5px solid #794f27;
  border-radius: 50px;
  cursor: pointer;
  letter-spacing: 0.05em;
  line-height: 1;
  box-shadow: 0 5px 0 0 #d4c9b4;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  text-decoration: none;
  overflow: hidden;

  .btn-ai-finger {
    position: absolute;
    left: 14px;
    width: 20px;
    height: 20px;
    background: url('/src/assets/select-cursor.svg') no-repeat center;
    background-size: contain;
    opacity: 0;
    transform: translateX(-10px) rotate(-10deg);
    transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .btn-ai-text {
    transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .btn-arrow-ico {
    transition: transform 0.2s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 0 0 #d4c9b4;
    border-color: #19c8b9;
    color: #11a89b;

    .btn-ai-finger {
      opacity: 1;
      transform: translateX(0) rotate(0deg);
      animation: ac-btn-wiggle 0.5s ease infinite alternate;
    }

    .btn-ai-text {
      transform: translateX(12px); // 向右平移避让手指
    }

    .btn-arrow-ico {
      transform: translateX(12px); // 图标跟随右移
    }
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 0 #d4c9b4;
  }
}

.btn-ai-primary {
  color: #fff;
  background: linear-gradient(180deg, #84cf4f 0%, #6fba2c 100%);
  border-color: #794f27;
  box-shadow: 0 5px 0 0 #5a9e1e;

  &:hover {
    box-shadow: 0 7px 0 0 #5a9e1e;
    color: #fff;
    border-color: #19c8b9;
  }

  &:active {
    box-shadow: 0 2px 0 0 #5a9e1e;
  }
}

.btn-ai-lg { padding: 16px 34px; font-size: 17px; }
.btn-ai-sm { padding: 8px 18px; font-size: 13px; box-shadow: 0 3px 0 0 #d4c9b4; }

@keyframes ac-btn-wiggle {
  0% { transform: scale(1) rotate(-5deg); }
  100% { transform: scale(1.08) rotate(5deg); }
}

// ============================================
// 5. 主体视觉 Hero 模块
// ============================================
.hero {
  position: relative;
  padding: 56px 40px 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 50px;
  align-items: center;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: #ffffff;
  border: 2px solid #794f27;
  border-radius: 999px;
  color: #11a89b;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 2.5px;
  box-shadow: 0 3px 0 0 rgba(121, 79, 39, 0.1);
}

.hero-tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #19c8b9;
  box-shadow: 0 0 0 3px rgba(25, 200, 185, 0.25);
}

.hero-title {
  font-size: clamp(64px, 10vw, 120px);
  font-weight: 900;
  line-height: 0.94;
  letter-spacing: -0.03em;
  margin: 20px 0;
  color: #fffdec;
  text-shadow:
    0 2.5px 0 #eed09d,
    0 5px 0 #794f27, // 动森深褐黑描边厚度
    0 7.5px 0 #794f27,
    0 12px 24px rgba(90, 58, 24, 0.18);
}

.hero-title-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.hero-sub {
  max-width: 500px;
  font-size: 16px;
  line-height: 1.8;
  color: #794f27;
  font-weight: 700;
  margin-bottom: 32px;

  b { color: #11a89b; font-weight: 800; }
}

.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

.hero-avatar-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

.hero-avatar {
  width: min(340px, 75vw);
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffffff 0%, #fff7e0 100%);
  border: 5px solid #794f27; // 动森深褐黑相框粗边
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

.hero-name {
  margin-top: 18px;
  padding: 6px 24px;
  background: #fffef6;
  border: 2px.5 solid #794f27;
  border-radius: 24px 30px 28px 26px / 26px 24px 30px 28px;
  font-weight: 900;
  font-size: 16px;
  color: #794f27;
  box-shadow: 0 4px 0 0 #d4c9b4;
}

// 浮动的红色气球礼物
.deco-balloon-present {
  position: absolute;
  top: -30px;
  left: -80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  animation: ac-balloon-bob 4s ease-in-out infinite;

  .balloon-svg {
    width: 46px;
    height: 60px;
    filter: drop-shadow(0 3px 4px rgba(0,0,0,0.06));
  }

  .present-box {
    margin-top: -12px;
    background: #fffef6;
    border: 2px.5 solid #794f27;
    border-radius: 12px;
    padding: 6px 12px;
    box-shadow: 0 3px 0 0 #794f27;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    .present-box-ribbon {
      position: absolute;
      top: -3px;
      width: 14px;
      height: 14px;
      background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><path d='M2 5 C2 2, 5 3, 5 5 C5 3, 8 2, 8 5 Z' fill='%23fc736d' stroke='%23794f27' stroke-width='1.2'/></svg>") no-repeat center;
      background-size: contain;
    }

    .lbl {
      font-size: 8px;
      font-weight: 800;
      color: #bdaea0;
      margin-bottom: 2px;
    }

    .num {
      font-size: 14px;
      font-weight: 900;
      color: #fc736d;
    }
  }
}

// 蓝色五角星化石挂饰
.deco-fossil-streak {
  position: absolute;
  bottom: 20px;
  right: -70px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 2px.5 solid #794f27;
  border-radius: 20px 24px 22px 26px / 24px 22px 26px 20px;
  padding: 6px 16px;
  box-shadow: 0 4px 0 0 #794f27;
  z-index: 3;
  transform: rotate(6deg);
  animation: ac-fossil-sway 5s ease-in-out infinite alternate;

  .fossil-icon {
    width: 32px;
    height: 32px;
  }

  .fossil-content {
    display: flex;
    flex-direction: column;

    .lbl {
      font-size: 8px;
      font-weight: 800;
      color: #bdaea0;
    }

    .num {
      font-size: 14px;
      font-weight: 900;
      color: #6a86d8;
    }
  }
}

@keyframes ac-balloon-bob {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-14px) rotate(2deg); }
}

@keyframes ac-fossil-sway {
  0% { transform: rotate(3deg) translateY(0); }
  100% { transform: rotate(9deg) translateY(-4px); }
}

.deco { position: absolute; }
.deco-leaf-1 { top: -14px; right: -14px; width: 52px; transform: rotate(18deg); z-index: 3; }
.deco-leaf-2 { bottom: -14px; left: -14px; width: 44px; transform: rotate(-18deg); z-index: 3; }

// ============================================
// 6. 岛民广播属性统计面板
// ============================================
.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 28px auto 0;
  max-width: 1200px;
  width: 100%;
  padding: 0 40px;
  position: relative;
  z-index: 2;
}

.stat {
  background: #fffef6;
  border: 2.5px solid #794f27;
  border-radius: 24px;
  padding: 16px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 0 0 #d4c9b4;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 0 0 #d4c9b4;
    border-color: #19c8b9;
  }
}

.stat-ico {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.stat-ico-mint { background: #e6f9f6; color: #11a89b; }
.stat-ico-yellow { background: #fff2ba; color: #9f7c00; }
.stat-ico-pink { background: #ffe0e6; color: #c05f76; }
.stat-ico-blue { background: #dfe9ff; color: #6a86d8; }

.stat-num {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  color: #794f27;

  small { font-size: 11px; font-weight: 800; color: #9f927d; margin-left: 2px; }
}

.stat-lbl { font-size: 11px; color: #bdaea0; font-weight: 800; margin-top: 5px; }

// ============================================
// 7. 背包 Slot 物品功能区
// ============================================
.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 40px 10px;
  position: relative;
  z-index: 2;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 20px;
}

.section-eyebrow {
  font-size: 12px;
  letter-spacing: 4px;
  font-weight: 900;
  color: #11a89b;
}

.section-title {
  margin: 6px 0 0;
  font-size: 34px;
  font-weight: 900;
  color: #794f27;
  letter-spacing: -0.02em;
  
  // 对各颜色包格做细腻的拟色适配 (使用 & 连字符修正 SCSS 同级类匹配)
  &--pink { .pocket-slot-ico-wrap { background: #ffe6eb; } }
  &--yellow { .pocket-slot-ico-wrap { background: #fff8d6; } }
  &--blue { .pocket-slot-ico-wrap { background: #e8f0ff; } }
  &--teal { .pocket-slot-ico-wrap { background: #e3faf2; } }
  &--orange { .pocket-slot-ico-wrap { background: #ffebd6; } }
  &--purple { .pocket-slot-ico-wrap { background: #f6ebff; } }
  &--green { .pocket-slot-ico-wrap { background: #ebffe6; } }
  &--peach { .pocket-slot-ico-wrap { background: #ffebd6; } }
  &--lime { .pocket-slot-ico-wrap { background: #fdffe6; } }
  &--red { .pocket-slot-ico-wrap { background: #ffe6e6; } }
  &--brown { .pocket-slot-ico-wrap { background: #fdfaf0; } }
  &--mint { .pocket-slot-ico-wrap { background: #e3faf2; } }
}

.section-sub { color: #9f927d; font-size: 14px; font-weight: 700; max-width: 480px; }

.modules-pocket {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

// 动森经典背包格子道具卡片
.pocket-slot {
  position: relative;
  background: #fffef6;
  border: 3px solid #794f27;
  border-radius: 28px;
  padding: 24px 20px;
  height: 206px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;
  box-shadow: 0 5px 0 0 #d4c9b4;
  color: #794f27;
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
    background: #e8e2d6;
    border: 2px solid #794f27;
    border-radius: 18px;
    margin-bottom: auto;
    z-index: 1;
    transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .pocket-slot-ico {
    color: #794f27;
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
    color: #bdaea0;
    font-weight: 800;
    margin-top: 4px;
    z-index: 1;
  }

  // 动森手指光标避让
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 10px 0 0 #d4c9b4;
    border-color: #19c8b9;
    color: #11a89b;

    .pocket-slot-ico-wrap {
      transform: scale(1.1) rotate(6deg);
      background: #e6f9f6;
      border-color: #19c8b9;
      color: #11a89b;
    }

    .pocket-slot-sub {
      color: #19c8b9;
    }
  }

  &:active {
    transform: translateY(3px) scale(0.98);
    box-shadow: 0 2px 0 0 #d4c9b4;
  }
}

// 背包格子标签角标
.pocket-slot-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(121, 79, 39, 0.08);
  border: 1.5px solid #794f27;
  color: #794f27;
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
  border: 3.5px solid #794f27;
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
      color: #794f27;
      letter-spacing: 2px;
      line-height: 1;
    }
    span {
      font-size: 10px;
      font-weight: 800;
      color: #bdaea0;
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
  background: #fffef6;
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
  border: 3px solid #794f27;
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
  color: #bdaea0;
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
    color: #c4b89e;
    letter-spacing: 0.5px;
    margin-bottom: 3px;
  }

  .value {
    font-size: 15px;
    font-weight: 900;
    color: #794f27;

    &.fruit-color {
      color: #fc736d; // 特产色
    }

    &.comment {
      font-style: italic;
      font-size: 13.5px;
      line-height: 1.6;
      color: #794f27;
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
  background: #f7cd67;
  border: 2px solid #794f27;
  color: #794f27;
  font-size: 11px;
  font-weight: 900;
  padding: 3px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 0 0 #794f27;
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
  background: #fffef6;
  border-radius: 48px;
  border: 3.5px solid #794f27;
  padding: 48px 40px;
  text-align: center;
  position: relative;
  box-shadow: 0 8px 0 0 #d4c9b4;
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
  color: #794f27;
  margin: 0 0 12px;
  font-weight: 900;
}

.island-sub {
  color: #9f927d;
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
  color: #9f927d;
  font-size: 12px;
  font-weight: 700;
}

// ============================================
// 10. 响应式适配
// ============================================
@media (max-width: 1200px) {
  .modules-pocket { grid-template-columns: repeat(3, 1fr); }
  .hero-stats { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; gap: 40px; }
  .modules-pocket { grid-template-columns: repeat(2, 1fr); }
  .nav { padding: 12px 20px; gap: 12px; }
  .nav-links { display: none; }
  
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
</style>
