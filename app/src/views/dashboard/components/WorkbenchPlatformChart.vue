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
      <el-skeleton-item variant="rect" style="width:100%;height:180px;border-radius:12px;" />
    </div>
    <div v-else-if="!platformDist.length" class="chart-empty">暂无数据</div>
    <div v-else class="donut-wrap">
      <svg :viewBox="`0 0 ${donutSize} ${donutSize}`" class="donut-svg">
        <path
          v-for="a in arcs"
          :key="a.name"
          :d="a.path"
          :fill="a.color"
        />
        <text :x="donutCx" :y="donutCy - 4" text-anchor="middle" class="donut-center-big">
          {{ topValueLabel }}
        </text>
        <text :x="donutCx" :y="donutCy + 16" text-anchor="middle" class="donut-center-sm">
          {{ arcs[0]?.name ?? '' }}
        </text>
      </svg>
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
import type { DashboardPlatformDist } from "@/types/api/dashboard-stats";

const props = defineProps<{
  platformDist: DashboardPlatformDist[];
  loading: boolean;
}>();

const COLORS = ["#19c8b9", "#f7cd67", "#f8a6b2", "#889df0", "#82d5bb", "#8ac68a"];

const donutSize = 200;
const donutCx = donutSize / 2;
const donutCy = donutSize / 2;
const R = 90;
const r = 60;

const arcs = computed(() => {
  if (!props.platformDist?.length) return [];
  const total = props.platformDist.reduce((s, d) => s + d.words, 0);
  if (total === 0) return [];

  let acc = 0;
  return props.platformDist.map((d, i) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d.words;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = (end - start) > Math.PI ? 1 : 0;

    const sx = donutCx + Math.cos(start) * R;
    const sy = donutCy + Math.sin(start) * R;
    const ex = donutCx + Math.cos(end) * R;
    const ey = donutCy + Math.sin(end) * R;
    const sx2 = donutCx + Math.cos(end) * r;
    const sy2 = donutCy + Math.sin(end) * r;
    const ex2 = donutCx + Math.cos(start) * r;
    const ey2 = donutCy + Math.sin(start) * r;

    const path = `M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey} L ${sx2} ${sy2} A ${r} ${r} 0 ${large} 0 ${ex2} ${ey2} Z`;

    return {
      name: d.name,
      value: d.words,
      share: d.words / total,
      color: COLORS[i % COLORS.length],
      path,
    };
  });
});

const topValueLabel = computed(() => {
  if (!arcs.value.length) return "";
  const v = arcs.value[0].value;
  if (v >= 1000) return (v / 1000).toFixed(1) + "k";
  return v.toString();
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

.chart-skeleton { padding: 4px 0; }

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

.donut-svg {
  width: 100%;
}

.donut-center-big {
  font-size: 24px;
  font-weight: 800;
  fill: var(--ai-text, #794f27);
  font-family: "Mochiy Pop One", "M PLUS Rounded 1c", Nunito, "Noto Sans SC", sans-serif;
}

.donut-center-sm {
  font-size: 10.5px;
  font-weight: 700;
  fill: var(--ai-text-2, #9f927d);
  font-family: inherit;
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
  color: var(--ai-text, #794f27);
}

.legend-val {
  color: var(--ai-text-2, #9f927d);
  font-variant-numeric: tabular-nums;
}

.legend-share {
  color: var(--ai-text-2, #9f927d);
  width: 30px;
  text-align: right;
}
</style>
