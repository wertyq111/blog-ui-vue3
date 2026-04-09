<template>
  <div class="develop-page admin-workspace-page workplace-page">
    <el-card shadow="never" class="develop-shell admin-workspace-shell workplace-shell">
      <!-- Hero 区域: 欢迎与快捷操作 -->
      <section class="develop-hero workplace-hero">
        <div class="develop-hero__copy workplace-hero__copy">
          <div class="develop-hero__eyebrow">DASHBOARD</div>
          <div class="workplace-hero__title-row">
            <div>
              <h1 class="develop-hero__title">
                {{ greetings }}{{ userStore.userInfo.nickname }}
              </h1>
              <p class="develop-hero__desc">
                这是你的个人工作台，集中管理开发日志、文档与平台工具，优先处理今天要推进的任务。
              </p>
            </div>
          </div>
        </div>
        <div class="workplace-hero__actions">
          <el-button type="primary" icon="plus" @click="router.push('/develop/work-daily')">写日志</el-button>
          <el-button type="success" icon="document" @click="router.push('/develop/work-doc')">新文档</el-button>
          <el-button type="warning" icon="refresh" @click="router.push('/develop/convert-path')">路径转换</el-button>
        </div>
      </section>

      <!-- 统计概览区 -->
      <section class="develop-panel workplace-overview">
        <el-row :gutter="20">
          <el-col v-for="item in overviewCards" :key="item.label" :span="6" :xs="12" :sm="6">
            <div class="workplace-overview__item">
              <div class="workplace-overview__label">
                <el-icon :class="item.colorClass"><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </div>
              <div class="workplace-overview__value">{{ item.value }}</div>
              <div class="workplace-overview__hint">{{ item.hint }}</div>
            </div>
          </el-col>
        </el-row>
      </section>

      <section class="workplace-layout mt-5">
        <el-row :gutter="18">
          <!-- 左侧主内容 -->
          <el-col :span="16" :xs="24">
            <div class="develop-table-shell mt-0 mb-5 workplace-main-panel">
              <div class="develop-table-shell__header">
                <div>
                  <div class="develop-table-shell__title">最近工作日志</div>
                  <div class="develop-table-shell__desc">追踪近期开发记录、所属平台与摘要。</div>
                </div>
                <el-link type="primary" underline="never" @click="router.push('/develop/work-daily')">查看全部</el-link>
              </div>
              <div v-loading="loading.logs" class="min-h-[200px]">
                <el-empty v-if="!recentLogs.length" :image-size="60" description="暂无日志" />
                <div v-else class="workplace-log-list">
                  <article v-for="log in recentLogs" :key="log.id" class="workplace-log-item" @click="router.push('/develop/work-daily')">
                    <div class="workplace-log-item__head">
                      <div class="workplace-log-item__date">{{ log.logDate }}</div>
                      <div class="workplace-log-item__platforms">
                        <template v-if="log.content && typeof log.content === 'object' && log.content.platforms">
                          <span v-for="p in log.content.platforms" :key="p.platform_id" class="workplace-chip">
                            {{ p.platform_name }}
                          </span>
                        </template>
                      </div>
                    </div>
                    <div class="workplace-log-item__content truncate-2">
                      {{ formatLogContent(log.content) }}
                    </div>
                  </article>
                </div>
              </div>
            </div>

            <div class="develop-table-shell mt-0 workplace-main-panel">
              <div class="develop-table-shell__header">
                <div>
                  <div class="develop-table-shell__title">最近工作文档</div>
                  <div class="develop-table-shell__desc">快速访问最近编辑或创建的文档。</div>
                </div>
                <el-link type="primary" underline="never" @click="router.push('/develop/work-doc')">查看全部</el-link>
              </div>
              <div v-loading="loading.docs" class="min-h-[200px]">
                <el-empty v-if="!recentDocs.length" :image-size="60" description="暂无文档" />
                <div v-else class="workplace-doc-list">
                  <div v-for="doc in recentDocs" :key="doc.id" class="workplace-doc-item" @click="router.push('/develop/work-doc')">
                    <div class="workplace-doc-item__info">
                      <div class="workplace-doc-item__title">{{ doc.title }}</div>
                      <div class="workplace-doc-item__meta">
                        <el-tag size="small" effect="plain" class="rounded-pill">{{ doc.category?.name || '未分类' }}</el-tag>
                        <span class="ml-2 text-xs text-gray-400">{{ doc.updateTime }}</span>
                      </div>
                    </div>
                    <el-icon class="workplace-doc-item__arrow"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </el-col>

          <!-- 右侧侧边栏 -->
          <el-col :span="8" :xs="24">
            <div class="develop-panel mt-0 mb-5 workplace-side-panel">
              <div class="develop-table-shell__title mb-4">活跃工作平台</div>
              <div v-loading="loading.platforms">
                <el-empty v-if="!activePlatforms.length" :image-size="40" description="未配置平台" />
                <div v-else class="workplace-platform-grid">
                  <div v-for="p in activePlatforms" :key="p.id" class="workplace-platform-tag">
                    <span class="dot" :class="{ 'is-active': p.status === 1 }"></span>
                    {{ p.name }}
                  </div>
                </div>
              </div>
            </div>

            <div class="develop-panel mt-0 workplace-side-panel">
              <div class="develop-table-shell__title mb-4">开发入口</div>
              <div class="workplace-tool-links">
                <div v-for="tool in toolLinks" :key="tool.path" class="workplace-tool-item" @click="router.push(tool.path)">
                  <div class="workplace-tool-item__icon">
                    <el-icon><component :is="tool.icon" /></el-icon>
                  </div>
                  <div class="workplace-tool-item__name">{{ tool.name }}</div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </section>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { Monitor, EditPen, Document, Tools, ArrowRight } from "@element-plus/icons-vue";

