<template>
  <div class="wb-chart-card">
    <div class="wb-chart-card__header">
      <span class="wb-chart-card__title">平台分布</span>
    </div>
    <div v-if="loading" class="wb-chart-card__skeleton">
      <el-skeleton-item variant="rect" style="width:100%;height:140px;border-radius:8px;" />
    </div>
    <div v-else-if="!platformDist.length" class="wb-chart-card__empty">暂无数据</div>
    <div v-else ref="chartEl" class="wb-chart-card__body"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { DashboardPlatformDist } from "@/types/api/dashboard-stats";

echarts.use([SVGRenderer, PieChart, TooltipComponent, LegendComponent]);

const props = defineProps<{
  platformDist: DashboardPlatformDist[];
  loading: boolean;
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const PALETTE = ["#5fa979", "#7bc8a4", "#a8dfc0", "#3a8f5e", "#d8ecdb", "#9ed4b5"];

function buildOption(dist: DashboardPlatformDist[]) {
  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} 字 ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: 8,
      top: "center",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#94a38a", fontSize: 11 },
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        center: ["38%", "50%"],
        data: dist.map((d, i) => ({
          name: d.name,
          value: d.words,
          itemStyle: { color: PALETTE[i % PALETTE.length] },
        })),
        label: { show: false },
        labelLine: { show: false },
      },
    ],
  };
}

function initChart() {
  if (!chartEl.value) return;
  if (!chart) chart = echarts.init(chartEl.value, null, { renderer: "svg" });
  chart.setOption(buildOption(props.platformDist));
}

watch(() => props.platformDist, (v) => {
  if (v?.length && chartEl.value) {
    if (!chart) chart = echarts.init(chartEl.value, null, { renderer: "svg" });
    chart.setOption(buildOption(v));
  }
});

onMounted(() => { if (!props.loading && props.platformDist.length) initChart(); });
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

  &__empty {
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--cyber-text-mute);
  }
}
</style>
