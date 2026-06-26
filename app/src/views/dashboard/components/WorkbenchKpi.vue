<template>
  <div class="kpi-strip">
    <div
      v-for="card in cards"
      :key="card.key"
      :class="['kpi', card.highlight ? 'kpi-highlight' : '', card.warn ? 'kpi-warn' : '']"
    >
      <div class="kpi-label">{{ card.label }}</div>
      <template v-if="loading">
        <el-skeleton-item variant="text" style="width:56px;height:30px;" />
      </template>
      <template v-else>
        <div class="kpi-value-row">
          <span :class="['kpi-value', card.isText ? 'kpi-value-text' : '']">{{ card.value }}</span>
          <span v-if="card.unit" class="kpi-unit">{{ card.unit }}<span v-if="card.suffixWord" class="kpi-suffix"> {{ card.suffixWord }}</span></span>
        </div>
        <div class="kpi-note">
          <span v-if="card.delta !== undefined && card.delta !== null" :class="['delta', card.delta >= 0 ? 'delta-up' : 'delta-down']">
            <svg viewBox="0 0 10 10" width="9" height="9">
              <path :d="card.delta >= 0 ? 'M5 2 L8 7 L2 7 Z' : 'M5 8 L8 3 L2 3 Z'" fill="currentColor" />
            </svg>
            {{ card.delta >= 0 ? '+' : '' }}{{ card.delta }} {{ card.deltaSuffix || '本周' }}
          </span>
          <span v-if="card.hint" class="kpi-hint">{{ card.hint }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DashboardMetrics, DashboardHeatmap } from "@/types/api/dashboard-stats";

const props = defineProps<{
  metrics: DashboardMetrics | null;
  heatmap: DashboardHeatmap | null;
  loading: boolean;
}>();

const weekRecordedDays = computed(() => {
  const cells = props.heatmap?.cells;
  if (!cells?.length) return 0;
  return cells.slice(-7).filter((c) => c.words > 0).length;
});

const cards = computed(() => {
  const m = props.metrics;
  return [
    {
      key: "words",
      label: "累计字数",
      value: m ? fmtNum(m.total_words.value) : "—",
      unit: "字",
      delta: m?.total_words.delta_7d ?? undefined,
    },
    {
      key: "logs",
      label: "总日志数",
      value: m ? m.total_logs.value.toString() : "—",
      unit: "条",
      delta: m?.total_logs.delta_7d ?? undefined,
    },
    {
      key: "docs",
      label: "总文档数",
      value: m ? m.total_docs.value.toString() : "—",
      unit: "篇",
      delta: m?.total_docs.delta_7d ?? undefined,
    },
    {
      key: "days",
      label: "活跃天数",
      value: m ? m.active_days.value.toString() : "—",
      unit: "天",
      delta: m?.active_days.delta_7d ?? undefined,
      deltaSuffix: "近 7 天",
    },
    {
      key: "streak",
      label: "本周记录天数",
      value: m ? weekRecordedDays.value.toString() : "—",
      unit: "天",
      warn: m ? weekRecordedDays.value === 0 : false,
    },
    {
      key: "longest",
      label: "最长连续",
      value: m ? m.longest_streak.value.toString() : "—",
      unit: "天",
      hint: m?.longest_streak.start ? `${m.longest_streak.start} 至 ${m.longest_streak.end}` : "暂无记录",
    },
    {
      key: "peak",
      label: "高产时段",
      value: m?.peak_hour.hour != null ? m.peak_hour.hour.toString() : "—",
      unit: m?.peak_hour.hour != null ? "时" : "",
      suffixWord: m?.peak_hour.period ? mapPeriod(m.peak_hour.period) : "",
      hint: m?.peak_hour.hour != null ? "下午最有产出" : "",
    },
    {
      key: "platform",
      label: "主力平台",
      value: m?.favorite_platform?.name ?? "—",
      isText: true,
      hint: m?.favorite_platform ? `${fmtNum(m.favorite_platform.words)} 字 · ${m.favorite_platform.percent}%` : "",
      highlight: true,
    },
  ];
});

const PERIOD_MAP: Record<string, string> = {
  morning: "上午",
  afternoon: "下午",
  evening: "晚上",
  night: "深夜",
  noon: "中午",
};

function mapPeriod(period: string | undefined): string {
  if (!period) return "—";
  return PERIOD_MAP[period.toLowerCase()] || period;
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}
</script>

<style lang="scss" scoped>
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;

  @media (max-width: 1500px) { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
}

.kpi {
  background: var(--ai-paper, #fdfdf5);
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 22px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  min-height: 104px;
  transition: transform 0.18s, box-shadow 0.18s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 0 0 var(--ai-shadow-color, #bdaea0);
  }
}

.kpi-label {
  color: var(--ai-text-2, #9f927d);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.kpi-value {
  font-family: "Mochiy Pop One", "M PLUS Rounded 1c", Nunito, "Noto Sans SC", sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ai-text, #794f27);
  line-height: 1;
}

.kpi-value-text {
  font-size: 20px;
}

.kpi-unit {
  font-size: 12px;
  font-weight: 700;
  color: var(--ai-text-2, #9f927d);
  margin-left: 2px;
}

.kpi-suffix {
  color: var(--ai-text-3, #c4b89e);
  margin-left: 2px;
}

.kpi-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ai-text-2, #9f927d);
  min-height: 16px;
  flex-wrap: wrap;
}

.kpi-hint {
  color: var(--ai-text-2, #9f927d);
}

.kpi-highlight {
  background: linear-gradient(135deg, #fff4cf 0%, #ffe6c8 100%);
  border-color: #f0d29a;

  .kpi-label {
    color: #8a6a3a;
  }
}

.kpi-warn .kpi-value {
  color: var(--ai-orange, #e59266);
}

.delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 800;
}

.delta-up {
  color: var(--ai-primary-active, #11a89b);
}

.delta-down {
  color: var(--ai-red, #fc736d);
}
</style>
