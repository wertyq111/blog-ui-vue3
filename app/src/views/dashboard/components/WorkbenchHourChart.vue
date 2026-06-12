<template>
  <div class="card chart-card">
    <div class="card-head">
      <div>
        <div class="card-title">工作时段分布</div>
        <div class="card-sub" v-if="!loading && hourDist.length">
          高产时段 {{ peakHour.toString().padStart(2, "0") }}:00 · 平均 {{ avgPerHour }} 字/时
        </div>
      </div>
    </div>
    <div v-if="loading" class="chart-skeleton">
      <el-skeleton-item variant="rect" style="width: 100%; height: 200px; border-radius: 12px" />
    </div>
    <div v-else class="clock-wrap">
      <div class="clock-chart">
        <ECharts :options="chartOptions" width="100%" height="220px" />
        <div class="clock-center">
          <div class="clock-center-big">
            {{ peakHour }}<span class="clock-center-unit">时</span>
          </div>
          <div class="clock-center-sm">{{ peakPeriod }}最有产出</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";

const props = defineProps<{
  hourDist: number[];
  loading: boolean;
}>();

const innerR = 56;
const outerR = 112;
const span = outerR - innerR;
const minLen = 8;

// 表盘只展示工作时段 8:00–18:00（含），整圈 = 这 11 个小时
const winStart = 8;
const winEnd = 18;
const winHours = (() => {
  const arr: number[] = [];
  for (let h = winStart; h <= winEnd; h++) arr.push(h);
  return arr;
})();

const peakHour = computed(() => {
  if (!props.hourDist?.length) return 0;
  let maxVal = 0;
  let maxH = 0;
  props.hourDist.forEach((v, i) => {
    if (v > maxVal) {
      maxVal = v;
      maxH = i;
    }
  });
  return maxH;
});

const peakPeriod = computed(() => {
  const h = peakHour.value;
  if (h >= 6 && h < 12) return "上午";
  if (h >= 12 && h < 14) return "中午";
  if (h >= 14 && h < 18) return "下午";
  if (h >= 18 && h < 22) return "晚上";
  return "深夜";
});

const avgPerHour = computed(() => {
  if (!props.hourDist?.length) return 0;
  const total = props.hourDist.reduce((s, v) => s + v, 0);
  return Math.round(total / 24);
});

// 每个工作小时 → 极坐标柱：value 已归一到 [0,1]（沿用原 sqrt 压缩 + 最小可见长度）
const barData = computed(() => {
  const dist = props.hourDist?.length === 24 ? props.hourDist : new Array(24).fill(0);
  const max = Math.max(...winHours.map((h) => dist[h] ?? 0), 1);
  const peak = peakHour.value;
  const minRatio = minLen / span;

  return winHours.map((h) => {
    const actual = dist[h] ?? 0;
    // sqrt 压缩离群值，并给非零小时一个最小可见长度；空数据归 0（不画柱）
    const ratio = actual > 0 ? Math.sqrt(actual / max) : 0;
    const value = actual > 0 ? minRatio + ratio * (1 - minRatio) : 0;
    const isPeak = h === peak;
    const isWindow = h >= 14 && h <= 16;
    const color = isPeak ? "#11a89b" : isWindow ? "#19c8b9" : "#9adcd1";
    return {
      value,
      actual,
      hour: h,
      itemStyle: { color, borderRadius: 6 },
    };
  });
});

const chartOptions = computed(() => ({
  tooltip: {
    trigger: "item" as const,
    backgroundColor: "#fffef8",
    borderColor: "#e8e2d6",
    borderWidth: 1,
    padding: [6, 10],
    textStyle: { color: "#794f27", fontWeight: 600, fontSize: 12 },
    formatter: (p: any) =>
      `${p.data.hour.toString().padStart(2, "0")}:00<br/><b>${Number(
        p.data.actual
      ).toLocaleString()}</b> 字`,
  },
  polar: { center: ["50%", "50%"], radius: [`${(innerR / 130) * 100}%`, `${(outerR / 130) * 100}%`] },
  angleAxis: {
    type: "category" as const,
    data: winHours.map((h) => h.toString().padStart(2, "0")),
    startAngle: 90,
    boundaryGap: false,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: {
      color: "#9f927d",
      fontSize: 10,
      fontWeight: 700,
      margin: 8,
      // 每个工作小时都显示刻度
      interval: 0,
    },
  },
  radiusAxis: {
    type: "value" as const,
    min: 0,
    max: 1,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
  },
  series: [
    {
      type: "bar" as const,
      coordinateSystem: "polar" as const,
      barWidth: 7,
      showBackground: true,
      backgroundStyle: { color: "#ece5d6", opacity: 0.6, borderRadius: 6 },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.12)" } },
      data: barData.value,
    },
  ],
}));
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

.chart-skeleton {
  padding: 4px 0;
}

.clock-wrap {
  display: grid;
  place-items: center;
  padding: 10px 0;
  flex: 1;
}

.clock-chart {
  position: relative;
  width: 100%;
  max-width: 260px;
  height: 220px;
}

.clock-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
}

.clock-center-big {
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  color: var(--ai-text, #794f27);
  font-family: "Mochiy Pop One", "M PLUS Rounded 1c", Nunito, "Noto Sans SC", sans-serif;
}

.clock-center-unit {
  font-size: 12px;
  color: var(--ai-text-2, #9f927d);
  font-weight: 700;
  font-family: inherit;
}

.clock-center-sm {
  font-size: 10.5px;
  color: var(--ai-text-2, #9f927d);
  font-weight: 700;
}
</style>
