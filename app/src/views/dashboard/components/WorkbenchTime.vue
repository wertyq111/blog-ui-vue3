<template>
  <div class="wb-time">
    <!-- 边框即"豆线"：贪吃豆沿圆角矩形顺时针巡回，dashoffset 同步收缩制造"被吃掉"效果 -->
    <svg class="wb-time__border" viewBox="0 0 300 90" aria-hidden="true">
      <rect class="wb-time__track" x="1.5" y="1.5" width="297" height="87" rx="16.5" pathLength="100">
        <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="10s" repeatCount="indefinite" />
      </rect>
      <g class="wb-time__pac">
        <path fill="#7cba70" stroke="#4a8a36" stroke-width="1.5" stroke-linejoin="round" d="M0 0 L6.1 -3.5 A7 7 0 1 0 6.1 3.5 Z">
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
// 边框改由 SVG 描边承担，供贪吃豆"啃食"
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
}

.wb-time__border {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.wb-time__track {
  fill: none;
  stroke: #d4cfc3;
  stroke-width: 3;
  stroke-dasharray: 100;
  stroke-linecap: round;
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
