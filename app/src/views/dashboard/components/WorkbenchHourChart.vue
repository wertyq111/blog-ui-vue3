<template>
  <div class="wb-chart-card">
    <div class="wb-chart-card__header">
      <span class="wb-chart-card__title">24h 写作分布</span>
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
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

echarts.use([SVGRenderer, BarChart, GridComponent, TooltipComponent]);

const props = defineProps<{
  hourDist: number[];
  loading: boolean;
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function buildOption(dist: number[]) {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}h`);
  const max = Math.max(...dist, 1);
  return {
    tooltip: {
      trigger: "axis",
      formatter: (p: any[]) => `${p[0].axisValue}<br/>字数：${p[0].value.toLocaleString()}`,
    },
    grid: { top: 8, right: 8, bottom: 22, left: 42 },
    xAxis: {
      type: "category",
      data: hours,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "rgba(150,163,150,0.2)" } },
      axisLabel: { color: "#94a38a", fontSize: 9, interval: 5 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(150,163,150,0.12)", type: "dashed" } },
      axisLabel: { color: "#94a38a", fontSize: 10 },
    },
    series: [
      {
        type: "bar",
        data: dist.map((v) => ({
          value: v,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: v / max > 0.6 ? "#5fa979" : "#a8dfc0" },
              { offset: 1, color: "rgba(95,169,121,0.3)" },
            ]),
            borderRadius: [3, 3, 0, 0],
          },
        })),
        barMaxWidth: 14,
      },
    ],
  };
}

function initChart() {
  if (!chartEl.value) return;
  if (!chart) chart = echarts.init(chartEl.value, null, { renderer: "svg" });
  chart.setOption(buildOption(props.hourDist));
}

watch(() => props.hourDist, (v) => {
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

  &__header { margin-bottom: 12px; }

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
