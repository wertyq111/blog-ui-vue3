<template>
  <div class="home-page">
    <!-- Sky backdrop -->
    <div class="sky"></div>

    <!-- Floating clouds -->
    <svg class="cloud cloud-1" viewBox="0 0 140 70" fill="#fff">
      <ellipse cx="40" cy="45" rx="40" ry="22"/><ellipse cx="80" cy="35" rx="35" ry="22"/><ellipse cx="115" cy="48" rx="22" ry="16"/>
    </svg>
    <svg class="cloud cloud-2" viewBox="0 0 100 50" fill="#fff">
      <ellipse cx="30" cy="30" rx="28" ry="16"/><ellipse cx="65" cy="22" rx="24" ry="16"/><ellipse cx="85" cy="34" rx="14" ry="11"/>
    </svg>
    <svg class="cloud cloud-3" viewBox="0 0 80 40" fill="#fff">
      <ellipse cx="22" cy="22" rx="22" ry="12"/><ellipse cx="52" cy="18" rx="20" ry="13"/><ellipse cx="70" cy="26" rx="10" ry="8"/>
    </svg>

    <!-- Nav -->
    <nav class="nav">
      <div class="brand">
        <div class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21c4 0 8-2 11-7 2-3 3-7 3-11-4 0-8 1-11 4-3 3-5 7-5 12 0 1 0 2 2 2z"/>
          </svg>
        </div>
        <span>{{ brandName }}</span>
      </div>
      <div class="nav-links">
        <a class="nav-link nav-link-active" href="#hero">概览</a>
        <a class="nav-link" href="#modules">模块</a>
        <a class="nav-link" href="#projects">项目</a>
        <a class="nav-link" href="#about">关于</a>
      </div>
      <div class="nav-spacer"></div>
      <router-link v-if="!isLoggedIn" class="btn-ai btn-ai-sm" to="/login">登录</router-link>
      <router-link v-else class="btn-ai btn-ai-sm btn-ai-primary" to="/dashboard">工作台</router-link>
    </nav>

    <!-- Hero -->
    <section id="hero" class="hero">
      <div class="hero-grid">
        <div class="hero-text">
          <span class="hero-tag"><span class="hero-tag-dot"></span>WELCOME · 博客小岛</span>
          <div class="hero-title-row">
            <h1 class="hero-title">博客<br/>小岛.</h1>
          </div>
          <p class="hero-sub">
            记录开发日常、沉淀项目文档、管理平台来源与工具配置。
            这里是 <b>{{ nickname }}</b> 的小岛 —— 收集本周的灵感、整理项目的航向，也保留一些发呆的余地。
          </p>
          <div class="hero-actions">
            <router-link class="btn-ai btn-ai-primary btn-ai-lg" to="/dashboard">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
              进入工作台
            </router-link>
          </div>
        </div>

        <div class="hero-avatar-wrap">
          <div class="deco-bell">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="6"/></svg>
            累计文字
          </div>
          <div class="deco-streak">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3c1 3 4 3 4 7a4 4 0 11-8 0c0-2 1-3 2-4 0 2 2 2 2-3z"/></svg>
            连续记录
          </div>
          <svg class="deco deco-leaf-1" viewBox="0 0 40 40" fill="#8ac68a">
            <path d="M5 35c10 0 20-5 28-13 5-5 7-12 7-22-10 0-17 2-22 7-8 8-13 18-13 28z" stroke="#5c9c5c" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M5 35c8-8 16-14 26-20" stroke="#5c9c5c" stroke-width="1.2" fill="none"/>
          </svg>
          <svg class="deco deco-leaf-2" viewBox="0 0 40 40" fill="#d1da49">
            <path d="M35 5c0 10-5 20-13 28-5 5-12 7-22 7 0-10 2-17 7-22 8-8 18-13 28-13z" stroke="#a3ad28" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          <div class="hero-avatar">
            <img :src="islanderSvg" :alt="nickname" />
          </div>
          <div class="hero-name">🌿 {{ nickname }} · 岛主</div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <div class="hero-stats">
      <div class="stat">
        <div class="stat-ico stat-ico-mint">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19l4-12 3 9 3-6 2 5h4"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statWords }}<small>字</small></div>
          <div class="stat-lbl">本年累计</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ico stat-ico-yellow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h14M4 12h14M4 18h10"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statLogs }}<small>条日志</small></div>
          <div class="stat-lbl">累计日志</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ico stat-ico-pink">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 2-4 0 2 2 2 2-4z"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statStreak }}<small>天</small></div>
          <div class="stat-lbl">最长连续</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ico stat-ico-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statPeak }}<small>时段</small></div>
          <div class="stat-lbl">高产时段</div>
        </div>
      </div>
    </div>

    <!-- Modules -->
    <section id="modules" class="section">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">MODULES · 模块</div>
          <h2 class="section-title">小岛里的事都摆好了</h2>
        </div>
        <p class="section-sub">常用入口，按颜色编排。</p>
      </div>
      <div class="modules">
        <div v-for="mod in modules" :key="mod.key" class="mod" :class="'mod-' + mod.color">
          <span class="mod-pill">{{ mod.tag }}</span>
          <div class="mod-ico">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path :d="mod.icon" />
            </svg>
          </div>
          <div class="mod-title">{{ mod.title }}</div>
          <div class="mod-sub">{{ mod.sub }}</div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="section">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">ABOUT · 岛主</div>
          <h2 class="section-title">关于这座小岛</h2>
        </div>
        <p class="section-sub">个人项目集合地。日常、文档、工具与玩物，按季节生长。</p>
      </div>
      <div class="about">
        <div class="about-card">
          <div class="about-stamp">岛<br/>主</div>
          <h4>🌿 {{ nickname }}</h4>
          <p>前端 · 设计杂食。喜欢 Vue 与可爱的拟物感。这里收集开发碎片、读书笔记和日报。</p>
          <div class="tags-wrap">
            <span class="tag-pill tag-mint">前端</span>
            <span class="tag-pill tag-yellow">设计</span>
            <span class="tag-pill tag-pink">读书</span>
            <span class="tag-pill tag-blue">写作</span>
          </div>
        </div>
        <div class="about-card">
          <div class="about-stamp about-stamp-teal">站<br/>况</div>
          <h4>📜 站况一览</h4>
          <div class="about-list">
            <div class="about-list-row"><span>建站时间</span><span>2023 年 1 月</span></div>
            <div class="about-list-row"><span>主题版本</span><span>Animal Island v3</span></div>
            <div class="about-list-row"><span>当前心情</span><span>🌤 多云转晴</span></div>
          </div>
        </div>
        <div class="about-card">
          <div class="about-stamp about-stamp-pink">取<br/>关</div>
          <h4>📮 找我玩</h4>
          <div class="about-list">
            <div class="about-list-row"><span>GitHub</span><span>@yanstu</span></div>
            <div class="about-list-row"><span>RSS</span><span>/rss.xml</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Island closing strip -->
    <section class="island">
      <div class="island-inner">
        <h3 class="island-title">今天也是<br/>慢慢长大的一天 🌱</h3>
        <p class="island-sub">不催稿、不焦虑。写点东西、做点项目，让小岛今天比昨天再绿一点。</p>
        <div class="island-actions">
          <router-link class="btn-ai btn-ai-primary" to="/dashboard">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
            进入工作台
          </router-link>
        </div>
      </div>
    </section>

    <footer class="foot">© 2026 {{ nickname }} · 基于 animal-island-vue · MIT License</footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useUserStore } from "@/store";
