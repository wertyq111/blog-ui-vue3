<template>
  <div class="wb-weekday">
    <div class="wb-weekday__head">
      <div class="wb-weekday__title">星期分布</div>
      <div class="wb-weekday__sub" v-if="!loading && weekDist.length">
        周{{ peakLabel }}最有产出 · 日均 {{ peakValue.toLocaleString() }} 字
      </div>
    </div>
    <div v-if="loading" class="wb-weekday__skeleton">
      <el-skeleton-item variant="rect" style="width:100%;height:200px;border-radius:12px;" />
    </div>
    <ECharts v-else :options="chartOptions" width="100%" height="220px" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";

const props = defineProps<{
  weekDist: number[];
  loading: boolean;
}>();

const DOW_SHORT = ["日", "一", "二", "三", "四", "五", "六"];

const normDist = computed(() =>
  props.weekDist?.length === 7 ? props.weekDist : [0, 0, 0, 0, 0, 0, 0]
);

const peakIdx = computed(() => {
  const dist = normDist.value;
  const max = Math.max(...dist, 1);
  return dist.indexOf(max);
});

const peakLabel = computed(() => DOW_SHORT[peakIdx.value]);
const peakValue = computed(() => Math.max(...normDist.value, 0));

// 普通柱 / 峰值柱的竖向渐变（对应原 SVG 版 linear-gradient(180deg, ...)）
const NORMAL_BAR = {
  type: "linear", x: 0, y: 0, x2: 0, y2: 1,
  colorStops: [
    { offset: 0, color: "#7cba70" },
    { offset: 1, color: "#d8ecc6" },
  ],
} as const;
const PEAK_BAR = {
  type: "linear", x: 0, y: 0, x2: 0, y2: 1,
  colorStops: [
    { offset: 0, color: "#11a89b" },
    { offset: 1, color: "#19c8b9" },
  ],
} as const;

const chartOptions = computed(() => {
  const dist = normDist.value;
  const peak = peakIdx.value;
  const hasData = peakValue.value > 0;

  return {
    grid: { left: 6, right: 6, top: 24, bottom: 24 },
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
        return `周${p.axisValue}<br/>字数 <b>${Number(p.value).toLocaleString()}</b>`;
      },
    },
    xAxis: {
      type: "category",
      data: DOW_SHORT,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: "#794f27",
        // 周末（日 / 六）标签用橙色，对应原 .wk-label-end
        formatter: (value: string, index: number) =>
          index === 0 || index === 6 ? `{end|${value}}` : value,
        rich: {
          end: { color: "#e59266", fontWeight: 700, fontSize: 12 },
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        type: "bar",
        barWidth: 36,
        barMaxWidth: 36,
        label: {
          show: hasData,
          position: "top",
          color: "#9f927d",
          fontSize: 11,
          fontWeight: 700,
          formatter: (p: any) => (p.value > 0 ? Number(p.value).toLocaleString() : ""),
        },
        data: dist.map((v, i) => {
          const isPeak = i === peak && v > 0;
          return {
            value: v,
            itemStyle: {
              borderRadius: [10, 10, 4, 4],
              color: isPeak ? PEAK_BAR : NORMAL_BAR,
              borderColor: isPeak ? "#11a89b" : "#4a8a36",
              borderWidth: 2,
            },
          };
        }),
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.wb-weekday {
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
