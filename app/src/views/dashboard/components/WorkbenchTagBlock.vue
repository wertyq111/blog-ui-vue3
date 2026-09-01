<template>
  <div class="wb-tags">
    <div class="wb-tags__head">
      <div class="wb-tags__title">标签 Top 10</div>
      <div class="wb-tags__sub">本年累计 · 共 {{ tags.length }} 个标签</div>
    </div>
    <div v-if="loading" class="wb-tags__skeleton">
      <el-skeleton-item variant="rect" style="width:100%;height:200px;border-radius:12px;" />
    </div>
    <el-empty v-else-if="!tags.length" :image-size="48" description="暂无标签数据" />
    <ECharts v-else :options="chartOptions" width="100%" :height="chartHeight" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { DashboardTagRanking } from "@/types/api/dashboard-stats";

const props = defineProps<{
  tags: DashboardTagRanking[];
  loading: boolean;
}>();

const RANK_COLORS = [
  ["#11a89b", "#19c8b9"],
  ["#f0b93e", "#f7cd67"],
  ["#e8788f", "#f8a6b2"],
  ["#6f8fe8", "#889df0"],
  ["#5fbf9d", "#82d5bb"],
  ["#6fba2c", "#8ac68a"],
  ["#d87549", "#e59266"],
  ["#9b6be6", "#b77dee"],
  ["#a8b525", "#d1da49"],
  ["#c05f76", "#e18c6f"],
] as const;

const tagRows = computed(() => {
  if (!props.tags?.length) return [];
  const topTags = props.tags.slice(0, 10);
  return topTags.map((t, i) => ({
    ...t,
    color: RANK_COLORS[i]?.[0] ?? RANK_COLORS[RANK_COLORS.length - 1][0],
    softColor: RANK_COLORS[i]?.[1] ?? RANK_COLORS[RANK_COLORS.length - 1][1],
  }));
});

const chartHeight = computed(() => `${Math.max(tagRows.value.length * 30, 120)}px`);

const chartOptions = computed(() => {
  const rows = tagRows.value;
  const max = Math.max(...rows.map((r) => r.count), 1);

  return {
    grid: { left: 4, right: 40, top: 6, bottom: 6, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "none" },
      backgroundColor: "#fffef8",
      borderColor: "#e8e2d6",
      borderWidth: 1,
      padding: [6, 10],
      textStyle: { color: "#794f27", fontWeight: 600, fontSize: 12 },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        return `${p.name}<br/><b>${p.value}</b> 次`;
      },
    },
    xAxis: {
      type: "value",
      max,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: rows.map((r) => r.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        margin: 12,
        // rank（01-10）+ 标签名，还原原排行榜的两段式
        formatter: (value: string, index: number) => {
          const rank = (index + 1).toString().padStart(2, "0");
          return `{rank|${rank}}  {name|${value}}`;
        },
        rich: {
          rank: { color: "#c4b89e", fontSize: 11, fontWeight: 700, fontFamily: "monospace" },
          name: { color: "#794f27", fontSize: 12, fontWeight: 700, width: 72, align: "left" },
        },
      },
    },
    series: [
      {
        type: "bar",
        barWidth: 10,
        label: {
          show: true,
          position: "right",
          color: "#9f927d",
          fontSize: 12,
          fontWeight: 700,
          formatter: (p: any) => `${p.value}`,
        },
        data: rows.map((r) => ({
          value: r.count,
          itemStyle: {
            borderRadius: [5, 5, 5, 5],
            color: {
              type: "linear", x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: r.color },
                { offset: 1, color: r.softColor },
              ],
            },
          },
        })),
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.wb-tags {
  padding: 18px 22px;
  background: var(--ai-paper, var(--ai-paper));
  border: 2px solid var(--ai-border, var(--ai-border));
  border-radius: 24px;
  position: relative;

  &__head {
    margin-bottom: 14px;
  }

  &__title {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--ai-text, var(--ai-text));
  }

  &__sub {
    font-size: 12px;
    font-weight: 600;
    color: var(--ai-text-2, var(--ai-text-2));
    margin-top: 3px;
  }
}
</style>
