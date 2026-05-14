<template>
  <div class="wb-logs">
    <div class="wb-logs__header">
      <span class="wb-logs__title">最近日志</span>
      <el-link type="primary" underline="never" @click="$router.push('/develop/work-daily')">
        查看全部
      </el-link>
    </div>
    <div v-if="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <el-empty v-else-if="!logs.length" :image-size="48" description="暂无日志" />
    <div v-else class="wb-logs__list">
      <article
        v-for="log in logs"
        :key="log.id"
        class="wb-logs__item"
        @click="$router.push('/develop/work-daily')"
      >
        <div class="wb-logs__item-head">
          <span class="wb-logs__date">{{ log.log_date }}</span>
          <div class="wb-logs__tags">
            <template v-if="log.content?.platforms">
              <span
                v-for="p in log.content.platforms"
                :key="p.platform_id"
                class="wb-logs__tag"
              >{{ p.platform_name }}</span>
            </template>
          </div>
        </div>
        <div class="wb-logs__text">{{ extractText(log.content) }}</div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardRecentLog } from "@/types/api/dashboard-stats";

defineProps<{
  logs: DashboardRecentLog[];
  loading: boolean;
}>();

function extractText(content: any): string {
  if (!content) return "";
  if (typeof content === "object" && content.platforms) {
    const text = content.platforms.map((p: any) => p.content ?? "").join(" ");
    return text.replace(/<[^>]+>/g, "").slice(0, 100);
  }
  return String(content).replace(/<[^>]+>/g, "").slice(0, 100);
}
</script>

<style lang="scss" scoped>
.wb-logs {
  padding: 20px 24px;
  background: var(--cyber-panel-strong);
  border: 1px solid var(--cyber-border);
  border-radius: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--cyber-text);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__item {
    padding: 14px 16px;
    background: color-mix(in srgb, var(--cyber-bg-deep) 60%, transparent);
    border: 1px solid var(--cyber-border);
    border-radius: 14px;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;

    &:hover {
      border-color: rgba(95, 169, 121, 0.3);
      transform: translateX(3px);
    }
  }

  &__item-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  &__date {
    font-size: 13px;
    font-weight: 700;
    color: #5fa979;
  }

  &__tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  &__tag {
    font-size: 11px;
    padding: 1px 8px;
    border-radius: 6px;
    background: rgba(95, 169, 121, 0.12);
    color: #3a8f5e;
    font-weight: 600;
  }

  &__text {
    font-size: 13px;
    color: var(--cyber-text-soft);
    line-height: 1.55;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
