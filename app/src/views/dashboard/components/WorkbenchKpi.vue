<template>
  <div class="wb-kpi">
    <div v-for="card in cards" :key="card.key" class="wb-kpi__card">
      <div class="wb-kpi__label">{{ card.label }}</div>
      <div class="wb-kpi__value">
        <template v-if="loading">
          <el-skeleton-item variant="text" style="width: 56px; height: 28px;" />
        </template>
        <template v-else>{{ card.value }}</template>
      </div>
      <div v-if="!loading" class="wb-kpi__delta" :class="card.deltaClass">
        <span v-if="card.delta !== null">7日 +{{ card.delta }}</span>
        <span v-else class="wb-kpi__hint">{{ card.hint }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DashboardMetrics } from "@/types/api/dashboard-stats";

const props = defineProps<{
  metrics: DashboardMetrics | null;
  loading: boolean;
}>();

const cards = computed(() => {
  const m = props.metrics;
  return [
    {
      key: "words",
      label: "总字数",
      value: m ? fmtNum(m.total_words.value) : "—",
      delta: m ? m.total_words.delta_7d : null,
      hint: null,
      deltaClass: "is-up",
    },
    {
      key: "logs",
      label: "日志条数",
      value: m ? fmtNum(m.total_logs.value) : "—",
      delta: m ? m.total_logs.delta_7d : null,
      hint: null,
      deltaClass: "is-up",
    },
    {
      key: "docs",
      label: "文档总数",
      value: m ? fmtNum(m.total_docs.value) : "—",
      delta: m ? m.total_docs.delta_7d : null,
      hint: null,
      deltaClass: "is-up",
    },
    {
      key: "days",
      label: "活跃天数",
      value: m ? fmtNum(m.active_days.value) : "—",
      delta: m ? m.active_days.delta_7d : null,
      hint: null,
      deltaClass: "is-up",
    },
    {
      key: "streak",
      label: "当前连续",
      value: m ? m.current_streak.value + " 天" : "—",
      delta: null,
      hint: m ? m.current_streak.hint : "",
      deltaClass: "",
    },
    {
      key: "longest",
      label: "最长连续",
      value: m ? m.longest_streak.value + " 天" : "—",
      delta: null,
      hint: m?.longest_streak.start ? `${m.longest_streak.start} 起` : "暂无记录",
      deltaClass: "",
    },
    {
      key: "peak",
      label: "高峰时段",
      value: m?.peak_hour.hour !== null && m?.peak_hour.hour !== undefined ? m.peak_hour.label : "—",
      delta: null,
      hint: m?.peak_hour.hour !== null && m?.peak_hour.hour !== undefined ? `${m!.peak_hour.hour}:00` : "",
      deltaClass: "",
    },
    {
      key: "platform",
      label: "最爱平台",
      value: m?.favorite_platform ? m.favorite_platform.name : "—",
      delta: null,
      hint: m?.favorite_platform ? `${m.favorite_platform.percent}%` : "",
      deltaClass: "",
    },
  ];
});

function fmtNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "w";
  return n.toLocaleString();
}
</script>

<style lang="scss" scoped>
.wb-kpi {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 1200px) { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 768px)  { grid-template-columns: repeat(2, 1fr); }

  &__card {
    padding: 16px 18px;
    background: var(--cyber-panel-strong);
    border: 1px solid var(--cyber-border);
    border-radius: 16px;
    box-shadow: var(--cyber-shadow);
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: border-color 0.2s, transform 0.2s;

    &:hover {
      border-color: rgba(95, 169, 121, 0.32);
      transform: translateY(-2px);
    }
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: var(--cyber-text-mute);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__value {
    font-size: 22px;
    font-weight: 800;
    color: var(--cyber-text);
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__delta {
    font-size: 11px;
    color: var(--cyber-text-mute);

    &.is-up { color: #5fa979; }
  }

  &__hint {
    font-size: 11px;
    color: var(--cyber-text-mute);
  }
}
</style>
