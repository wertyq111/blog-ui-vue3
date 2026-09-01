<template>
  <div class="card chart-card">
    <div class="card-head">
      <div>
        <div class="card-title">平台字数分布</div>
        <div class="card-sub" v-if="!loading && arcs.length">
          主力 {{ arcs[0].name }} · {{ (arcs[0].share * 100).toFixed(0) }}%
        </div>
      </div>
    </div>
    <div v-if="loading" class="chart-skeleton">
      <el-skeleton-item variant="rect" style="width: 100%; height: 180px; border-radius: 12px" />
    </div>
    <div v-else-if="!platformDist.length" class="chart-empty">暂无数据</div>
    <div v-else class="donut-wrap">
      <div class="donut-chart">
        <ECharts :options="chartOptions" width="100%" height="200px" />
        <div class="donut-center">
          <div class="donut-center-big">{{ topValueLabel }}</div>
          <div class="donut-center-sm">{{ arcs[0]?.name ?? "" }}</div>
        </div>
      </div>
      <div class="donut-legend">
        <div v-for="a in arcs" :key="a.name" class="legend-row">
          <span class="legend-dot" :style="{ background: a.color }" />
          <span class="legend-name">{{ a.name }}</span>
          <span class="legend-val">{{ a.value.toLocaleString() }}</span>
          <span class="legend-share">{{ (a.share * 100).toFixed(0) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { DashboardPlatformDist } from "@/types/api/dashboard-stats";

const props = defineProps<{
  platformDist: DashboardPlatformDist[];
  loading: boolean;
}>();

const COLORS = ["#19c8b9", "#f7cd67", "#f8a6b2", "#889df0", "#82d5bb", "#8ac68a"];

const arcs = computed(() => {
  if (!props.platformDist?.length) return [];
  const total = props.platformDist.reduce((s, d) => s + d.words, 0);
  if (total === 0) return [];

  return props.platformDist.map((d, i) => ({
    name: d.name,
    value: d.words,
    share: d.words / total,
    color: COLORS[i % COLORS.length],
  }));
});

const topValueLabel = computed(() => {
  if (!arcs.value.length) return "";
  const v = arcs.value[0].value;
  if (v >= 1000) return (v / 1000).toFixed(1) + "k";
  return v.toString();
});

const chartOptions = computed(() => ({
  color: COLORS,
  tooltip: {
    trigger: "item",
    backgroundColor: "#fffef8",
    borderColor: "#e8e2d6",
    borderWidth: 1,
    padding: [6, 10],
    textStyle: { color: "#794f27", fontWeight: 600, fontSize: 12 },
    formatter: (p: any) =>
      `${p.name}<br/><b>${Number(p.value).toLocaleString()}</b> 字 · ${p.percent}%`,
  },
  series: [
    {
      type: "pie",
      radius: ["62%", "88%"],
      center: ["50%", "50%"],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      emphasis: {
        scale: true,
        scaleSize: 6,
        itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.12)" },
      },
      data: arcs.value.map((a) => ({
        name: a.name,
        value: a.value,
        itemStyle: { color: a.color },
      })),
    },
  ],
}));
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

.chart-skeleton {
  padding: 4px 0;
}

.chart-empty {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--ink-3, #8a9a8d);
}

.donut-wrap {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 14px;
  align-items: center;
  flex: 1;
}

.donut-chart {
  position: relative;
  width: 200px;
  height: 200px;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
}

.donut-center-big {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  color: var(--ai-text, var(--ai-text));
  font-family: "Mochiy Pop One", "M PLUS Rounded 1c", Nunito, "Noto Sans SC", sans-serif;
}

.donut-center-sm {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--ai-text-2, var(--ai-text-2));
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.legend-row {
  display: grid;
  grid-template-columns: 12px 1fr auto auto;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.legend-name {
  color: var(--ai-text, var(--ai-text));
}

.legend-val {
  color: var(--ai-text-2, var(--ai-text-2));
  font-variant-numeric: tabular-nums;
}

.legend-share {
  color: var(--ai-text-2, var(--ai-text-2));
  width: 30px;
  text-align: right;
}
</style>
