<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import { usePomoStore } from "@/store/modules/pomo";

const store = usePomoStore();

const options = computed(() => ({
  grid: { left: 36, right: 12, top: 24, bottom: 28 },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    data: store.week.map((w) => w.day.slice(5)), // MM-DD
    axisTick: { show: false },
  },
  yAxis: { type: "value", minInterval: 1 },
  series: [
    {
      type: "bar",
      data: store.week.map((w) => w.count),
      barWidth: "55%",
      itemStyle: { color: "#fc736d", borderRadius: [6, 6, 0, 0] },
    },
  ],
}));
</script>

<template>
  <div class="pomo-stats">
    <h3 class="title">近 7 天专注</h3>
    <ECharts :options="options" width="100%" height="220px" />
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;
.pomo-stats {
  .title {
    margin: 0 0 $space-sm;
    font-size: 16px;
    font-weight: 800;
    color: $text;
    text-align: center;
  }
}
</style>
