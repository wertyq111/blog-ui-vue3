<template>
  <div class="card chart-card">
    <div class="card-head">
      <div>
        <div class="card-title">工作时段分布</div>
        <div class="card-sub" v-if="!loading && hourDist.length">
          高产时段 {{ peakHour.toString().padStart(2, "0") }}:00 · 平均 {{ avgPerHour }} 字/时
        </div>
      </div>
    </div>
    <div v-if="loading" class="chart-skeleton">
      <el-skeleton-item variant="rect" style="width: 100%; height: 200px; border-radius: 12px" />
    </div>
    <div v-else class="clock-wrap">
      <svg :viewBox="`0 0 ${size} ${size}`" class="clock-svg">
        <!-- background dial track: 24 faint spokes so the clock always has a frame -->
        <line
          v-for="d in clockData"
          :key="`track-${d.h}`"
          :x1="d.x1"
          :y1="d.y1"
          :x2="d.tx2"
          :y2="d.ty2"
          stroke="#ece5d6"
          stroke-width="5"
          stroke-linecap="round"
          opacity="0.6"
        />
        <!-- hour ticks (radial bars) drawn on top of the track -->
        <line
          v-for="d in clockData"
          v-show="d.value > 0"
          :key="d.h"
          :x1="d.x1"
          :y1="d.y1"
          :x2="d.x2"
          :y2="d.y2"
          :stroke="d.isPeak ? '#11a89b' : d.isWindow ? '#19c8b9' : '#9adcd1'"
          stroke-width="6"
          stroke-linecap="round"
        />
        <!-- 0 / 6 / 12 / 18 labels -->
        <text
          v-for="lbl in axisLabels"
          :key="lbl.h"
          :x="lbl.x"
          :y="lbl.y"
          text-anchor="middle"
          class="clock-label"
        >
          {{ lbl.text }}
        </text>
        <!-- center stat -->
        <text :x="cx" :y="cy - 4" text-anchor="middle" class="clock-center-big">
          {{ peakHour }}
          <tspan class="clock-center-unit">时</tspan>
        </text>
        <text :x="cx" :y="cy + 18" text-anchor="middle" class="clock-center-sm">
          {{ peakPeriod }}最有产出
        </text>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  hourDist: number[];
  loading: boolean;
}>();

const size = 260;
const cx = size / 2;
const cy = size / 2;
const innerR = 56;
const outerR = 112;

// 表盘只展示工作时段 8:00–18:00（含），整圈 = 这 11 个小时
const winStart = 8;
const winEnd = 18;
const winHours = (() => {
  const arr: number[] = [];
  for (let h = winStart; h <= winEnd; h++) arr.push(h);
  return arr;
})();

const peakHour = computed(() => {
  if (!props.hourDist?.length) return 0;
  let maxVal = 0;
  let maxH = 0;
  props.hourDist.forEach((v, i) => {
    if (v > maxVal) {
      maxVal = v;
      maxH = i;
    }
  });
  return maxH;
});

const peakPeriod = computed(() => {
  const h = peakHour.value;
  if (h >= 6 && h < 12) return "上午";
  if (h >= 12 && h < 14) return "中午";
  if (h >= 14 && h < 18) return "下午";
  if (h >= 18 && h < 22) return "晚上";
  return "深夜";
});

const avgPerHour = computed(() => {
  if (!props.hourDist?.length) return 0;
  const total = props.hourDist.reduce((s, v) => s + v, 0);
  return Math.round(total / 24);
});

const clockData = computed(() => {
  const dist = props.hourDist?.length === 24 ? props.hourDist : new Array(24).fill(0);
  const count = winHours.length;
  // 柱长按窗口内最大值缩放，让表盘用满半径（范围外数据不参与绘制）
  const max = Math.max(...winHours.map((h) => dist[h] ?? 0), 1);
  const peak = peakHour.value;

  return winHours.map((h, idx) => {
    const value = dist[h] ?? 0;
    const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
    // sqrt 压缩离群值（如批量补录造成的单点畸高），并给非零小时一个最小可见长度
    const ratio = value > 0 ? Math.sqrt(value / max) : 0;
    const minLen = value > 0 ? 8 : 0;
    const len = innerR + minLen + ratio * (outerR - innerR - minLen);
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * len;
    const y2 = cy + Math.sin(angle) * len;
    // 底刻度环端点：始终画到外圈，让表盘空数据时也成形
    const tx2 = cx + Math.cos(angle) * outerR;
    const ty2 = cy + Math.sin(angle) * outerR;
    const isPeak = h === peak;
    const isWindow = h >= 14 && h <= 16;
    return { h, value, x1, y1, x2, y2, tx2, ty2, isPeak, isWindow };
  });
});

const axisLabels = computed(() => {
  const count = winHours.length;
  return [8, 11, 14, 18].map((h) => {
    const idx = winHours.indexOf(h);
    const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
    const r = outerR + 14;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r + 4;
    return { h, x, y, text: h.toString().padStart(2, "0") };
  });
});
</script>

<style lang="scss" scoped>
.card {
  background: var(--ai-paper, #fdfdf5);
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 24px;
  padding: 18px 22px;
  position: relative;
}

.chart-card {
  display: flex;
  flex-direction: column;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ai-text, #794f27);
}

.card-sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text-2, #9f927d);
  margin-top: 3px;
}

.chart-skeleton {
  padding: 4px 0;
}

.clock-wrap {
  display: grid;
  place-items: center;
  padding: 10px 0;
  flex: 1;
}

.clock-svg {
  width: 100%;
  max-width: 260px;
}

.clock-label {
  fill: var(--ai-text-2, #9f927d);
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
}

.clock-center-big {
  font-size: 30px;
  font-weight: 800;
  fill: var(--ai-text, #794f27);
  font-family: "Mochiy Pop One", "M PLUS Rounded 1c", Nunito, "Noto Sans SC", sans-serif;
}

.clock-center-unit {
  font-size: 12px;
  fill: var(--ai-text-2, #9f927d);
  font-weight: 700;
  font-family: inherit;
}

.clock-center-sm {
  font-size: 10.5px;
  fill: var(--ai-text-2, #9f927d);
  font-weight: 700;
  font-family: inherit;
}
</style>
