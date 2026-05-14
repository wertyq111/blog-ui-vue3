<template>
  <div class="wb-chart-card">
    <div class="wb-chart-card__header">
      <span class="wb-chart-card__title">近 30 天字数趋势</span>
    </div>
    <div v-if="loading" class="wb-chart-card__skeleton">
      <el-skeleton-item variant="rect" style="width:100%;height:140px;border-radius:8px;" />
    </div>
    <div v-else ref="chartEl" class="wb-chart-card__body"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { DashboardTrendItem } from "@/types/api/dashboard-stats";

echarts.use([SVGRenderer, LineChart, GridComponent, TooltipComponent]);

const props = defineProps<{
  trend: DashboardTrendItem[];
  loading: boolean;
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function buildOption(trend: DashboardTrendItem[]) {
  const dates = trend.map((d) => d.date.slice(5));
  const values = trend.map((d) => d.words);
  return {
    tooltip: {
      trigger: "axis",
      formatter: (params: any[]) => `${params[0].axisValue}<br/>字数：${params[0].value.toLocaleString()}`,
    },
    grid: { top: 10, right: 8, bottom: 22, left: 42, containLabel: false },
    xAxis: {
      type: "category",
      data: dates,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "rgba(150,163,150,0.2)" } },
      axisLabel: { color: "#94a38a", fontSize: 10, interval: 6 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(150,163,150,0.12)", type: "dashed" } },
      axisLabel: { color: "#94a38a", fontSize: 10 },
    },
    series: [
      {
        type: "line",
        data: values,
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#5fa979", width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(95,169,121,0.28)" },
            { offset: 1, color: "rgba(95,169,121,0.02)" },
          ]),
        },
      },
    ],
  };
}

function initChart() {
  if (!chartEl.value) return;
  if (!chart) chart = echarts.init(chartEl.value, null, { renderer: "svg" });
  chart.setOption(buildOption(props.trend));
}

watch(() => props.trend, (v) => {
  if (v && chartEl.value) {
    if (!chart) chart = echarts.init(chartEl.value, null, { renderer: "svg" });
    chart.setOption(buildOption(v));
  }
});

onMounted(() => { if (!props.loading) initChart(); });
onBeforeUnmount(() => { chart?.dispose(); });
</script>

<style lang="scss" scoped>
.wb-chart-card {
  padding: 18px 20px;
  background: var(--cyber-panel-strong);
  border: 1px solid var(--cyber-border);
  border-radius: 18px;

  &__header {
    margin-bottom: 12px;
  }

  &__title {
    font-size: 13px;
    font-weight: 700;
    color: var(--cyber-text);
  }

  &__body {
    width: 100%;
    height: 150px;
  }

  &__skeleton { padding: 4px 0; }
}
</style>
