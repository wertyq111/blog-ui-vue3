<template>
  <div class="wb-streak">
    <!-- 连续打卡 card -->
    <div class="wb-streak__card streak-card">
      <div class="streak-badge">连续打卡</div>
      <div class="card-head">
        <div>
          <div class="card-title">今天写了吗</div>
          <div class="card-sub">最长 {{ metrics?.longest_streak.value ?? 0 }} 天 · 第 {{ currentWeek }} 周</div>
        </div>
      </div>
      <div v-if="loading">
        <el-skeleton-item variant="text" style="width:80px;height:50px;" />
      </div>
      <template v-else>
        <div class="streak-big">
          <div class="streak-num">{{ metrics?.current_streak.value ?? 0 }}</div>
          <div class="streak-unit">天连续</div>
        </div>
        <div class="streak-warn">
          <span class="streak-warn-ico">✏️</span>
          {{ metrics?.current_streak.hint || "今天还没写呢" }} · 写一段，连续从这里开始
        </div>

        <!-- Week dots -->
        <div class="week-dots">
          <div v-for="d in weekDots" :key="d.date" class="week-dot-wrap">
            <div :class="['week-dot', 'lvl-' + d.level]" :title="d.date + ' ' + d.words + ' 字'" />
            <div class="week-dot-label">{{ d.label }}</div>
          </div>
        </div>

        <div class="streak-summary">
          <div class="summary-line">
            <span>✨ 累计字数已经等于约 <b>{{ bookCount }}</b> 本《小王子》 🌿</span>
          </div>
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

const DOW_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

const currentWeek = computed(() => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
});

const weekDots = computed(() => {
  if (!props.heatmap?.cells?.length) return [];

  const cells = props.heatmap.cells;
  const buckets = props.heatmap.buckets || [0, 500, 1500, 3000];
  const last7 = cells.slice(-7);

  return last7.map((c) => {
    const d = new Date(c.date);
    const dow = d.getDay();
    let level = 0;
    if (c.words > 0) {
      if (c.words >= buckets[3]) level = 4;
      else if (c.words >= buckets[2]) level = 3;
      else if (c.words >= buckets[1]) level = 2;
      else level = 1;
    }
    return {
      date: c.date,
      words: c.words,
      level,
      label: DOW_LABELS[dow],
    };
  });
});

const bookCount = computed(() => {
  const total = props.metrics?.total_words?.value ?? 0;
  const books = total / 22000;
  return books >= 1 ? books.toFixed(1) : books.toFixed(2);
});
</script>

<style lang="scss" scoped>
.wb-streak {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__card {
    padding: 18px 22px;
    background: var(--ai-paper, #fdfdf5);
    border: 2px solid var(--ai-border, #e8e2d6);
    border-radius: 24px;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
}

.streak-badge {
  position: absolute;
  top: -12px;
  left: 24px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 800;
  color: #5a3a18;
  letter-spacing: 1px;
  background: var(--ai-yellow, #f7cd67);
  border: 2px solid #c89a3a;
  border-radius: 6px;
  box-shadow:
    0 2px 0 0 #c89a3a,
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  transform: rotate(-3deg);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
  margin-bottom: 0;
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

.streak-big {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 0 0;
}

.streak-num {
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  color: var(--ai-orange, #e59266);
  letter-spacing: -2px;
  font-family: "Mochiy Pop One", "M PLUS Rounded 1c", Nunito, "Noto Sans SC", sans-serif;
}

.streak-unit {
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text-2, #9f927d);
}

.streak-warn {
  font-size: 12px;
  font-weight: 700;
  color: #8a6a3a;
  background: #fff4cf;
  border: 2px solid #f0d29a;
  border-radius: 12px;
  padding: 8px 12px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.streak-warn-ico {
  flex-shrink: 0;
}

// Week dots
.week-dots {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.week-dot-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.week-dot {
  width: 100%;
  aspect-ratio: 1;
  max-width: 30px;
  border: 2px solid rgba(74, 138, 54, 0.15);
  border-radius: 8px;
  transition: background 0.2s;
}

.week-dot.lvl-0 { background: #f1f7e6; }
.week-dot.lvl-1 { background: #d8ecc6; }
.week-dot.lvl-2 { background: #a5d889; }
.week-dot.lvl-3 { background: #7cba70; }
.week-dot.lvl-4 { background: #4a8a36; }

.week-dot-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--ai-text-2, #9f927d);
}

// Summary
.streak-summary {
  margin-top: auto;
  padding-top: 14px;
  border-top: 2px dashed var(--ai-border, #e8e2d6);
}

.summary-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text, #794f27);

  b {
    color: var(--ai-text, #794f27);
    font-weight: 800;
  }
}
</style>
