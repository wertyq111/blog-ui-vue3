<template>
  <div class="quick-grid">
    <section class="quick-card">
      <span class="card-tape card-tape-mint">PLATFORMS</span>
      <div class="card-head">
        <div>
          <div class="card-title">平台来源</div>
          <div class="card-sub">{{ platformSummary }}</div>
        </div>
        <a class="card-link" @click="router.push('/develop/work-platform')">管理 →</a>
      </div>

      <div v-if="loading" class="quick-skeleton">
        <el-skeleton :rows="3" animated />
      </div>
      <el-empty v-else-if="!platformCards.length" :image-size="48" description="暂无平台" />
      <div v-else class="qa-platforms">
        <button
          v-for="platform in platformCards"
          :key="platform.name"
          type="button"
          :class="['qa-platform', { 'qa-platform-active': platform.isFavorite }]"
          @click="router.push('/develop/work-platform')"
        >
          <span class="qa-platform-ico">{{ platform.icon }}</span>
          <span class="qa-platform-copy">
            <span class="qa-platform-name">{{ platform.name }}</span>
            <span class="qa-platform-desc">{{ platform.desc }}</span>
          </span>
          <span class="qa-count">{{ platform.count }}</span>
        </button>
      </div>
    </section>

    <section class="quick-card">
      <span class="card-tape">DOCS</span>
      <div class="card-head">
        <div>
          <div class="card-title">最近文档</div>
          <div class="card-sub">{{ docsSummary }}</div>
        </div>
        <a class="card-link" @click="router.push('/develop/work-doc')">全部 →</a>
      </div>

      <div v-if="loading" class="quick-skeleton">
        <el-skeleton :rows="5" animated />
      </div>
      <el-empty v-else-if="!recentDocs.length" :image-size="48" description="暂无文档" />
      <div v-else class="qa-list">
        <button
          v-for="doc in recentDocs"
          :key="doc.id"
          type="button"
          class="qa-item"
          @click="router.push('/develop/work-doc')"
        >
          <span>
            <span class="qa-item-title">{{ doc.title }}</span>
            <span class="qa-item-meta">
              <span class="qa-pill qa-pill-mint">{{ doc.category?.name || doc.templateType || "文档" }}</span>
              <span>{{ countWords(doc.content).toLocaleString() }} 字</span>
            </span>
          </span>
          <span class="qa-item-date">{{ fmtDate(doc.updateTime) }}</span>
        </button>
      </div>
    </section>

    <section class="quick-card">
      <span class="card-tape card-tape-pink">PATH · MODEL</span>
      <div class="card-head">
        <div>
          <div class="card-title">路径 & 模型</div>
          <div class="card-sub">配置类内容快速跳转</div>
        </div>
      </div>

      <div v-if="loading" class="quick-skeleton">
        <el-skeleton :rows="6" animated />
      </div>
      <el-empty v-else-if="!pathItems.length && !modelItems.length" :image-size="48" description="暂无配置" />
      <div v-else class="qa-list">
        <button
          v-for="path in pathItems"
          :key="'path-' + path.id"
          type="button"
          class="qa-item"
          @click="router.push('/develop/convert-path')"
        >
          <span>
            <span class="qa-item-title">{{ path.name }} → {{ shortPath(path.target || path.url) }}</span>
            <span class="qa-item-meta">
              <span class="qa-pill qa-pill-yellow">{{ path.code || "路径" }}</span>
            </span>
          </span>
          <span class="qa-item-date">{{ fmtDate(path.updateTime) }}</span>
        </button>

        <button
          v-for="model in modelItems"
          :key="'model-' + model.id"
          type="button"
          class="qa-item"
          @click="router.push('/develop/init-model')"
        >
          <span>
            <span class="qa-item-title">{{ model.name }} · {{ model.code }}</span>
            <span class="qa-item-meta">
              <span class="qa-pill qa-pill-pink">模型</span>
              <span>{{ model.tip || "模板" }}</span>
            </span>
          </span>
          <span class="qa-item-date">{{ fmtDate(model.updateTime) }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import { computed, onMounted, ref } from "vue";

import { useRouter } from "vue-router";
import WorkDocAPI from "@/api/develop/work-doc";
import WorkPlatformAPI from "@/api/develop/work-platform";
import ServerPathAPI from "@/api/develop/server-path";
import InitModelAPI from "@/api/develop/init-model";
import type { DashboardMetrics, DashboardPlatformDist } from "@/types/api/dashboard-stats";
import type { WorkDocItem } from "@/types/api/work-doc";
import type { WorkPlatformItem } from "@/types/api/work-platform";
import type { ServerPathItem } from "@/types/api/server-path";
import type { InitModelItem } from "@/types/api/init-model";

const props = defineProps<{
  metrics: DashboardMetrics | null;
  platformDist: DashboardPlatformDist[];
}>();

const router = useRouter();
const loading = ref(true);
const platforms = ref<WorkPlatformItem[]>([]);
const recentDocs = ref<WorkDocItem[]>([]);
const docsTotal = ref(0);
const pathItems = ref<ServerPathItem[]>([]);
const modelItems = ref<InitModelItem[]>([]);

const platformSummary = computed(() => {
  const favorite = props.metrics?.favorite_platform?.name;
  return `${platforms.value.length.toLocaleString()} 个绑定中${favorite ? ` · 主力${favorite}` : ""}`;
});

const docsSummary = computed(() => {
  const total = props.metrics?.total_docs.value ?? docsTotal.value;
  const delta = props.metrics?.total_docs.delta_7d;
  if (typeof delta !== "number") return `${total.toLocaleString()} 篇`;
  return `${total.toLocaleString()} 篇 · 本周 ${delta >= 0 ? "+" : ""}${delta.toLocaleString()}`;
});

const platformCards = computed(() => {
  const favoriteName = props.metrics?.favorite_platform?.name;
  const distByName = new Map(props.platformDist.map((item) => [item.name, item]));
  return platforms.value.slice(0, 4).map((platform, index) => {
    const dist = distByName.get(platform.name);
    const isFavorite = favoriteName === platform.name || (!favoriteName && index === 0);
    return {
      name: platform.name,
      icon: platform.name.slice(0, 1),
      desc: isFavorite ? "主力 · 工作日报与项目沉淀" : dist ? `来源占比 ${dist.pct}%` : "已绑定平台来源",
      count: dist ? formatWords(dist.words) : String(platform.sort ?? index + 1),
      isFavorite,
    };
  });
});

onMounted(fetchQuickAccess);

async function fetchQuickAccess() {
  loading.value = true;
  try {
    const [platformList, docPage, pathPage, modelPage] = await Promise.all([
      WorkPlatformAPI.getList(1),
      WorkDocAPI.getPage({ pageNum: 1, pageSize: 5 }),
      ServerPathAPI.getPage({ pageNum: 1, pageSize: 3 }),
      InitModelAPI.getPage({ pageNum: 1, pageSize: 3 }),
    ]);
    platforms.value = platformList;
    recentDocs.value = docPage.list.slice(0, 5);
    docsTotal.value = docPage.total;
    pathItems.value = pathPage.list.slice(0, 3);
    modelItems.value = modelPage.list.slice(0, 3);
  } catch {
    message.error("快捷入口加载失败");
  } finally {
    loading.value = false;
  }
}

function countWords(content: string): number {
  return (content || "").replace(/<[^>]+>/g, "").replace(/\s+/g, "").length;
}

function formatWords(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString();
}

function fmtDate(value: string): string {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[2]}-${match[3]}` : value.slice(0, 5);
}

function shortPath(value: string): string {
  if (!value) return "-";
  try {
    const url = new URL(value);
    return url.pathname || url.host;
  } catch {
    const clean = value.replace(/\/+$/, "");
    const parts = clean.split("/");
    return parts.length > 2 ? `/${parts.slice(-2).join("/")}` : clean;
  }
}
</script>

<style lang="scss" scoped>
.quick-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 14px;
}

.quick-card {
  position: relative;
  min-height: 260px;
  padding: 24px 22px 18px;
  background: var(--ai-paper, #fdfdf5);
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 24px;
  box-shadow: 0 3px 10px 0 rgba(61, 52, 40, 0.06);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.card-title {
  color: var(--ai-text, #794f27);
  font-size: 15px;
  font-weight: 800;
}

.card-sub {
  margin-top: 3px;
  color: var(--ai-text-2, #9f927d);
  font-size: 12px;
  font-weight: 600;
}

.card-link {
  color: var(--ai-primary-active, #11a89b);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.6;
  white-space: nowrap;
  cursor: pointer;
}

.card-link:hover {
  color: var(--ai-primary, #19c8b9);
}

.card-tape {
  position: absolute;
  top: -12px;
  left: 24px;
  padding: 4px 12px;
  border: 2px solid #c89a3a;
  border-radius: 6px;
  background: var(--ai-yellow, #f7cd67);
  color: #5a3a18;
  box-shadow: 0 2px 0 0 #c89a3a, inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  transform: rotate(-3deg);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  line-height: 1.2;
}

.card-tape-mint {
  border-color: var(--ai-primary-active, #11a89b);
  background: var(--ai-primary-bg, #dff8f3);
  color: var(--ai-primary-active, #11a89b);
  box-shadow: 0 2px 0 0 var(--ai-primary-active, #11a89b), inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.card-tape-pink {
  border-color: #d6788a;
  background: #ffe0e6;
  color: #c05f76;
  box-shadow: 0 2px 0 0 #d6788a, inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.quick-skeleton {
  padding-top: 4px;
}

.qa-platforms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.qa-platform,
.qa-item {
  appearance: none;
  width: 100%;
  border: 2px solid var(--ai-border, #e8e2d6);
  background: var(--ai-card, #f8f1d9);
  cursor: pointer;
  transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
  text-align: left;
}

.qa-platform {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 12px 14px;
  border-radius: 16px;
}

.qa-platform:hover,
.qa-item:hover,
.qa-platform-active {
  border-color: var(--ai-primary, #19c8b9);
}

.qa-platform:hover,
.qa-item:hover {
  transform: translateY(-2px);
}

.qa-platform-ico {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 12px;
  background: #fff;
  color: var(--ai-text, #794f27);
  font-size: 16px;
  font-weight: 900;
}

.qa-platform-copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.qa-platform-name,
.qa-item-title {
  display: block;
  overflow: hidden;
  color: var(--ai-text, #794f27);
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qa-platform-desc {
  display: block;
  overflow: hidden;
  color: var(--ai-text-2, #9f927d);
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qa-count {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--ai-primary-bg, #dff8f3);
  color: var(--ai-primary-active, #11a89b);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.qa-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qa-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px;
  align-items: flex-start;
  min-height: 56px;
  padding: 10px 12px;
  border-radius: 14px;
}

.qa-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
  color: var(--ai-text-2, #9f927d);
  font-size: 11px;
  font-weight: 600;
}

.qa-item-date {
  color: var(--ai-text-3, #c4b89e);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.qa-pill {
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--ai-bg-2, #f4ead8);
  color: var(--ai-text-2, #9f927d);
  font-weight: 700;
}

.qa-pill-mint {
  background: var(--ai-primary-bg, #dff8f3);
  color: var(--ai-primary-active, #11a89b);
}

.qa-pill-yellow {
  background: #fff2ba;
  color: #9f7c00;
}

.qa-pill-pink {
  background: #ffe0e6;
  color: #c05f76;
}

@media (max-width: 1500px) {
  .quick-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 1100px) {
  .quick-grid,
  .qa-platforms {
    grid-template-columns: 1fr;
  }
}
</style>
