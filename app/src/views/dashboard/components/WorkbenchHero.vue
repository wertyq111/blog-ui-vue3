<template>
  <div :class="['wb-hero', 'weather-mode-' + currentWeather]">
    <WeatherScene :weather="currentWeather" />

    <!-- 顶部毛玻璃无缝跑马灯滚动胶囊 (3D HSL 质感) -->
    <div class="hero-top-scroller">
      <div class="hero-top-scroller__track">
        <div class="hero-top-scroller__content">
          <span class="scroller-date">{{ todayText }}</span>
          <span class="scroller-divider">·</span>
          <span class="scroller-weather">
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="scroller-weather-icon"
            >
              <path d="M7 18a4 4 0 010-8 6 6 0 0111-2 4 4 0 011 8H7z" />
            </svg>
            {{ weatherText || "正在连线岛屿气象台..." }}
          </span>
        </div>
        <!-- 复制一份用于无缝循环衔接 -->
        <div class="hero-top-scroller__content" aria-hidden="true">
          <span class="scroller-date">{{ todayText }}</span>
          <span class="scroller-divider">·</span>
          <span class="scroller-weather">
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="scroller-weather-icon"
            >
              <path d="M7 18a4 4 0 010-8 6 6 0 0111-2 4 4 0 011 8H7z" />
            </svg>
            {{ weatherText || "正在连线岛屿气象台..." }}
          </span>
        </div>
      </div>
    </div>

    <div class="weather-picker" aria-label="切换天气动画">
      <button
        v-for="weather in WEATHER_PRESETS"
        :key="weather.key"
        type="button"
        :class="['weather-pick-btn', { 'weather-pick-btn-active': weather.key === currentWeather }]"
        :title="weather.label"
        @click="selectWeather(weather.key)"
      >
        {{ weather.emoji }}
      </button>
    </div>

    <!-- Leaf decorations -->
    <svg class="hero-leaf-1" viewBox="0 0 80 80">
      <path
        d="M5 75c0-30 25-65 70-65 0 45-35 70-70 65z"
        fill="#7cba70"
        stroke="#4a8a36"
        stroke-width="2"
      />
      <path d="M5 75q35-25 70-65" stroke="#4a8a36" stroke-width="1.5" fill="none" />
    </svg>
    <svg class="hero-leaf-2" viewBox="0 0 80 80">
      <path
        d="M75 5c0 30-25 65-70 65 0-45 35-70 70-65z"
        fill="#d1da49"
        stroke="#a3ad28"
        stroke-width="2"
      />
    </svg>

    <!-- Character mascot -->
    <svg class="hero-char" viewBox="0 0 120 140">
      <ellipse cx="60" cy="105" rx="46" ry="32" fill="#5a3a18" opacity="0.1" />
      <path
        d="M22 80 Q22 30 60 30 Q98 30 98 80 L98 130 L22 130 Z"
        fill="url(#heroBodyGrad)"
        stroke="#d5a830"
        stroke-width="2"
      />
      <defs>
        <linearGradient id="heroBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffe48a" />
          <stop offset="1" stop-color="#f7cd67" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="22" r="8" fill="#f8a6b2" stroke="#d6788a" stroke-width="1.5" />
      <circle cx="60" cy="22" r="3" fill="#fff2ba" />
      <circle cx="44" cy="62" r="6" fill="#fff" />
      <circle cx="76" cy="62" r="6" fill="#fff" />
      <circle cx="46" cy="64" r="3" fill="#25292f" />
      <circle cx="78" cy="64" r="3" fill="#25292f" />
      <circle cx="47" cy="63" r="1" fill="#fff" />
      <circle cx="79" cy="63" r="1" fill="#fff" />
      <ellipse cx="36" cy="78" rx="6" ry="3" fill="#f8a6b2" opacity="0.7" />
      <ellipse cx="84" cy="78" rx="6" ry="3" fill="#f8a6b2" opacity="0.7" />
      <path
        d="M52 84 Q60 90 68 84"
        stroke="#5a3a18"
        stroke-width="2.5"
        fill="none"
        stroke-linecap="round"
      />
      <circle cx="106" cy="78" r="8" fill="#f7cd67" stroke="#d5a830" stroke-width="2" />
    </svg>

    <!-- Content row -->
    <div class="hero-row">
      <div class="hero-text">
        <span class="hero-eyebrow">DEVELOP WORKSPACE</span>
        <div class="hero-greet-row">
          <h1 class="hero-title">
            {{ greeting }}，
            <em>{{ nickname }}</em>
          </h1>
          <WeatherAvatarFrame :src="avatarSrc" :alt="nickname" :weather="currentWeather" />
        </div>
      </div>
      <WorkbenchTime class="hero-time" :weather="currentWeather" />
      <div class="hero-actions">
        <button
          class="btn-ai btn-ai-primary"
          @click="$router.push({ path: '/develop/work-daily', query: { action: 'add' } })"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 16L15 5l3 3-11 11H4v-3z" />
          </svg>
          记录日常
        </button>
        <button
          class="btn-ai"
          @click="$router.push({ path: '/develop/work-doc', query: { action: 'add' } })"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="5" y="4" width="14" height="16" rx="2" />
            <path d="M9 8h6M9 12h6M9 16h4" />
          </svg>
          新建文档
        </button>
        <button
          class="btn-ai"
          @click="$router.push({ path: '/develop/todo', query: { action: 'add' } })"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 7h11M4 12h11M4 17h7" />
            <path d="M18 6l2 2 3-3" />
          </svg>
          新建待办
        </button>
        <button
          class="btn-ai"
          @click="$router.push({ path: '/develop/convert-path', query: { tool: 'open' } })"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 10.5L10 4l7 6.5" />
            <path d="M5 9.5V16h10V9.5" />
          </svg>
          路径转换
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useUserStore } from "@/store/modules/user";
import { resolveAvatar } from "@/utils/avatar";
import WeatherScene from "./WeatherScene.vue";
import WorkbenchTime from "./WorkbenchTime.vue";
import WeatherAvatarFrame from "./WeatherAvatarFrame.vue";
import WeatherAPI from "@/api/weather";