// API
import WorkPlatformAPI from "@/api/develop/work-platform";
import WorkDailyAPI from "@/api/develop/work-daily";
import WorkDocAPI from "@/api/develop/work-doc";
import ServerPathAPI from "@/api/develop/server-path";
import InitModelAPI from "@/api/develop/init-model";

defineOptions({ name: "Dashboard" });

const router = useRouter();
const userStore = useUserStore();

// 问候语逻辑
const greetings = computed(() => {
  const hours = new Date().getHours();
  if (hours >= 6 && hours < 9) return "早上好，";
  if (hours >= 9 && hours < 12) return "上午好，";
  if (hours >= 12 && hours < 14) return "中午好，";
  if (hours >= 14 && hours < 18) return "下午好，";
  if (hours >= 18 && hours < 24) return "晚上好，";
  return "夜深了，注意休息，";
});

// 数据状态
const stats = reactive({
  platforms: 0,
  logs: 0,
  docs: 0,
  tools: 0,
});

const loading = reactive({
  logs: false,
  docs: false,
  platforms: false,
});

const recentLogs = ref<any[]>([]);
const recentDocs = ref<any[]>([]);
const activePlatforms = ref<any[]>([]);

const overviewCards = computed(() => [
  { label: '工作平台', value: stats.platforms, icon: 'Monitor', hint: '活跃接入点', colorClass: 'text-blue-500' },
  { label: '工作日志', value: stats.logs, icon: 'EditPen', hint: '累计开发记录', colorClass: 'text-green-500' },
  { label: '文档总数', value: stats.docs, icon: 'Document', hint: '知识资产储备', colorClass: 'text-purple-500' },
  { label: '开发工具', value: stats.tools, icon: 'Tools', hint: '效率辅助模块', colorClass: 'text-orange-500' },
]);

const toolLinks = [
  { name: "路径转换", path: "/develop/convert-path", icon: "Refresh" },
  { name: "模型初始化", path: "/develop/init-model", icon: "CirclePlus" },
  { name: "工作平台", path: "/develop/work-platform", icon: "Monitor" },
  { name: "工作日常", path: "/develop/work-daily", icon: "EditPen" },
  { name: "工作文档", path: "/develop/work-doc", icon: "Document" },
];

async function fetchStats() {
  loading.platforms = true;
  loading.logs = true;
  loading.docs = true;
  try {
    const platformsData = await WorkPlatformAPI.getList(1);
    stats.platforms = platformsData.length;
    activePlatforms.value = platformsData;
    loading.platforms = false;

    const logsPage = await WorkDailyAPI.getPage({ pageNum: 1, pageSize: 5 });
    stats.logs = logsPage.total;
    recentLogs.value = logsPage.list;
    loading.logs = false;

    const docsPage = await WorkDocAPI.getPage({ pageNum: 1, pageSize: 5 });
    stats.docs = docsPage.total;
    recentDocs.value = docsPage.list;
    loading.docs = false;

    const pathTools = await ServerPathAPI.getPage({ pageNum: 1, pageSize: 1 });
    const modelTools = await InitModelAPI.getPage({ pageNum: 1, pageSize: 1 });
    stats.tools = pathTools.total + modelTools.total;
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
  } finally {
    loading.platforms = false;
    loading.logs = false;
    loading.docs = false;
  }
}

