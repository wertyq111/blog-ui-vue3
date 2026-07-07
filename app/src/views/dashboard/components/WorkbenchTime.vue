<template>
  <div class="wb-time">
    <!-- 边框即"豆链"：4 色糖果豆沿圆角矩形排列，贪吃豆顺时针巡回，
         mask 内的描边随 dashoffset 收缩，豆子跟着被逐颗"吃掉" -->
    <svg class="wb-time__border" viewBox="0 0 300 90" aria-hidden="true">
      <defs>
        <mask id="wb-time-eat-mask">
          <rect
            x="1.5"
            y="1.5"
            width="297"
            height="87"
            rx="16.5"
            pathLength="100"
            fill="none"
            stroke="#fff"
            stroke-width="14"
            stroke-dasharray="100"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="10s" repeatCount="indefinite" />
          </rect>
        </mask>
      </defs>
      <g mask="url(#wb-time-eat-mask)">
        <rect
          v-for="(color, idx) in BEAD_COLORS"
          :key="color"
          class="wb-time__beads"
          x="1.5"
          y="1.5"
          width="297"
          height="87"
          rx="16.5"
          pathLength="100"
          :stroke="color"
          :stroke-dashoffset="-(idx * 5)"
        />
      </g>
      <g class="wb-time__pac">
        <path
          class="wb-time__pac-body"
          :style="pacStyle"
          stroke-width="1.5"
          stroke-linejoin="round"
          d="M0 0 L6.1 -3.5 A7 7 0 1 0 6.1 3.5 Z"
        >
          <animate
            attributeName="d"
            values="M0 0 L6.1 -3.5 A7 7 0 1 0 6.1 3.5 Z;M0 0 L6.9 -0.8 A7 7 0 1 0 6.9 0.8 Z;M0 0 L6.1 -3.5 A7 7 0 1 0 6.1 3.5 Z"
            dur="0.4s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="1.2" cy="-3.6" r="1" fill="#3f3a36" />
        <animateMotion
          dur="10s"
          repeatCount="indefinite"
          rotate="auto"
          path="M18 1.5 H282 A16.5 16.5 0 0 1 298.5 18 V72 A16.5 16.5 0 0 1 282 88.5 H18 A16.5 16.5 0 0 1 1.5 72 V18 A16.5 16.5 0 0 1 18 1.5"
        />
      </g>
    </svg>

    <div class="wb-time__date">
      <span class="wb-time__weekday">{{ weekday }}</span>
      <span class="wb-time__monthday">{{ monthDay }}</span>
    </div>
    <div class="wb-time__clock">
      <span>{{ hh }}</span>
      <span class="wb-time__colon">:</span>
      <span>{{ mm }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(defineProps<{ weather?: string }>(), {
  weather: "partlyCloudy",
});

// 边框糖果豆配色（NookPhone 应用色板）
const BEAD_COLORS = ["#f8a6b2", "#f7cd67", "#82d5bb", "#b77dee"];

// 贪吃豆随天气换装：body 主体色 / stroke 描边色
const PAC_COLORS: Record<string, { body: string; stroke: string }> = {
  sunny: { body: "#f7cd67", stroke: "#d5a830" },
  partlyCloudy: { body: "#7cba70", stroke: "#4a8a36" },
  cloudy: { body: "#b8c2cc", stroke: "#7f8b96" },
  rain: { body: "#889df0", stroke: "#5570d6" },
  heavyRain: { body: "#6c85e0", stroke: "#4157b8" },
  thunder: { body: "#b77dee", stroke: "#8a54c4" },
  snow: { body: "#dff0fa", stroke: "#9ec7e6" },
  haze: { body: "#cbbf9e", stroke: "#a08d64" },
  wind: { body: "#82d5bb", stroke: "#47a98a" },
  rainbow: { body: "#f8a6b2", stroke: "#d6788a" },
  sakura: { body: "#ffccd5", stroke: "#f294a5" },
  night: { body: "#f3e2a0", stroke: "#d8c280" },
};

const pacStyle = computed(() => {
  const pal = PAC_COLORS[props.weather] ?? PAC_COLORS.partlyCloudy;
  return { fill: pal.body, stroke: pal.stroke };
});

const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

const now = ref(new Date());
let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  window.clearInterval(timer);
});

const weekday = computed(() => WEEKDAYS[now.value.getDay()]);
const monthDay = computed(() => `${now.value.getMonth() + 1}月${now.value.getDate()}日`);
const hh = computed(() => String(now.value.getHours()).padStart(2, "0"));
const mm = computed(() => String(now.value.getMinutes()).padStart(2, "0"));
</script>

<style scoped lang="scss">
// 动森 HUD 时钟（中文版）：视觉参数沿用 animal-island-vue Time 规范，
// 边框改为 4 色糖果豆链，供贪吃豆巡回啃食
.wb-time {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  width: 300px;
  height: 90px;
  background: linear-gradient(180deg, #fff 0%, #f8f8f0 100%);
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(121, 79, 39, 0.1);
}

.wb-time__border {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

// 豆链：dash 0.1 + gap 19.9（pathLength 100 归一化）= 每色 5 颗、四色交错共 20 颗
.wb-time__beads {
  fill: none;
  stroke-width: 5;
  stroke-dasharray: 0.1 19.9;
  stroke-linecap: round;
}

.wb-time__pac-body {
  transition:
    fill 0.6s ease,
    stroke 0.6s ease;
}

.wb-time__date {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  padding-right: 18px;
  border-right: 3px solid rgba(159, 146, 125, 0.35);
}

.wb-time__weekday {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #6fba2c;
}

.wb-time__monthday {
  font-size: 20px;
  font-weight: 800;
  color: #8b7355;
}

.wb-time__clock {
  display: flex;
  align-items: center;
  font-size: 42px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #8b7355;
}

.wb-time__colon {
  position: relative;
  top: -0.08em;
  margin: 0 2px;
  animation: wb-time-blink 1s step-end infinite;
}

@keyframes wb-time-blink {
  50% {
    opacity: 0;
  }
}
</style>