import DashboardStatsAPI from "@/api/develop/dashboard-stats";
import type { DashboardMetrics } from "@/types/api/dashboard-stats";
import islanderSvg from "@/assets/home/islander.svg";

const userStore = useUserStore();

const isLoggedIn = computed(() => userStore.isLoggedIn());
const nickname = computed(() => userStore.userInfo?.nickname || "岛主");
const brandName = computed(() =>
  isLoggedIn.value ? `${nickname.value}的小岛` : "博客小岛"
);

/* ---- 首页 KPI 数据 ---- */
const metrics = ref<DashboardMetrics | null>(null);

function formatWords(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

const statWords = computed(() => metrics.value ? formatWords(metrics.value.total_words.value) : "--");
const statLogs = computed(() => metrics.value ? String(metrics.value.total_logs.value) : "--");
const statStreak = computed(() => metrics.value ? String(metrics.value.longest_streak.value) : "--");
const statPeak = computed(() => metrics.value?.peak_hour?.label || "--");

onMounted(async () => {
  if (!isLoggedIn.value) return;
  try {
    const data = await DashboardStatsAPI.getStats("overview", "all");
    metrics.value = data.metrics;
  } catch {
    // 未登录或接口异常时保持 "--" 占位
  }
});

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
/* Sky */
.sky {
  position: fixed;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(1200px 600px at 80% -10%, #d5f0e6 0%, transparent 60%),
    radial-gradient(900px 500px at 10% 100%, #cce8d5 0%, transparent 60%),
    linear-gradient(180deg, #f1f4d8 0%, #d8ead0 70%, #b5d4a5 100%);

  &::after {
    content: "";
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 220px;
    z-index: -1;
    background: linear-gradient(180deg, rgba(125, 195, 149, 0) 0%, rgba(125, 195, 149, 0.35) 60%, rgba(125, 195, 149, 0.55) 100%);
    pointer-events: none;
  }
}

.cloud {
  position: fixed;
  z-index: -1;
  pointer-events: none;
  opacity: 0.85;
  filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.04));
}

.cloud-1 { top: 8%; left: 6%; width: 140px; }
.cloud-2 { top: 16%; right: 8%; width: 100px; }
.cloud-3 { top: 32%; left: 14%; width: 80px; }

/* Nav */
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 16px 40px;
  background: rgba(248, 248, 240, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e8e2d6;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 17px;
  color: #794f27;
}

.brand-mark {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #19c8b9 0%, #82d5bb 100%);
  border-radius: 50% 45% 50% 48% / 48% 50% 45% 50%;
  display: grid;
  place-items: center;
  box-shadow: 0 3px 0 0 #11a89b;

  svg { width: 22px; height: 22px; color: #fff; }
}

.nav-links {
  display: flex;
  gap: 6px;
  margin-left: 28px;
}

.nav-link {
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 700;
  color: #9f927d;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  &:hover { background: #f0e8d8; color: #794f27; }
}

.nav-link-active {
  background: #fff;
  color: #794f27;
  box-shadow: 0 2px 4px 0 rgba(61, 52, 40, 0.06);
}

.nav-spacer { flex: 1; }

/* Buttons */
.btn-ai {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  color: #794f27;
  background: #fdfdf5;
  border: 2px solid #fdfdf5;
  border-radius: 50px;
  cursor: pointer;
  letter-spacing: 0.02em;
  line-height: 1;
  box-shadow: 0 5px 0 0 #bdaea0;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s;
  text-decoration: none;

  &:hover { transform: translateY(-2px); box-shadow: 0 7px 0 0 #bdaea0; }
  &:active { transform: translateY(3px); box-shadow: 0 1px 0 0 #bdaea0; }
}

.btn-ai-primary {
  color: #fff;
  background: linear-gradient(180deg, #3dd4c6 0%, #19c8b9 100%);
  border-color: #19c8b9;
  box-shadow: 0 5px 0 0 #11a89b;

  &:hover { box-shadow: 0 7px 0 0 #11a89b; }
  &:active { box-shadow: 0 1px 0 0 #11a89b; }
}

.btn-ai-lg { padding: 16px 32px; font-size: 17px; }
.btn-ai-sm { padding: 8px 16px; font-size: 13px; box-shadow: 0 3px 0 0 #bdaea0; }

/* Hero */
.hero {
  position: relative;
  padding: 48px 40px 60px;
  max-width: 1280px;
  margin: 0 auto;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 60px;
  align-items: center;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #fff;
  border-radius: 999px;
  color: #11a89b;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 2px;
  box-shadow: 0 2px 4px 0 rgba(61, 52, 40, 0.06);
}

.hero-tag-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #19c8b9;
  box-shadow: 0 0 0 3px rgba(25, 200, 185, 0.2);
}

.hero-title {
  font-size: clamp(72px, 11vw, 156px);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.04em;
  margin: 18px 0;
  color: #fff9e6;
  text-shadow:
    0 2px 0 #f0d29a,
    0 4px 0 #d4ad6b,
    0 6px 0 #b8915a,
    0 10px 18px rgba(110, 80, 40, 0.25);
}

.hero-title-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.hero-sub {
  max-width: 460px;
  font-size: 16px;
  line-height: 1.75;
  color: #794f27;
  font-weight: 500;
  margin-bottom: 28px;

  b { color: #11a89b; font-weight: 700; }
}

.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

.hero-avatar-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

.hero-avatar {
  width: min(380px, 80vw);
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(180deg, #fff 0%, #fff7e0 100%);
  border: 6px solid #fff;
  box-shadow:
    0 0 0 4px #e6f9f6,
    0 18px 40px rgba(110, 80, 40, 0.22);
  position: relative;
  z-index: 2;
  overflow: hidden;
  display: grid;
  place-items: center;

  img { width: 92%; height: 92%; object-fit: cover; border-radius: 50%; }
}

.hero-name {
  margin-top: 18px;
  padding: 6px 22px;
  background: #fdfdf5;
  border-radius: 24px 30px 28px 26px / 26px 24px 30px 28px;
  font-weight: 800;
  font-size: 16px;
  box-shadow: 0 2px 4px 0 rgba(61, 52, 40, 0.06);
  border: 2px solid #f0e8d8;
}

/* Decorations */
.deco { position: absolute; }
.deco-leaf-1 { top: -10px; right: -10px; width: 56px; transform: rotate(20deg); }
.deco-leaf-2 { bottom: -12px; left: -18px; width: 48px; transform: rotate(-22deg); }

.deco-bell {
  position: absolute;
  top: 40px;
  left: -50px;
  background: #f7cd67;
  border: 3px solid #b88e2a;
  color: #6b4f1a;
  font-weight: 800;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 999px;
  box-shadow: 0 3px 0 0 #b88e2a;
  display: flex;
  align-items: center;
  gap: 6px;
  transform: rotate(-6deg);
}

.deco-streak {
  position: absolute;
  bottom: 30px;
  right: -40px;
  background: #fff;
  border: 3px solid #f8a6b2;
  color: #c05f76;
  font-weight: 800;
  padding: 8px 16px;
  border-radius: 999px;
  box-shadow: 0 3px 0 0 #d97a8c;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transform: rotate(8deg);
}

/* Stats */
.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin: 32px auto 0;
  max-width: 1180px;
  padding: 0 40px;
}

.stat {
  background: #fdfdf5;
  border: 2px solid #e8e2d6;
  border-radius: 24px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.2s;

  &:hover { transform: translateY(-3px); }
}

.stat-ico {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.stat-ico-mint { background: #e6f9f6; color: #11a89b; }
.stat-ico-yellow { background: #fff2ba; color: #9f7c00; }
.stat-ico-pink { background: #ffe0e6; color: #c05f76; }
.stat-ico-blue { background: #dfe9ff; color: #6a86d8; }

.stat-num {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  color: #794f27;
  letter-spacing: -0.02em;

  small { font-size: 12px; font-weight: 700; color: #9f927d; margin-left: 2px; }
}

.stat-lbl { font-size: 12px; color: #9f927d; font-weight: 600; margin-top: 4px; }

/* Section */
.section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 60px 40px 20px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 20px;
}

.section-eyebrow {
  font-size: 11px;
  letter-spacing: 4px;
  font-weight: 800;
  color: #11a89b;
}

.section-title {
  margin: 6px 0 0;
  font-size: 36px;
  font-weight: 900;
  color: #794f27;
  letter-spacing: -0.02em;
}

.section-sub { color: #9f927d; font-size: 14px; font-weight: 600; max-width: 480px; }

/* Modules grid */
.modules { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }

.mod {
  position: relative;
  border-radius: 24px;
  padding: 22px 22px 20px;
  height: 200px;
  display: flex;
  flex-direction: column;
  color: #fff;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 4px 0 0 rgba(0, 0, 0, 0.08), 0 3px 10px 0 rgba(61, 52, 40, 0.1);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(120% 80% at 100% 0%, rgba(255, 255, 255, 0.35) 0%, transparent 50%);
    pointer-events: none;
  }

  &:hover { transform: translateY(-6px) rotate(-1deg); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18), 0 8px 24px 0 rgba(114, 93, 66, 0.15); }
}

.mod-pink   { background: #f8a6b2; box-shadow: 0 4px 0 0 #d6788a, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-yellow { background: #f7cd67; color: #6b4f1a; box-shadow: 0 4px 0 0 #c89a3a, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-blue   { background: #889df0; box-shadow: 0 4px 0 0 #5e74cd, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-teal   { background: #82d5bb; box-shadow: 0 4px 0 0 #56a98e, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-orange { background: #e59266; box-shadow: 0 4px 0 0 #b46943, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-purple { background: #b77dee; box-shadow: 0 4px 0 0 #8a52c2, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-green  { background: #8ac68a; box-shadow: 0 4px 0 0 #5c9c5c, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-peach  { background: #e18c6f; box-shadow: 0 4px 0 0 #b46243, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-lime   { background: #d1da49; color: #3d5a1a; box-shadow: 0 4px 0 0 #a3ad28, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-red    { background: #fc736d; box-shadow: 0 4px 0 0 #c84a4a, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-brown  { background: #9a835a; box-shadow: 0 4px 0 0 #6f5d3b, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }
.mod-mint   { background: #19c8b9; box-shadow: 0 4px 0 0 #11a89b, 0 3px 10px 0 rgba(61, 52, 40, 0.1); }

.mod-ico {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 18px;
  margin-bottom: auto;
}

.mod-title { font-size: 19px; font-weight: 800; margin-top: 12px; letter-spacing: 0.02em; }
.mod-sub { font-size: 12px; opacity: 0.85; font-weight: 600; margin-top: 4px; }

.mod-pill {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: 0.5px;
}

.mod-yellow .mod-pill,
.mod-lime .mod-pill {
  background: rgba(0, 0, 0, 0.15);
  color: inherit;
}

/* About */
.about {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 18px;
  align-items: stretch;
}

.about-card {
  background: #fdfdf5;
  border: 2px solid #e8e2d6;
  border-radius: 32px 38px 30px 36px / 36px 30px 38px 32px;
  padding: 24px;
  position: relative;

  h4 { margin: 0 0 10px; font-size: 17px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
  p { margin: 0; font-size: 13px; color: #9f927d; line-height: 1.75; }
}

.about-stamp {
  position: absolute;
  top: -14px;
  right: 20px;
  width: 52px;
  height: 52px;
  background: #f7cd67;
  border: 3px solid #c89a3a;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #6b4f1a;
  font-size: 16px;
  box-shadow: 0 3px 0 0 #c89a3a;
  transform: rotate(-8deg);
}

.about-stamp-teal { background: #82d5bb; border-color: #56a98e; box-shadow: 0 3px 0 0 #56a98e; color: #1e4d3f; }
.about-stamp-pink { background: #f8a6b2; border-color: #d6788a; box-shadow: 0 3px 0 0 #d6788a; color: #fff; }

.about-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.about-list-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;

  span:first-child { color: #9f927d; font-weight: 600; }
  span:last-child { font-weight: 800; color: #794f27; }
}

.tags-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }

.tag-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f0e8d8;
  color: #794f27;
  font-size: 12px;
  font-weight: 700;
}

.tag-mint { background: #e6f9f6; color: #11a89b; }
.tag-yellow { background: #fff2ba; color: #9f7c00; }
.tag-pink { background: #ffe0e6; color: #c05f76; }
.tag-blue { background: #dfe9ff; color: #6a86d8; }

/* Island closing strip */
.island {
  margin-top: 60px;
  padding: 80px 40px 60px;
}

.island-inner {
  max-width: 1280px;
  margin: 0 auto;
  background: linear-gradient(180deg, #fdfdf5 0%, #f0e8d8 100%);
  border-radius: 60px 80px 60px 80px / 80px 60px 80px 60px;
  border: 3px solid #e8e2d6;
  padding: 50px 40px;
  text-align: center;
  position: relative;
  box-shadow: 0 8px 0 0 #d6cdb6;
}

.island-title {
  font-size: 38px;
  line-height: 1.1;
  color: #794f27;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
  font-weight: 900;
}

.island-sub {
  color: #9f927d;
  font-weight: 600;
  max-width: 540px;
  margin: 0 auto 24px;
}

.island-actions { display: inline-flex; gap: 14px; }

/* Footer */
.foot {
  text-align: center;
  padding: 24px 0 60px;
  color: #9f927d;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 1200px) {
  .modules { grid-template-columns: repeat(3, 1fr); }
  .hero-stats { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; }
  .about { grid-template-columns: 1fr; }
  .modules { grid-template-columns: repeat(2, 1fr); }
  .nav { padding: 12px 20px; gap: 12px; }
  .nav-links { display: none; }
}
</style>
