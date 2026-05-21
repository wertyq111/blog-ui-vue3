<template>
  <div class="wb-heatmap">
    <div class="wb-heatmap__header">
      <div>
        <div class="wb-heatmap__title">365 天活跃热力图</div>
        <div class="wb-heatmap__sub">点击任意一天，跳转到对应日期的工作日常 · hover 查看详情</div>
      </div>
      <div v-if="!loading" class="hm-legend">
        <span class="hm-legend-label">少</span>
        <span v-for="l in 5" :key="l" class="hm-legend-cell" :style="{ background: levelColors[l - 1] }" />
        <span class="hm-legend-label">多</span>
      </div>
    </div>
    <div v-if="loading" class="wb-heatmap__skeleton">
      <el-skeleton-item variant="rect" style="width:100%;height:140px;border-radius:12px;" />
    </div>
    <div v-else class="hm-tooltip-host">
      <svg :width="svgSize.width" :height="svgSize.height" class="hm-svg">
        <text
          v-for="month in monthLabels"
          :key="month.label + month.weekIndex"
          :x="month.weekIndex * (CELL_SIZE + CELL_GAP)"
          y="10"
          class="hm-month"
        >
          {{ month.label }}
        </text>
        <g transform="translate(0, 16)">
          <template v-for="(week, weekIndex) in weeks" :key="weekIndex">
            <rect
              v-for="(day, dayIndex) in week"
              v-show="day"
              :key="day?.date || `${weekIndex}-${dayIndex}`"
              :x="weekIndex * (CELL_SIZE + CELL_GAP)"
              :y="dayIndex * (CELL_SIZE + CELL_GAP)"
              :width="CELL_SIZE"
              :height="CELL_SIZE"
              rx="2.5"
              :fill="day ? levelFill(day.level) : 'transparent'"
              :stroke="hover?.date === day?.date ? '#2e7d4c' : 'transparent'"
              :stroke-width="hover?.date === day?.date ? 1.5 : 0"
              class="hm-cell"
              @mouseenter="day && setHover(day, weekIndex, dayIndex)"
              @mouseleave="hover = null"
            />
          </template>
        </g>
      </svg>
      <div
        v-if="hover"
        class="hm-tip"
        :style="{ left: hover.x + 'px', top: hover.y + 'px' }"
      >
        <div class="hm-tip-date">{{ hover.date }}</div>
        <div class="hm-tip-val">{{ hover.words > 0 ? `${fmtNum(hover.words)} 字` : "没写" }}</div>
      </div>
    </div>

    <!-- Footer stats per design spec -->
    <div v-if="!loading && heatmap" class="hm-foot">
      <div class="hm-foot-item">
        <div class="hm-foot-label">最高单日</div>
        <div class="hm-foot-value">{{ fmtNum(stats.maxDay) }}<span>字</span></div>
      </div>
      <div class="hm-foot-item">
        <div class="hm-foot-label">活跃天</div>
        <div class="hm-foot-value">{{ stats.activeDays }}<span>/365</span></div>
      </div>
      <div class="hm-foot-item">
        <div class="hm-foot-label">空白天</div>
        <div class="hm-foot-value">{{ stats.blankDays }}<span>天</span></div>
      </div>
      <div class="hm-foot-item">
        <div class="hm-foot-label">日均</div>
        <div class="hm-foot-value">{{ fmtNum(stats.dailyAvg) }}<span>字</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { DashboardHeatmap, DashboardHeatmapCell } from "@/types/api/dashboard-stats";

const props = defineProps<{
  heatmap: DashboardHeatmap | null;
  loading: boolean;
}>();

const CELL_SIZE = 13;
const CELL_GAP = 3;
const ROW_COUNT = 7;
const levelColors = ["#f1f7e6", "#d8ecc6", "#a5d889", "#7cba70", "#4a8a36"];

interface HeatmapDay {
  date: string;
  words: number;
  level: number;
}

interface HoverDay extends HeatmapDay {
  x: number;
  y: number;
}

const hover = ref<HoverDay | null>(null);

const stats = computed(() => {
  const cells = props.heatmap?.cells ?? [];
  const words = cells.map((c) => c.words);
  const maxDay = words.length ? Math.max(...words) : 0;
  const activeDays = words.filter((w) => w > 0).length;
  const blankDays = words.length - activeDays;
  const total = words.reduce((s, w) => s + w, 0);
  const dailyAvg = words.length ? Math.round(total / words.length) : 0;
  return { maxDay, activeDays, blankDays, dailyAvg };
});

function fmtNum(n: number): string {
  return n.toLocaleString();
}

