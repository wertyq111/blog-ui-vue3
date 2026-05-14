<template>
  <div class="wb-streak">
    <!-- 连续打卡 -->
    <div class="wb-streak__card">
      <div class="wb-streak__card-title">连续打卡</div>
      <div v-if="loading">
        <el-skeleton-item variant="text" style="width:80px;height:40px;" />
      </div>
      <template v-else>
        <div class="wb-streak__big">
          <span class="wb-streak__num">{{ metrics?.current_streak.value ?? 0 }}</span>
          <span class="wb-streak__unit">天</span>
        </div>
        <div class="wb-streak__hint">{{ metrics?.current_streak.hint }}</div>
        <div class="wb-streak__row">
          <div class="wb-streak__sub">
            <div class="wb-streak__sub-label">最长连续</div>
            <div class="wb-streak__sub-val">{{ metrics?.longest_streak.value ?? 0 }} 天</div>
          </div>
          <div class="wb-streak__sub">
            <div class="wb-streak__sub-label">高峰时段</div>
            <div class="wb-streak__sub-val">{{ metrics?.peak_hour.label ?? "—" }}</div>
          </div>
        </div>
      </template>
    </div>

    <!-- 最爱平台 -->
    <div class="wb-streak__card mt-3">
      <div class="wb-streak__card-title">最爱平台</div>
      <div v-if="loading">
        <el-skeleton-item variant="text" style="width:100%;height:60px;" />
      </div>
      <template v-else-if="metrics?.favorite_platform">
        <div class="wb-streak__platform-name">{{ metrics.favorite_platform.name }}</div>
        <div class="wb-streak__platform-bar">
          <div
            class="wb-streak__platform-fill"
            :style="{ width: metrics.favorite_platform.percent + '%' }"
          ></div>
        </div>
        <div class="wb-streak__platform-meta">
          <span>{{ fmtNum(metrics.favorite_platform.words) }} 字</span>
          <span>{{ metrics.favorite_platform.percent }}%</span>
        </div>
      </template>
      <div v-else class="wb-streak__empty">暂无平台数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardMetrics } from "@/types/api/dashboard-stats";

defineProps<{
  metrics: DashboardMetrics | null;
  loading: boolean;
}>();

function fmtNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "w";
  return n.toLocaleString();
}
</script>

<style lang="scss" scoped>
.wb-streak {
  &__card {
    padding: 20px;
    background: var(--cyber-panel-strong);
    border: 1px solid var(--cyber-border);
    border-radius: 18px;
  }

  &__card-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--cyber-text-mute);
    margin-bottom: 14px;
  }

  &__big {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 6px;
  }

  &__num {
    font-size: 48px;
    font-weight: 900;
    color: #5fa979;
    line-height: 1;
  }

  &__unit {
    font-size: 20px;
    font-weight: 700;
    color: #5fa979;
  }

  &__hint {
    font-size: 12px;
    color: var(--cyber-text-mute);
    margin-bottom: 16px;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding-top: 14px;
    border-top: 1px solid var(--cyber-border);
  }

  &__sub-label {
    font-size: 11px;
    color: var(--cyber-text-mute);
    margin-bottom: 4px;
  }

  &__sub-val {
    font-size: 16px;
    font-weight: 700;
    color: var(--cyber-text);
  }

  &__platform-name {
    font-size: 18px;
    font-weight: 800;
    color: var(--cyber-text);
    margin-bottom: 12px;
  }

  &__platform-bar {
    height: 6px;
    background: rgba(95, 169, 121, 0.15);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  &__platform-fill {
    height: 100%;
    background: linear-gradient(90deg, #5fa979, #7bc8a4);
    border-radius: 6px;
    transition: width 0.6s ease;
  }

  &__platform-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--cyber-text-mute);
  }

  &__empty {
    font-size: 13px;
    color: var(--cyber-text-mute);
    padding: 8px 0;
  }
}
</style>
