<template>
  <div class="wb-heatmap">
    <div class="wb-heatmap__header">
      <span class="wb-heatmap__title">活跃热力图</span>
      <span class="wb-heatmap__sub">过去 365 天</span>
    </div>
    <div v-if="loading" class="wb-heatmap__skeleton">
      <el-skeleton-item variant="rect" style="width:100%;height:140px;border-radius:12px;" />
    </div>
    <div v-else ref="chartEl" class="wb-heatmap__chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts/core";
import { HeatmapChart } from "echarts/charts";
import { CalendarComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { DashboardHeatmap } from "@/types/api/dashboard-stats";

echarts.use([SVGRenderer, HeatmapChart, CalendarComponent, TooltipComponent, VisualMapComponent]);

const props = defineProps<{
  heatmap: DashboardHeatmap | null;
  loading: boolean;
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function buildOption(heatmap: DashboardHeatmap) {
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10);
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  const startDate = start.toISOString().slice(0, 10);

  const dataMap = new Map<string, number>();
  for (const cell of heatmap.cells) {
    dataMap.set(cell.date, cell.words);
  }

  const data: [string, number][] = [];
  const cur = new Date(start);
  while (cur <= today) {
    const k = cur.toISOString().slice(0, 10);
    data.push([k, dataMap.get(k) ?? 0]);
    cur.setDate(cur.getDate() + 1);
  }

  const buckets = heatmap.buckets?.length === 4 ? heatmap.buckets : [0, 200, 800, 2000];
  const colors = ["#edf9f1", "#a8dfc0", "#7bc8a4", "#5fa979", "#3a8f5e"];

  return {
    tooltip: {
      formatter: (p: any) =>
        `${p.data[0]}<br/>字数：${p.data[1].toLocaleString()}`,
    },
    visualMap: {
      show: false,
      type: "piecewise",
      pieces: [
        { min: 0, max: 0, color: colors[0] },
        { min: buckets[1], max: buckets[2] - 1, color: colors[2] },
        { min: buckets[2], max: buckets[3] - 1, color: colors[3] },
        { min: buckets[3], color: colors[4] },
      ],
    },
    calendar: {
      top: 16,
      left: 28,
      right: 12,
      bottom: 0,
      range: [startDate, endDate],
      cellSize: ["auto", 14],
      splitLine: { show: false },
      itemStyle: {
        borderWidth: 3,
        borderColor: "#fff",
        borderRadius: 3,
      },
      dayLabel: {
        show: true,
        firstDay: 1,
        nameMap: ["日", "一", "二", "三", "四", "五", "六"],
        color: "#94a38a",
        fontSize: 10,
      },
      monthLabel: {
        color: "#94a38a",
        fontSize: 10,
      },
      yearLabel: { show: false },
    },
    series: [
      {
        type: "heatmap",
        coordinateSystem: "calendar",
        data,
      },
    ],
  };
}

function initChart() {
  if (!chartEl.value || !props.heatmap) return;
  if (!chart) {
    chart = echarts.init(chartEl.value, null, { renderer: "svg" });
  }
  chart.setOption(buildOption(props.heatmap));
}

watch(
  () => props.heatmap,
  (v) => {
    if (v && chartEl.value) {
      if (!chart) chart = echarts.init(chartEl.value, null, { renderer: "svg" });
      chart.setOption(buildOption(v));
    }
  }
);

onMounted(() => {
  if (!props.loading && props.heatmap) initChart();
});

onBeforeUnmount(() => {
  chart?.dispose();
});
</script>

<style lang="scss" scoped>
.wb-heatmap {
  padding: 20px 24px;
  background: var(--cyber-panel-strong);
  border: 1px solid var(--cyber-border);
  border-radius: 20px;
  margin-bottom: 20px;

  &__header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--cyber-text);
  }

  &__sub {
    font-size: 12px;
    color: var(--cyber-text-mute);
  }

  &__chart {
    width: 100%;
    height: 148px;
  }

  &__skeleton {
    padding: 4px 0;
  }
}
</style>
