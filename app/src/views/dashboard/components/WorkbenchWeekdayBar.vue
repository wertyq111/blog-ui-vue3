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
    <div v-else class="wk-wrap">
      <div v-for="(item, i) in bars" :key="i" class="wk-col">
        <div class="wk-bar-wrap">
          <div class="wk-val">{{ fmtNum(item.value) }}</div>
          <div
            :class="['wk-bar', item.isPeak ? 'wk-bar-peak' : '']"
            :style="{ height: item.pct + '%' }"
          />
        </div>
        <div :class="['wk-label', item.isWeekend ? 'wk-label-end' : '']">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  weekDist: number[];
  loading: boolean;
}>();

const DOW_SHORT = ["日", "一", "二", "三", "四", "五", "六"];

const peakLabel = computed(() => {
  const dist = props.weekDist?.length === 7 ? props.weekDist : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...dist, 1);
  const idx = dist.indexOf(max);
  return DOW_SHORT[idx];
});

const peakValue = computed(() => {
  const dist = props.weekDist?.length === 7 ? props.weekDist : [0, 0, 0, 0, 0, 0, 0];
  return Math.max(...dist, 0);
});

const bars = computed(() => {
  const dist = props.weekDist?.length === 7 ? props.weekDist : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...dist, 1);
  const peakIdx = dist.indexOf(max);

  return dist.map((v, i) => ({
    value: v,
    pct: Math.round((v / max) * 100),
    label: DOW_SHORT[i],
    isPeak: i === peakIdx && v > 0,
    isWeekend: i === 0 || i === 6,
  }));
});

function fmtNum(n: number): string {
  return n.toLocaleString();
}
</script>

<style lang="scss" scoped>
.wb-weekday {
  padding: 18px 22px;
  background: var(--ai-paper, #fdfdf5);
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 24px;
  position: relative;

  &__head {
    margin-bottom: 14px;
  }

  &__title {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--ai-text, #794f27);
  }

  &__sub {
    font-size: 12px;
    font-weight: 600;
    color: var(--ai-text-2, #9f927d);
    margin-top: 3px;
  }
}

.wk-wrap {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 14px;
  height: 220px;
  padding: 8px 4px 0;
}

.wk-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.wk-bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.wk-val {
  font-size: 11px;
  font-weight: 700;
  color: var(--ai-text-2, #9f927d);
  font-variant-numeric: tabular-nums;
}

.wk-bar {
  width: 100%;
  max-width: 36px;
  background: linear-gradient(180deg, var(--ai-leaf, #7cba70) 0%, #d8ecc6 100%);
  border: 2px solid var(--ai-leaf-d, #4a8a36);
  border-radius: 10px 10px 4px 4px;
  min-height: 8px;
  transition: height 0.4s ease;
}

.wk-bar-peak {
  background: linear-gradient(180deg, var(--ai-primary-active, #11a89b) 0%, var(--ai-primary, #19c8b9) 100%);
  border-color: var(--ai-primary-active, #11a89b);
}

.wk-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ai-text, #794f27);
}

.wk-label-end {
  color: var(--ai-orange, #e59266);
}
</style>