const userStore = useUserStore();
const nickname = computed(() => userStore.userInfo.nickname || userStore.userInfo.username || "");
const avatarSrc = computed(() =>
  resolveAvatar(userStore.userInfo.avatar, userStore.userInfo.gender)
);

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h > 6 && h <= 11) return "早上好";
  if (h > 11 && h <= 13) return "中午好";
  if (h > 13 && h <= 18) return "下午好";
  return "晚上好";
});

const todayText = computed(() => {
  const now = new Date();
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return `今天是 ${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${weekdays[now.getDay()]}`;
});

const currentWeather = ref("partlyCloudy");
const weatherText = ref("");
const weatherCity = ref("杭州市");
const DEFAULT_WEATHER_CITY_CODE = "330100";

const WEATHER_PRESETS = [
  { key: "sunny", label: "晴朗", emoji: "☀️" },
  { key: "partlyCloudy", label: "多云", emoji: "🌤️" },
  { key: "cloudy", label: "阴天", emoji: "☁️" },
  { key: "rain", label: "小雨", emoji: "🌧️" },
  { key: "heavyRain", label: "大雨", emoji: "🌧️" },
  { key: "thunder", label: "雷阵雨", emoji: "⛈️" },
  { key: "snow", label: "下雪", emoji: "🌨️" },
  { key: "haze", label: "雾霾", emoji: "🌫️" },
  { key: "wind", label: "大风", emoji: "💨" },
  { key: "rainbow", label: "彩虹", emoji: "🌈" },
  { key: "sakura", label: "樱花", emoji: "🌸" },
  { key: "night", label: "夜间", emoji: "🌙" },
] as const;

type WeatherMode = (typeof WEATHER_PRESETS)[number]["key"];

const WEATHER_MAP: Record<string, string> = {
  晴: "sunny",
  多云: "partlyCloudy",
  阴: "cloudy",
  小雨: "rain",
  中雨: "rain",
  阵雨: "rain",
  大雨: "heavyRain",
  暴雨: "heavyRain",
  雷阵雨: "thunder",
  雷暴: "thunder",
  小雪: "snow",
  中雪: "snow",
  大雪: "snow",
  暴雪: "snow",
  雨夹雪: "snow",
  雾: "haze",
  霾: "haze",
  浮尘: "haze",
  扬沙: "haze",
  沙尘暴: "haze",
};

const WEATHER_LABEL: Record<string, string> = {
  sunny: "晴朗",
  partlyCloudy: "多云",
  cloudy: "阴天",
  rain: "小雨",
  heavyRain: "大雨",
  thunder: "雷阵雨",
  snow: "下雪",
  haze: "雾霾",
  wind: "大风",
  sakura: "樱花盛开",
  rainbow: "雨后彩虹",
  night: "夜间",
};

