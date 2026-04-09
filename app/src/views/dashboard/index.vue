<template>
  <div class="app-container dashboard-container p-6">
    <!-- 顶部欢迎区 -->
    <el-card shadow="never" class="welcome-card mb-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <el-avatar :size="80" :src="userStore.userInfo.avatar" class="mr-5 shadow-sm" />
          <div>
            <h1 class="text-xl font-bold text-[--el-text-color-primary] mb-1">
              {{ greetings }}{{ userStore.userInfo.nickname }}
            </h1>
            <p class="text-sm text-[--el-text-color-secondary]">今天也是充满活力的一天，开始处理你的开发任务吧！</p>
          </div>
        </div>
        <div class="flex gap-3">
          <el-button type="primary" icon="plus" @click="router.push('/develop/work-daily')">写日志</el-button>
          <el-button type="success" icon="document" @click="router.push('/develop/work-doc')">新文档</el-button>
          <el-button type="warning" icon="refresh" @click="router.push('/develop/convert-path')">路径转换</el-button>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片行 -->
    <el-row :gutter="20" class="mb-5">
      <el-col :span="6" :xs="24" class="mb-4 sm:mb-0">
        <el-card shadow="hover" class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-[--el-text-color-secondary] mb-1">工作平台</div>
              <div class="text-2xl font-bold">{{ stats.platforms }}</div>
            </div>
            <el-icon class="text-3xl text-blue-500 opacity-80"><Monitor /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" class="mb-4 sm:mb-0">
        <el-card shadow="hover" class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-[--el-text-color-secondary] mb-1">工作日志</div>
              <div class="text-2xl font-bold">{{ stats.logs }}</div>
            </div>
            <el-icon class="text-3xl text-green-500 opacity-80"><EditPen /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" class="mb-4 sm:mb-0">
        <el-card shadow="hover" class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-[--el-text-color-secondary] mb-1">文档总数</div>
              <div class="text-2xl font-bold">{{ stats.docs }}</div>
            </div>
            <el-icon class="text-3xl text-purple-500 opacity-80"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24">
        <el-card shadow="hover" class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-[--el-text-color-secondary] mb-1">开发工具</div>
              <div class="text-2xl font-bold">{{ stats.tools }}</div>
            </div>
            <el-icon class="text-3xl text-orange-500 opacity-80"><Tools /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主内容区 -->
    <el-row :gutter="20">
      <!-- 左栏 -->
      <el-col :span="16" :xs="24">
        <el-card shadow="hover" class="mb-5">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">最近日志</span>
              <el-button type="primary" link @click="router.push('/develop/work-daily')">更多</el-button>
            </div>
          </template>
          <div v-loading="loading.logs" class="min-h-[200px]">
            <el-empty v-if="!recentLogs.length" :image-size="80" description="暂无日志" />
            <div v-else class="recent-list">
              <div v-for="log in recentLogs" :key="log.id" class="recent-item p-3 border-b border-[--el-border-color-lighter] last:border-0 hover:bg-[--el-fill-color-light] rounded transition-colors cursor-pointer" @click="router.push('/develop/work-daily')">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-medium text-blue-600">{{ log.logDate }}</span>
                  <span class="text-xs text-[--el-text-color-placeholder]">{{ log.createTime }}</span>
                </div>
                <div class="text-sm text-[--el-text-color-secondary] truncate">
                  {{ formatLogContent(log.content) }}
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">最近文档</span>
              <el-button type="primary" link @click="router.push('/develop/work-doc')">更多</el-button>
            </div>
          </template>
          <div v-loading="loading.docs" class="min-h-[200px]">
            <el-empty v-if="!recentDocs.length" :image-size="80" description="暂无文档" />
            <div v-else class="recent-list">
              <div v-for="doc in recentDocs" :key="doc.id" class="recent-item p-3 border-b border-[--el-border-color-lighter] last:border-0 hover:bg-[--el-fill-color-light] rounded transition-colors cursor-pointer" @click="router.push('/develop/work-doc')">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-[--el-text-color-primary]">{{ doc.title }}</span>
                  <span class="text-xs text-[--el-text-color-placeholder]">{{ doc.updateTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右栏 -->
      <el-col :span="8" :xs="24">
        <el-card shadow="hover" class="mb-5">
          <template #header>
            <span class="font-bold">工作平台</span>
          </template>
          <div v-loading="loading.platforms">
            <el-empty v-if="!activePlatforms.length" :image-size="60" description="未配置平台" />
            <div v-else class="flex flex-wrap gap-2">
              <el-tag v-for="p in activePlatforms" :key="p.id" size="large" type="success" effect="plain">
                {{ p.name }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover">
          <template #header>
            <span class="font-bold">开发工具</span>
          </template>
          <div class="tool-links flex flex-col gap-2">
            <div v-for="tool in toolLinks" :key="tool.path" class="tool-item p-3 rounded bg-[--el-fill-color-light] hover:bg-blue-50 transition-colors cursor-pointer group flex items-center justify-between" @click="router.push(tool.path)">
              <div class="flex items-center">
                <el-icon class="mr-2 text-blue-500 group-hover:scale-110 transition-transform"><component :is="tool.icon" /></el-icon>
                <span class="text-sm font-medium">{{ tool.name }}</span>
              </div>
              <el-icon class="text-xs text-[--el-text-color-placeholder]"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
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
.dashboard-container {
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}

.welcome-card {
  border: none;
  background: linear-gradient(to right, #ffffff, #f0f7ff);
}

.stat-card {
  border: none;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
}

.tool-item {
  &:hover {
    background-color: var(--el-color-primary-light-9);
  }
}
</style>
