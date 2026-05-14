<template>
  <div class="develop-page admin-workspace-page workplace-page">
    <el-card shadow="never" class="develop-shell admin-workspace-shell workplace-shell">
      <WorkbenchHero />

      <WorkbenchKpi :metrics="data?.metrics ?? null" :loading="loading" />

      <WorkbenchHeatmap :heatmap="data?.heatmap ?? null" :loading="loading" />

      <el-row :gutter="20">
        <!-- 左侧：图表列 + 日志列表 -->
        <el-col :span="17" :xs="24">
          <div class="wb-charts-row">
            <WorkbenchTrendChart :trend="data?.trend_30d ?? []" :loading="loading" />
            <WorkbenchHourChart :hour-dist="data?.metrics?.hour_dist ?? []" :loading="loading" />
            <WorkbenchPlatformChart :platform-dist="data?.platform_dist ?? []" :loading="loading" />
          </div>

          <WorkbenchRecentLogs :logs="data?.recent_logs ?? []" :loading="loading" />
        </el-col>

        <!-- 右侧：连续打卡 + 最爱平台 -->
        <el-col :span="7" :xs="24">
          <WorkbenchStreakPanel :metrics="data?.metrics ?? null" :loading="loading" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import DashboardStatsAPI from "@/api/develop/dashboard-stats";
import type { DashboardOverviewData } from "@/types/api/dashboard-stats";

import WorkbenchHero from "./components/WorkbenchHero.vue";
import WorkbenchKpi from "./components/WorkbenchKpi.vue";
import WorkbenchHeatmap from "./components/WorkbenchHeatmap.vue";
import WorkbenchStreakPanel from "./components/WorkbenchStreakPanel.vue";
import WorkbenchTrendChart from "./components/WorkbenchTrendChart.vue";
import WorkbenchHourChart from "./components/WorkbenchHourChart.vue";
import WorkbenchPlatformChart from "./components/WorkbenchPlatformChart.vue";
import WorkbenchRecentLogs from "./components/WorkbenchRecentLogs.vue";

defineOptions({ name: "Dashboard" });

const loading = ref(true);
const data = ref<DashboardOverviewData | null>(null);

async function fetchDashboard() {
  loading.value = true;
  try {
    data.value = await DashboardStatsAPI.getOverview();
  } catch {
    ElMessage.error("统计数据加载失败");
  } finally {
    loading.value = false;
  }
}

onMounted(fetchDashboard);
</script>

<style lang="scss" scoped>
.workplace-shell {
  background: transparent !important;
}

.wb-charts-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
</style>
