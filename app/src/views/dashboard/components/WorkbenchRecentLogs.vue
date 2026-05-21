<template>
  <div class="wb-logs">
    <span class="wb-logs__tape">最近日志</span>
    <div class="wb-logs__head">
      <div>
        <div class="wb-logs__title">最近写下的日常</div>
        <div class="wb-logs__sub" v-if="!loading">{{ logsSummary }}</div>
      </div>
      <a class="wb-logs__link" @click="$router.push('/develop/work-daily')">查看全部 →</a>
    </div>
    <div v-if="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <el-empty v-else-if="!logs.length" :image-size="48" description="暂无日志" />
    <div v-else class="wb-logs__rows">
      <div
        v-for="log in logs"
        :key="log.id"
        class="log-row"
        @click="$router.push('/develop/work-daily')"
      >
        <div class="log-date">
          <div class="log-date-md">{{ fmtDateMD(log.log_date) }}</div>
          <div class="log-date-y">{{ fmtDateY(log.log_date) }}</div>
        </div>
        <div class="log-body">
          <div class="log-title">{{ extractTitle(log.content) }}</div>
          <div class="log-desc">{{ extractDesc(log.content) }}</div>
          <div class="log-meta">
            <span class="log-words">{{ countWords(log.content).toLocaleString() }} 字</span>
            <span v-for="t in (log.tags || [])" :key="t" class="log-tag">#{{ t }}</span>
          </div>
        </div>
        <button class="log-action" type="button">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 4l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DashboardKpiItem, DashboardRecentLog } from "@/types/api/dashboard-stats";

const props = defineProps<{
  logs: DashboardRecentLog[];
  totalLogs: DashboardKpiItem | null;
  loading: boolean;
}>();

const logsSummary = computed(() => {
  const total = props.totalLogs?.value ?? props.logs.length;
  const delta = props.totalLogs?.delta_7d;
  if (typeof delta !== "number") return `共 ${total.toLocaleString()} 条`;
  return `共 ${total.toLocaleString()} 条 · 本周 ${delta >= 0 ? "+" : ""}${delta.toLocaleString()}`;
});

function fmtDateMD(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts.length >= 3 ? `${parts[1]}-${parts[2]}` : dateStr;
}

function fmtDateY(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.split("-")[0] || "";
}

function getRawText(content: any): string {
  if (!content) return "";
  if (typeof content === "object" && content.platforms) {
    return content.platforms.map((p: any) => p.content ?? "").join("\n");
  }
  return String(content);
}

function extractTitle(content: any): string {
  const raw = getRawText(content);
  // Try to extract first markdown heading
  const headingMatch = raw.match(/^#{1,4}\s+(.+)/m);
  if (headingMatch) return headingMatch[1].replace(/\*\*/g, "").trim().slice(0, 60);
  // Fallback: first non-empty line
  const firstLine = raw.split("\n").find((l: string) => l.trim().length > 0);
  return (firstLine || "").replace(/^#+\s*/, "").replace(/\*\*/g, "").trim().slice(0, 60) || "无标题";
}

function extractDesc(content: any): string {
  const raw = getRawText(content);
  // Skip headings, get the first paragraph-like text
  const lines = raw.split("\n").filter((l: string) => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith("#") && !t.startsWith("|") && !t.startsWith("---");
  });
  const text = lines.slice(0, 2).join(" ").replace(/\*\*/g, "").replace(/<[^>]+>/g, "").trim();
  return text.slice(0, 120);
}

function countWords(content: any): number {
  const raw = getRawText(content);
  // Count Chinese characters + words
  const clean = raw.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
  return clean.length;
}
</script>

<style lang="scss" scoped>
.wb-logs {
  position: relative;
  padding: 24px 22px 18px;
  background: var(--ai-paper, #fdfdf5);
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 24px;
  box-shadow: 0 3px 10px 0 rgba(61, 52, 40, 0.06);

  &__tape {
    position: absolute;
    top: -12px;
    left: 24px;
    padding: 4px 12px;
    border: 2px solid #d6788a;
    border-radius: 6px;
    background: #ffe0e6;
    color: #c05f76;
    box-shadow: 0 2px 0 0 #d6788a, inset 0 0 0 1px rgba(255, 255, 255, 0.4);
    transform: rotate(-3deg);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    line-height: 1.2;
  }

  &__head {
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

  &__link {
    font-size: 12px;
    color: var(--ai-primary-active, #11a89b);
    cursor: pointer;
    font-weight: 800;
    white-space: nowrap;
    line-height: 1.6;

    &:hover {
      color: var(--ai-primary, #19c8b9);
    }
  }

  &__rows {
    display: flex;
    flex-direction: column;
  }
}

.log-row {
  display: grid;
  grid-template-columns: 64px 1fr 32px;
  gap: 16px;
  padding: 14px 0;
  border-top: 2px dashed var(--ai-border, #e8e2d6);
  align-items: center;
  cursor: pointer;

  &:first-child {
    border-top: 0;
    padding-top: 4px;
  }

  &:hover .log-action {
    background: var(--ai-primary-bg, #dff8f3);
    color: var(--ai-primary-active, #11a89b);
  }
}

.log-date {
  padding: 6px 4px;
  background: var(--ai-bg-2, #f4ead8);
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 12px;
  text-align: center;
}

.log-date-md {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  color: var(--ai-text, #794f27);
  font-family: "Nunito", "Noto Sans SC", "HarmonyOS Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.log-date-y {
  font-size: 10px;
  color: var(--ai-text-2, #9f927d);
  margin-top: 4px;
  font-weight: 700;
}

.log-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--ai-text, #794f27);
}

.log-desc {
  font-size: 12px;
  color: var(--ai-text-2, #9f927d);
  margin-top: 3px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.55;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.log-words {
  font-size: 11px;
  color: var(--ai-primary-active, #11a89b);
  background: var(--ai-primary-bg, #dff8f3);
  padding: 2px 9px;
  border-radius: 999px;
  font-weight: 800;
}

.log-tag {
  font-size: 11px;
  color: var(--ai-text-2, #9f927d);
  font-weight: 700;
}

.log-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 0;
  background: #fff;
  cursor: pointer;
  color: var(--ai-text, #794f27);
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 3px 0 0 var(--ai-shadow-color, #bdaea0);
  transition: background 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 0 0 var(--ai-shadow-color, #bdaea0);
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 0 var(--ai-shadow-color, #bdaea0);
  }
}
</style>
