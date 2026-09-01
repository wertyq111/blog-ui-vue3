<template>
  <div class="card chart-card">
    <div class="card-head">
      <div>
        <div class="card-title">近 30 日字数走势</div>
        <div class="card-sub" v-if="!loading && trend.length">
          日均 {{ avgWords.toLocaleString() }} 字 · 峰值 {{ peakItem.words.toLocaleString() }} 字
          ({{ peakItem.date.slice(5) }})
        </div>
      </div>
      <div v-if="!loading" class="card-meta">
        <span class="dot dot-green" />
        字数
      </div>
    </div>
    <div v-if="loading" class="chart-skeleton">
      <el-skeleton-item variant="rect" style="width: 100%; height: 160px; border-radius: 12px" />
    </div>
    <ECharts v-else :options="chartOptions" width="100%" height="200px" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { DashboardTrendItem } from "@/types/api/dashboard-stats";

const props = defineProps<{
  trend: DashboardTrendItem[];
  loading: boolean;
}>();

// x 轴只标注这些下标的日期，沿用原 SVG 版的刻度位置
const TICK_IDX = [0, 6, 12, 18, 24, 29];

const peakItem = computed(() => {
  if (!props.trend?.length) return { date: "", words: 0 };
  return props.trend.reduce((m, d) => (d.words > m.words ? d : m), props.trend[0]);
});

const avgWords = computed(() => {
  if (!props.trend?.length) return 0;
  const total = props.trend.reduce((s, d) => s + d.words, 0);
  return Math.round(total / props.trend.length);
});

const peakIdx = computed(() => {
  const trend = props.trend ?? [];
  if (!trend.length) return -1;
  let idx = 0;
  trend.forEach((d, i) => {
    if (d.words > trend[idx].words) idx = i;
  });
  return idx;
});

const chartOptions = computed(() => {
  const trend = props.trend ?? [];
  const peak = peakIdx.value;
  const peakWords = peakItem.value.words;

  return {
    grid: { left: 6, right: 14, top: 26, bottom: 22 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fffef8",
      borderColor: "#e8e2d6",
      borderWidth: 1,
      padding: [6, 10],
      textStyle: { color: "#794f27", fontWeight: 600, fontSize: 12 },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        return `${p.axisValue}<br/>字数 <b>${Number(p.value).toLocaleString()}</b>`;
      },
    },
    xAxis: {
      type: "category",
      data: trend.map((d) => d.date.slice(5)),
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#9f927d",
        fontSize: 10,
        fontWeight: 700,
        interval: (index: number) => TICK_IDX.includes(index),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      splitNumber: 3,
      splitLine: { lineStyle: { color: "#eef2ee", type: "dashed" } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { color: "#19c8b9", width: 2.5 },
        itemStyle: { color: "#11a89b" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(25,200,185,0.35)" },
              { offset: 1, color: "rgba(25,200,185,0.02)" },
            ],
          },
        },
        emphasis: { focus: "series" },
        data: trend.map((d, i) =>
          i === peak
            ? {
                value: d.words,
                symbol: "circle",
                symbolSize: 10,
                itemStyle: { color: "#ffffff", borderColor: "#11a89b", borderWidth: 2 },
                label: {
                  show: true,
                  position: "top",
                  formatter: peakWords.toLocaleString(),
                  color: "#11a89b",
                  fontWeight: 800,
                  fontSize: 11,
                },
              }
            : d.words
        ),
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.card {
  background: var(--ai-paper, var(--ai-paper));
  border: 2px solid var(--ai-border, var(--ai-border));
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
  color: var(--ai-text, var(--ai-text));
}

.card-sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text-2, var(--ai-text-2));
  margin-top: 3px;
}

.card-meta {
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text-2, var(--ai-text-2));
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
  background: var(--ai-primary-active, var(--ai-primary-active));
}

.chart-skeleton {
  padding: 4px 0;
}
</style>
