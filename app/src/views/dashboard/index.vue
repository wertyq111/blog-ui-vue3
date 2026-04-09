<template>
  <div class="develop-page">
    <el-card shadow="never" class="develop-shell">
      <!-- Hero: 欢迎区 -->
      <section class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">DASHBOARD</div>
          <h1 class="develop-hero__title">欢迎回来，{{ userStore.userInfo.nickname }}</h1>
          <p class="develop-hero__desc">
            {{ greetings.replace('，', '') }}。这是你的个人工作台，快速访问常用功能和查看近期数据。
          </p>
        </div>
        <div class="develop-hero__actions">
          <el-avatar :size="64" :src="userStore.userInfo.avatar" class="shadow-sm" />
        </div>
      </section>

      <!-- 快捷操作区 -->
      <section class="develop-panel mb-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm font-bold text-[#2a3529]">常用功能:</span>
            <el-button type="primary" icon="plus" @click="router.push('/develop/work-daily')">写日志</el-button>
            <el-button type="success" icon="document" @click="router.push('/develop/work-doc')">新文档</el-button>
            <el-button type="warning" icon="refresh" @click="router.push('/develop/convert-path')">路径转换</el-button>
          </div>
        </div>
      </section>

      <!-- 统计卡片区 -->
      <section class="develop-panel dashboard-stats-panel mb-5">
        <el-row :gutter="20">
          <el-col :span="6" :xs="12" :sm="6" class="mb-4 sm:mb-0">
            <div class="stat-card-mini">
              <div class="stat-card-mini__icon text-blue-500"><Monitor /></div>
              <div class="stat-card-mini__info">
                <div class="stat-card-mini__label">工作平台</div>
                <div class="stat-card-mini__value">{{ stats.platforms }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6" :xs="12" :sm="6" class="mb-4 sm:mb-0">
            <div class="stat-card-mini">
              <div class="stat-card-mini__icon text-green-500"><EditPen /></div>
              <div class="stat-card-mini__info">
                <div class="stat-card-mini__label">工作日志</div>
                <div class="stat-card-mini__value">{{ stats.logs }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6" :xs="12" :sm="6">
            <div class="stat-card-mini">
              <div class="stat-card-mini__icon text-purple-500"><Document /></div>
              <div class="stat-card-mini__info">
                <div class="stat-card-mini__label">文档总数</div>
                <div class="stat-card-mini__value">{{ stats.docs }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6" :xs="12" :sm="6">
            <div class="stat-card-mini">
              <div class="stat-card-mini__icon text-orange-500"><Tools /></div>
              <div class="stat-card-mini__info">
                <div class="stat-card-mini__label">开发工具</div>
                <div class="stat-card-mini__value">{{ stats.tools }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </section>

      <!-- 主内容区 -->
      <el-row :gutter="18">
        <!-- 左侧: 近期列表 -->
        <el-col :span="16" :xs="24">
          <div class="develop-table-shell mt-0 mb-5">
            <div class="develop-table-shell__header">
              <div>
                <div class="develop-table-shell__title">最近日志</div>
                <div class="develop-table-shell__desc">你最近提交的工作内容记录。</div>
              </div>
              <el-button type="primary" link @click="router.push('/develop/work-daily')">查看更多</el-button>
            </div>
            <div v-loading="loading.logs" class="min-h-[240px]">
              <el-empty v-if="!recentLogs.length" :image-size="60" description="暂无日志" />
              <div v-else class="dashboard-recent-list">
                <div v-for="log in recentLogs" :key="log.id" class="recent-item" @click="router.push('/develop/work-daily')">
                  <div class="recent-item__head">
                    <span class="recent-item__date">{{ log.logDate }}</span>
                    <span class="recent-item__time">{{ log.createTime }}</span>
                  </div>
                  <div class="recent-item__body truncate">
                    {{ formatLogContent(log.content) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="develop-table-shell mt-0">
            <div class="develop-table-shell__header">
              <div>
                <div class="develop-table-shell__title">最近文档</div>
                <div class="develop-table-shell__desc">你最近编辑或创建的工作文档。</div>
              </div>
              <el-button type="primary" link @click="router.push('/develop/work-doc')">查看更多</el-button>
            </div>
            <div v-loading="loading.docs" class="min-h-[240px]">
              <el-empty v-if="!recentDocs.length" :image-size="60" description="暂无文档" />
              <div v-else class="dashboard-recent-list">
                <div v-for="doc in recentDocs" :key="doc.id" class="recent-item" @click="router.push('/develop/work-doc')">
                  <div class="recent-item__head">
                    <span class="recent-item__title">{{ doc.title }}</span>
                    <span class="recent-item__time">{{ doc.updateTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧: 工具/入口 -->
        <el-col :span="8" :xs="24">
          <div class="develop-panel mt-0 mb-5">
            <div class="develop-table-shell__title mb-4">活跃工作平台</div>
            <div v-loading="loading.platforms">
              <el-empty v-if="!activePlatforms.length" :image-size="40" description="未配置平台" />
              <div v-else class="flex flex-wrap gap-2">
                <el-tag v-for="p in activePlatforms" :key="p.id" size="large" type="success" effect="plain" class="rounded-pill">
                  {{ p.name }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="develop-panel mt-0">
            <div class="develop-table-shell__title mb-4">开发入口</div>
            <div class="tool-links flex flex-col gap-3">
              <div v-for="tool in toolLinks" :key="tool.path" class="tool-item-link" @click="router.push(tool.path)">
                <div class="flex items-center">
                  <div class="tool-item-link__icon">
                    <el-icon><component :is="tool.icon" /></el-icon>
                  </div>
                  <span class="tool-item-link__name">{{ tool.name }}</span>
                </div>
                <el-icon class="tool-item-link__arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
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

    const logsPage = await WorkDailyAPI.getPage({ pageNum: 1, pageSize: 6 });
    stats.logs = logsPage.total;
    recentLogs.value = logsPage.list;
    loading.logs = false;

    const docsPage = await WorkDocAPI.getPage({ pageNum: 1, pageSize: 6 });
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
    return content.platforms.map((p: any) => `【${p.platform_name}】`).join(" ");
  }
  const text = String(content || "").replace(/<[^>]+>/g, "");
  return text.length > 80 ? text.substring(0, 80) + "..." : text;
}

onMounted(() => {
  fetchStats();
});
</script>

<style lang="scss" scoped>
.dashboard-stats-panel {
  padding: 24px !important;
}

.stat-card-mini {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(150, 180, 140, 0.1);
  }

  &__icon {
    font-size: 28px;
    opacity: 0.85;
  }

  &__label {
    font-size: 12px;
    color: rgba(88, 102, 86, 0.82);
    margin-bottom: 2px;
  }

  &__value {
    font-size: 20px;
    font-weight: 700;
    color: #2a3529;
  }
}

.dashboard-recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.26s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: var(--el-color-primary-light-5);
    transform: translateX(4px);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  &__date, &__title {
    font-weight: 600;
    color: var(--el-color-primary);
    font-size: 14px;
  }

  &__title {
    color: #2a3529;
  }

  &__time {
    font-size: 11px;
    color: rgba(88, 102, 86, 0.6);
  }

  &__body {
    font-size: 13px;
    color: rgba(88, 102, 86, 0.82);
    line-height: 1.5;
  }
}

.tool-item-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fff;
    border-color: var(--el-color-primary);
    
    .tool-item-link__icon {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      transform: scale(1.1);
    }
    
    .tool-item-link__arrow {
      transform: translateX(3px);
      color: var(--el-color-primary);
    }
  }

  &__icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    margin-right: 12px;
    color: rgba(88, 102, 86, 0.8);
    transition: all 0.3s ease;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: #2a3529;
  }

  &__arrow {
    font-size: 12px;
    color: #99a;
    transition: all 0.2s ease;
  }
}

.rounded-pill {
  border-radius: 999px !important;
}

// 暗黑模式适配
html.dark {
  .stat-card-mini, .recent-item, .tool-item-link {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color-lighter);
  }
  
  .stat-card-mini__value, .recent-item__title, .tool-item-link__name {
    color: var(--el-text-color-primary);
  }
  
  .stat-card-mini__label, .recent-item__body {
    color: var(--el-text-color-secondary);
  }

  .tool-item-link:hover {
    background: var(--el-fill-color-darker);
  }
}
</style>
