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
    <div v-else class="tag-list">
      <div v-for="(tag, i) in tagRows" :key="tag.name" class="tag-row">
        <span class="tag-rank">{{ (i + 1).toString().padStart(2, '0') }}</span>
        <span class="tag-name">{{ tag.name }}</span>
        <div class="tag-bar-wrap">
          <div
            class="tag-bar"
            :style="{
              width: tag.pct + '%',
              '--tag-color': tag.color,
              '--tag-color-soft': tag.softColor,
            }"
          />
        </div>
        <span class="tag-count">{{ tag.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
  const max = Math.max(...topTags.map((t) => t.count), 1);
  return topTags.map((t, i) => ({
    ...t,
    pct: Math.round((t.count / max) * 100),
    color: RANK_COLORS[i]?.[0] ?? RANK_COLORS[RANK_COLORS.length - 1][0],
    softColor: RANK_COLORS[i]?.[1] ?? RANK_COLORS[RANK_COLORS.length - 1][1],
  }));
});
</script>

<style lang="scss" scoped>
.wb-tags {
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

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-row {
  display: grid;
  grid-template-columns: 24px 80px 1fr 36px;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
}

.tag-rank {
  color: var(--ai-text-3, #c4b89e);
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  text-align: center;
}

.tag-name {
  color: var(--ai-text, #794f27);
}

.tag-bar-wrap {
  height: 10px;
  overflow: hidden;
  background: var(--ai-bg-2, #f0e8d8);
  border: 1px solid var(--ai-border, #e8e2d6);
  border-radius: 5px;
}

.tag-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--tag-color), var(--tag-color-soft));
  border-radius: 4px;
  transition: width 0.4s ease;
}

.tag-count {
  color: var(--ai-text-2, #9f927d);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