function formatLogContent(content: any) {
  if (content && typeof content === "object" && content.platforms) {
    return content.platforms.map((p: any) => p.content).join(" ").replace(/<[^>]+>/g, "");
  }
  const text = String(content || "").replace(/<[^>]+>/g, "");
  return text.length > 80 ? text.substring(0, 80) + "..." : text;
}

onMounted(() => {
  fetchStats();
});
</script>

<style lang="scss" scoped>
.workplace-shell {
  background: transparent !important;
}

.workplace-overview {
  padding: 24px !important;
  
  &__item {
    padding: 0 16px;
    border-right: 1px solid rgba(122, 161, 38, 0.08);
    &:last-child { border-right: none; }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(88, 102, 86, 0.82);
    margin-bottom: 8px;
    
    .el-icon { font-size: 18px; }
  }

  &__value {
    font-size: 26px;
    font-weight: 800;
    color: var(--cyber-text);
    line-height: 1;
    margin-bottom: 6px;
  }

  &__hint {
    font-size: 11px;
    color: var(--cyber-text-mute);
  }
}

.workplace-log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workplace-log-item {
  padding: 16px;
  background: color-mix(in srgb, var(--cyber-panel-strong) 86%, transparent);
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--cyber-border) 88%, transparent);
  cursor: pointer;
  transition: all 0.26s ease;

  &:hover {
    background: color-mix(in srgb, var(--cyber-primary) 8%, var(--cyber-panel-strong));
    transform: translateX(4px);
    border-color: color-mix(in srgb, var(--cyber-primary) 24%, transparent);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__date {
    font-size: 14px;
    font-weight: 700;
    color: var(--el-color-primary);
  }

  &__content {
    font-size: 13px;
    line-height: 1.6;
    color: var(--cyber-text-soft);
  }
}

.workplace-chip {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  background: color-mix(in srgb, var(--cyber-primary) 12%, transparent);
  color: var(--cyber-primary-strong);
  border-radius: 6px;
  margin-left: 6px;
  font-weight: 600;
}

.workplace-doc-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.workplace-doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--cyber-panel-strong) 86%, transparent);
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--cyber-border) 88%, transparent);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: color-mix(in srgb, var(--cyber-primary) 8%, var(--cyber-panel-strong));
    .workplace-doc-item__arrow { transform: translateX(3px); color: var(--el-color-primary); }
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--cyber-text);
    margin-bottom: 4px;
  }

  &__arrow { color: var(--cyber-text-mute); transition: all 0.2s; }
}

.workplace-platform-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.workplace-platform-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--cyber-panel-strong) 88%, transparent);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--cyber-text-soft);

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--cyber-text-mute);
    &.is-active {
      background: var(--cyber-primary);
      box-shadow: 0 0 8px color-mix(in srgb, var(--cyber-primary) 60%, transparent);
    }
  }
}

.workplace-tool-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.workplace-tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: color-mix(in srgb, var(--cyber-panel-strong) 86%, transparent);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: color-mix(in srgb, var(--cyber-primary) 8%, var(--cyber-panel-strong));
    transform: translateY(-2px);
    .workplace-tool-item__icon { background: var(--el-color-primary); color: #fff; }
  }

  &__icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--cyber-panel-strong) 92%, transparent);
    border-radius: 10px;
    font-size: 20px;
    color: var(--el-color-primary);
    transition: all 0.3s;
  }

  &__name { font-size: 12px; font-weight: 600; color: var(--cyber-text-soft); }
}

.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rounded-pill { border-radius: 999px !important; }

// 暗黑模式
:global(body.cyber-theme-dark) {
  .workplace-overview__item { border-right-color: rgba(103, 175, 242, 0.1); }
  .workplace-overview__value { color: var(--cyber-text); }
  .workplace-overview__label, .workplace-overview__hint { color: var(--cyber-text-soft); }
  
  .workplace-log-item, .workplace-doc-item, .workplace-platform-tag, .workplace-tool-item {
    background: rgba(15, 26, 40, 0.4);
    border-color: rgba(103, 175, 242, 0.1);
  }
  
  .workplace-log-item:hover, .workplace-doc-item:hover, .workplace-tool-item:hover {
    background: rgba(25, 47, 70, 0.6);
  }
  
  .workplace-doc-item__title, .workplace-tool-item__name, .workplace-platform-tag {
    color: var(--cyber-text);
  }
  
  .workplace-log-item__content { color: var(--cyber-text-soft); }
  
  .workplace-tool-item__icon {
    background: rgba(34, 80, 126, 0.36);
  }
}
</style>