const normalizedDays = computed<HeatmapDay[]>(() => {
  if (!props.heatmap?.cells?.length) return [];

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  const dataMap = new Map<string, DashboardHeatmapCell>();
  props.heatmap.cells.forEach((cell) => dataMap.set(cell.date, cell));

  const days: HeatmapDay[] = [];
  const cur = new Date(start);
  while (cur <= today) {
    const k = cur.toISOString().slice(0, 10);
    const words = dataMap.get(k)?.words ?? 0;
    days.push({ date: k, words, level: getLevel(words) });
    cur.setDate(cur.getDate() + 1);
  }

  return days;
});

const weeks = computed<(HeatmapDay | null)[][]>(() => {
  const days = normalizedDays.value;
  if (!days.length) return [];

  const output: (HeatmapDay | null)[][] = [];
  let current: (HeatmapDay | null)[] = [];
  const firstDate = parseLocalDate(days[0].date);
  const firstDow = firstDate.getDay();

  for (let i = 0; i < firstDow; i += 1) current.push(null);
  days.forEach((day) => {
    current.push(day);
    if (current.length === ROW_COUNT) {
      output.push(current);
      current = [];
    }
  });
  if (current.length) {
    while (current.length < ROW_COUNT) current.push(null);
    output.push(current);
  }

  return output;
});

const monthLabels = computed(() => {
  const labels: Array<{ weekIndex: number; label: string }> = [];
  let lastMonth = -1;
  weeks.value.forEach((week, weekIndex) => {
    const firstReal = week.find(Boolean);
    if (!firstReal) return;
    const month = Number(firstReal.date.slice(5, 7));
    if (month !== lastMonth) {
      labels.push({ weekIndex, label: `${month}月` });
      lastMonth = month;
    }
  });
  return labels;
});

const svgSize = computed(() => ({
  width: weeks.value.length * (CELL_SIZE + CELL_GAP),
  height: ROW_COUNT * (CELL_SIZE + CELL_GAP) + 32,
}));

function parseLocalDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function getLevel(words: number) {
  if (words <= 0) return 0;
  const buckets = props.heatmap?.buckets?.length === 4 ? props.heatmap.buckets : [0, 200, 800, 2000];
  if (words >= buckets[3]) return 4;
  if (words >= buckets[2]) return 3;
  if (words >= buckets[1]) return 2;
  return 1;
}

function levelFill(level: number) {
  return levelColors[level] ?? levelColors[0];
}

function setHover(day: HeatmapDay, weekIndex: number, dayIndex: number) {
  hover.value = {
    ...day,
    x: weekIndex * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2,
    y: dayIndex * (CELL_SIZE + CELL_GAP) + 32,
  };
}
</script>

<style lang="scss" scoped>
.wb-heatmap {
  min-height: auto;
  padding: 18px 22px;
  background: var(--ai-paper, #fdfdf5);
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 24px;
  position: relative;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
    gap: 12px;
  }

  &__title {
    font-size: 15px;
    font-weight: 800;
    color: var(--ai-text, #794f27);
  }

  &__sub {
    font-size: 12px;
    color: var(--ai-text-2, #9f927d);
    margin-top: 3px;
    font-weight: 600;
  }

  &__skeleton {
    padding: 4px 0;
  }
}

// Heatmap footer stats — per design spec
.hm-foot {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px dashed var(--ai-border, #e8e2d6);
}

.hm-foot-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hm-foot-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--ai-text-2, #9f927d);
}

.hm-foot-value {
  font-family: "Mochiy Pop One", "M PLUS Rounded 1c", Nunito, "Noto Sans SC", sans-serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ai-text, #794f27);
  margin-top: 2px;

  span {
    font-size: 11px;
    color: var(--ai-text-2, #9f927d);
    margin-left: 4px;
    font-family: inherit;
    font-weight: 700;
  }
}

// Legend
.hm-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ai-text-2, #9f927d);
  flex-shrink: 0;
}

.hm-legend-cell {
  width: 11px;
  height: 11px;
  border-radius: 2.5px;
}

.hm-legend-label {
  margin: 0 4px;
}

.hm-tooltip-host {
  position: relative;
  overflow-x: auto;
  padding: 4px 0;
}

.hm-svg {
  display: block;
}

.hm-month {
  fill: var(--ai-text-2, #9f927d);
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
}

.hm-cell {
  cursor: pointer;
}

.hm-tip {
  position: absolute;
  z-index: 10;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ai-paper, #fdfdf5);
  white-space: nowrap;
  pointer-events: none;
  background: var(--ai-text, #794f27);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  transform: translateX(-50%);

  &::before {
    position: absolute;
    top: -4px;
    left: 50%;
    margin-left: -4px;
    content: "";
    border: 4px solid transparent;
    border-top: 0;
    border-bottom-color: var(--ai-text, #794f27);
  }
}

.hm-tip-date {
  font-size: 10px;
  opacity: 0.7;
}

.hm-tip-val {
  margin-top: 1px;
  font-weight: 800;
}
</style>