const WEATHER_ADVICE: Record<string, string> = {
  sunny: "天气不错，保持节奏，把今天的关键事项逐个完成。",
  partlyCloudy: "云层较多，节奏放稳一点，按计划推进就很好。",
  cloudy: "天气有点闷，但很适合静下心来处理复杂任务。",
  rain: "出门别忘了带伞，通勤也可以稍微提前一点。",
  heavyRain: "雨势偏强，出门记得带伞，也留意路上时间。",
  thunder: "雷雨天气，注意出行安全，室内办公更安心。",
  snow: "天气偏冷，记得保暖，今天适合把事情稳稳推进。",
  haze: "能见度一般，出门慢一点，今天也适合静下来。",
  wind: "风有点大，关好窗户，把碎片事务集中处理掉。",
  sakura: "轻松一点，让今天的节奏和花瓣一样飘着推进。",
  rainbow: "彩虹挂在天上，今天给自己也留点慢下来的时间。",
  night: "一切都安静下来，适合做收尾、复盘和打磨细节。",
};

function selectWeather(mode: WeatherMode) {
  currentWeather.value = mode;
  weatherText.value = buildWeatherText(weatherCity.value, WEATHER_LABEL[mode] || mode, 24, mode);
}

function mapWeatherMode(raw: string, temp: number): string {
  const h = new Date().getHours();
  if (h >= 19 || h < 6) return "night";

  const month = new Date().getMonth() + 1;
  const base = WEATHER_MAP[raw] ?? "partlyCloudy";

  // 大风判定：部分天气描述含"风"字
  if (raw.includes("风")) return "wind";

  // 樱花季：3-5月 + 晴/多云 + 15~28°C
  if (
    month >= 3 &&
    month <= 5 &&
    (base === "sunny" || base === "partlyCloudy") &&
    temp >= 15 &&
    temp <= 28
  ) {
    return "sakura";
  }

  return base;
}

function buildWeatherText(city: string, rawWeather: string, temp: number, mode: string): string {
  const label = WEATHER_LABEL[mode] || rawWeather;
  const advice = WEATHER_ADVICE[mode] || "按计划推进就很好。";
  if (mode === "sakura") {
    return `${city}今天 ${temp}°C，樱花漫天。${advice}`;
  }
  if (mode === "night") {
    return `${city}夜间 ${temp}°C。${advice}`;
  }
  return `${city}今天${label}，现在大约 ${temp}°C。${advice}`;
}

function getDefaultWeather(): string {
  const h = new Date().getHours();
  if (h >= 19 || h < 6) return "night";
  return "partlyCloudy";
}

async function fetchWeather() {
  try {
    const data = await WeatherAPI.getWeather({ cityCode: DEFAULT_WEATHER_CITY_CODE });
    const temp = parseFloat(data.temperature) || 0;
    const mode = mapWeatherMode(data.weather, temp);
    weatherCity.value = data.city || weatherCity.value;
    currentWeather.value = mode;
    weatherText.value = buildWeatherText(weatherCity.value, data.weather, Math.round(temp), mode);
  } catch {
    currentWeather.value = getDefaultWeather();
  }
}

onMounted(() => {
  currentWeather.value = getDefaultWeather();
  fetchWeather();
});
</script>

<style lang="scss" scoped>
.wb-hero {
  position: relative;
  min-height: 180px;
  border-radius: 26px;
  border: 2px solid rgba(224, 216, 199, 0.82);
  padding: 24px 30px 22px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.56),
    0 5px 0 rgba(151, 135, 104, 0.18);
  margin: 0;
}

