<template>
  <div class="card chart-card">
    <div class="card-head">
      <div>
        <div class="card-title">近 30 日字数走势</div>
        <div class="card-sub" v-if="!loading && trend.length">
          日均 {{ avgWords.toLocaleString() }} 字 · 峰值 {{ peakItem.words.toLocaleString() }} 字 ({{ peakItem.date.slice(5) }})
        </div>
      </div>
      <div v-if="!loading" class="card-meta">
        <span class="dot dot-green" /> 字数
      </div>
    </div>
    <div v-if="loading" class="chart-skeleton">
      <el-skeleton-item variant="rect" style="width:100%;height:160px;border-radius:12px;" />
    </div>
    <svg v-else :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`" class="chart-svg">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#19c8b9" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#19c8b9" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      <line
        v-for="line in gridLines"
        :key="line"
        :x1="PAD.l"
        :x2="CHART_WIDTH - PAD.r"
        :y1="line"
        :y2="line"
        stroke="#eef2ee"
        stroke-dasharray="2 4"
      />
      <path v-if="areaPath" :d="areaPath" fill="url(#trendFill)" />
      <path v-if="linePath" :d="linePath" fill="none" stroke="#19c8b9" stroke-width="2.5" />
      <g v-if="peakPoint">
        <circle :cx="peakPoint.x" :cy="peakPoint.y" r="5" fill="#fff" stroke="#11a89b" stroke-width="2" />
        <text :x="peakPoint.x" :y="peakPoint.y - 10" text-anchor="middle" class="peak-label">
          {{ peakItem.words.toLocaleString() }}
        </text>
      </g>
      <text
        v-for="tick in ticks"
        :key="tick.label + tick.x"
        :x="tick.x"
        :y="CHART_HEIGHT - 6"
        text-anchor="middle"
        class="axis-label"
      >
        {{ tick.label }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DashboardTrendItem } from "@/types/api/dashboard-stats";

const props = defineProps<{
  trend: DashboardTrendItem[];
  loading: boolean;
}>();

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const PAD = { l: 8, r: 8, t: 18, b: 22 };
const innerWidth = CHART_WIDTH - PAD.l - PAD.r;
const innerHeight = CHART_HEIGHT - PAD.t - PAD.b;

const peakItem = computed(() => {
  if (!props.trend?.length) return { date: "", words: 0 };
  return props.trend.reduce((m, d) => (d.words > m.words ? d : m), props.trend[0]);
});

const avgWords = computed(() => {
  if (!props.trend?.length) return 0;
  const total = props.trend.reduce((s, d) => s + d.words, 0);
  return Math.round(total / props.trend.length);
});

const points = computed(() => {
  const trend = props.trend ?? [];
  if (trend.length < 2) return [];
  const max = Math.max(...trend.map((d) => d.words), 1);
  return trend.map((d, i) => ({
    date: d.date,
    words: d.words,
    x: PAD.l + (i / (trend.length - 1)) * innerWidth,
    y: PAD.t + innerHeight - (d.words / max) * innerHeight,
  }));
});

const linePath = computed(() => smoothPath(points.value));

const areaPath = computed(() => {
  if (!linePath.value) return "";
  return `${linePath.value} L ${PAD.l + innerWidth} ${PAD.t + innerHeight} L ${PAD.l} ${PAD.t + innerHeight} Z`;
});

const gridLines = computed(() => [0.25, 0.5, 0.75].map((p) => PAD.t + innerHeight * p));

const ticks = computed(() => {
  const trend = props.trend ?? [];
  return [0, 6, 12, 18, 24, 29]
    .filter((i) => i < trend.length && trend.length > 1)
    .map((i) => ({
      x: PAD.l + (i / (trend.length - 1)) * innerWidth,
      label: trend[i].date.slice(5),
    }));
});

const peakPoint = computed(() => {
  if (!points.value.length) return null;
  return points.value.find((p) => p.date === peakItem.value.date) ?? null;
});

function smoothPath(pts: Array<{ x: number; y: number }>) {
  if (pts.length < 2) return "";

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
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

.card-meta {
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text-2, #9f927d);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-green {
  background: var(--ai-primary-active, #11a89b);
}

.chart-skeleton { padding: 4px 0; }

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.axis-label {
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  fill: var(--ai-text-2, #9f927d);
}

.peak-label {
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  fill: var(--ai-primary-active, #11a89b);
}
</style>