.weather-picker {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 5;
  //display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 360px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.85);
  border: 2px solid var(--cyber-border-strong, #e8e2d6);
  border-radius: 999px;
  box-shadow: 0 3px 0 0 #bdaea0;
  display: none;
}

.weather-pick-btn {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 50%;
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &:hover {
    background: rgba(230, 249, 246, 0.95);
    transform: scale(1.1);
  }
}

.weather-pick-btn-active {
  background: #19c8b9;
  box-shadow: 0 2px 0 0 #11a89b;
}

// Hero row (content layer)
.hero-row {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: 132px;
  padding-top: 18px;
}

.hero-text {
  min-width: 0;
  position: relative;
  z-index: 4;
}

// 动森 HUD 实时时钟（中文 + 贪吃豆边框），居中在问候语与操作按钮之间的空档
.hero-time {
  position: relative;
  z-index: 4;
  flex-shrink: 0;
  margin: 0 auto;
}

.hero-eyebrow {
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 800;
  color: var(--el-color-primary-dark-2, #11a89b);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 4px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 0 0 #bdaea0;

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--cyber-primary, #19c8b9);
  }
}

.hero-greet-row {
  display: flex;
  align-items: center;
  // 环显示 290px，左侧可见外沿比 200px 布局框多伸出约 18px；
  // gap 留 30px 使昵称与环之间仍有约 12px 视觉间距
  gap: 30px;
}

.hero-title {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0;
  margin: 10px 0 6px;
  color: var(--cyber-text, #794f27);

  em {
    color: var(--el-color-primary-dark-2, #11a89b);
    font-style: normal;
  }
}

.hero-top-scroller {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 5px 0;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--cyber-text, #794f27);
  max-width: min(460px, 80vw - 40px);
  overflow: hidden;
  white-space: nowrap;
}

.hero-top-scroller__track {
  display: flex;
  gap: 28px;
  animation: heroTicker 22s linear infinite;

  &:hover {
    animation-play-state: paused;
  }
}

.hero-top-scroller__content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.scroller-date {
  font-weight: 800;
}

.scroller-divider {
  color: var(--cyber-text-2, #a39580);
  opacity: 0.5;
}

.scroller-weather {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--cyber-text, #794f27);
}

.scroller-weather-icon {
  color: #f7cd67;
  animation: scroller-weather-float 2.5s ease-in-out infinite alternate;
}

@keyframes heroTicker {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(calc(-50% - 14px), 0, 0);
  }
}

@keyframes scroller-weather-float {
  0% {
    transform: translateY(0.5px);
  }
  100% {
    transform: translateY(-1px);
  }
}

.hero-actions {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-shrink: 0;
  position: relative;
  z-index: 4;
  padding-right: 26px;
}

// Island-style 3D buttons
.btn-ai {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 17px;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  background: #fff;
  color: var(--cyber-text, #794f27);
  border: 2px solid rgba(224, 216, 199, 0.88);
  border-radius: 999px;
  cursor: pointer;
  line-height: 1;
  box-shadow: 0 4px 0 0 #bdaea0;
  transition:
    transform 0.18s,
    box-shadow 0.18s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 0 #bdaea0;
  }
  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 0 #bdaea0;
  }
}

.btn-ai-primary {
  background: linear-gradient(180deg, #3dd4c6 0%, #19c8b9 100%);
  border-color: var(--cyber-primary, #19c8b9);
  color: #fff;
  box-shadow: 0 4px 0 0 #11a89b;

  &:hover {
    box-shadow: 0 6px 0 0 #11a89b;
  }
  &:active {
    box-shadow: 0 1px 0 0 #11a89b;
  }
}

// Leaf decorations
.hero-leaf-1 {
  position: absolute;
  left: -10px;
  bottom: -10px;
  width: 90px;
  opacity: 0.9;
  transform: rotate(-15deg);
  z-index: 4;
}

.hero-leaf-2 {
  position: absolute;
  right: 240px;
  bottom: 0;
  width: 60px;
  opacity: 0.9;
  z-index: 4;
}

// Character mascot
.hero-char {
  position: absolute;
  right: 16px;
  bottom: -7px;
  width: 92px;
  height: 112px;
  z-index: 4;
}

// Dark weather text overrides
.weather-mode-thunder,
.weather-mode-night,
.weather-mode-heavyRain,
.weather-mode-rain {
  .weather-picker {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 3px 0 0 rgba(0, 0, 0, 0.3);
  }

  .weather-pick-btn:not(.weather-pick-btn-active):hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .hero-title {
    color: #f8f4d8;
  }
  .hero-title em {
    color: #82d5bb;
  }
  .hero-top-scroller {
    color: #f8f4d8;

    .scroller-weather {
      color: #f8f4d8;
    }
    .scroller-divider {
      color: #829df0;
      opacity: 0.6;
    }
  }
}

@media (max-width: 1100px) {
  .hero-char {
    display: none;
  }
  .hero-time {
    display: none;
  }
  // 时钟隐藏后恢复 flex:1，让操作按钮回到贴右布局
  .hero-text {
    flex: 1;
  }
  .hero-leaf-2 {
    right: 20px;
  }
}

@media (max-width: 768px) {
  .wb-hero {
    padding: 20px;
    border-radius: 24px;
  }
  .hero-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-title {
    font-size: 24px;
  }
  .hero-actions {
    width: 100%;
  }
}
</style>
