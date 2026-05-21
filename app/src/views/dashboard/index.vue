<template>
  <div class="workplace-page">
    <WorkbenchHero />

    <WorkbenchFilterBar
      v-model:model-view="currentView"
      v-model:model-range="currentRange"
      :last-updated="lastUpdated"
    />

    <WorkbenchKpi :metrics="data?.metrics ?? null" :loading="loading" />

    <template v-if="currentView === 'overview'">
      <div class="grid-heatmap">
        <WorkbenchHeatmap :heatmap="data?.heatmap ?? null" :loading="loading" />
        <WorkbenchStreakPanel :metrics="data?.metrics ?? null" :heatmap="data?.heatmap ?? null" :loading="loading" />
      </div>

      <div class="wb-charts-row">
        <WorkbenchTrendChart :trend="data?.trend_30d ?? []" :loading="loading" />
        <WorkbenchHourChart :hour-dist="data?.metrics?.hour_dist ?? []" :loading="loading" />
        <WorkbenchPlatformChart :platform-dist="data?.platform_dist ?? []" :loading="loading" />
      </div>

      <div class="grid-bottom">
        <WorkbenchWeekdayBar :week-dist="data?.metrics?.week_dist ?? []" :loading="loading" />
        <WorkbenchTagBlock :tags="data?.tag_ranking ?? []" :loading="loading" />
      </div>

      <WorkbenchRecentLogs
        :logs="data?.recent_logs ?? []"
        :total-logs="data?.metrics?.total_logs ?? null"
        :loading="loading"
      />

      <WorkbenchQuickAccess
        :metrics="data?.metrics ?? null"
        :platform-dist="data?.platform_dist ?? []"
      />
    </template>

    <template v-else-if="currentView === 'hour'">
      <div class="wb-charts-row" style="grid-template-columns: 1fr 1fr">
        <WorkbenchHourChart :hour-dist="data?.metrics?.hour_dist ?? []" :loading="loading" />
        <WorkbenchTrendChart :trend="data?.trend_30d ?? []" :loading="loading" />
      </div>
      <WorkbenchRecentLogs
        :logs="data?.recent_logs ?? []"
        :total-logs="data?.metrics?.total_logs ?? null"
        :loading="loading"
      />
    </template>

    <template v-else-if="currentView === 'platform'">
      <div class="wb-charts-row" style="grid-template-columns: 1fr 1fr">
        <WorkbenchPlatformChart :platform-dist="data?.platform_dist ?? []" :loading="loading" />
        <WorkbenchTrendChart :trend="data?.trend_30d ?? []" :loading="loading" />
      </div>
    </template>

    <template v-else-if="currentView === 'tag'">
      <div class="grid-bottom">
        <WorkbenchWeekdayBar :week-dist="data?.metrics?.week_dist ?? []" :loading="loading" />
        <WorkbenchTagBlock :tags="data?.tag_ranking ?? []" :loading="loading" />
      </div>
      <WorkbenchRecentLogs
        :logs="data?.recent_logs ?? []"
        :total-logs="data?.metrics?.total_logs ?? null"
        :loading="loading"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import DashboardStatsAPI from "@/api/develop/dashboard-stats";
import type { DashboardOverviewData } from "@/types/api/dashboard-stats";

import WorkbenchHero from "./components/WorkbenchHero.vue";
import WorkbenchFilterBar from "./components/WorkbenchFilterBar.vue";
import WorkbenchKpi from "./components/WorkbenchKpi.vue";
import WorkbenchHeatmap from "./components/WorkbenchHeatmap.vue";
import WorkbenchStreakPanel from "./components/WorkbenchStreakPanel.vue";
import WorkbenchTrendChart from "./components/WorkbenchTrendChart.vue";
import WorkbenchHourChart from "./components/WorkbenchHourChart.vue";
import WorkbenchPlatformChart from "./components/WorkbenchPlatformChart.vue";
import WorkbenchWeekdayBar from "./components/WorkbenchWeekdayBar.vue";
import WorkbenchTagBlock from "./components/WorkbenchTagBlock.vue";
import WorkbenchRecentLogs from "./components/WorkbenchRecentLogs.vue";
import WorkbenchQuickAccess from "./components/WorkbenchQuickAccess.vue";

defineOptions({ name: "Dashboard" });

const loading = ref(true);
const data = ref<DashboardOverviewData | null>(null);
const currentView = ref("overview");
const currentRange = ref("all");
const fetchTime = ref<Date | null>(null);

const lastUpdated = computed(() => {
  if (!fetchTime.value) return "";
  const d = fetchTime.value;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
});

async function fetchDashboard() {
  loading.value = true;
  try {
    data.value = await DashboardStatsAPI.getStats(currentView.value, currentRange.value);
    fetchTime.value = new Date();
  } catch {
    ElMessage.error("统计数据加载失败");
  } finally {
    loading.value = false;
  }
}

watch([currentView, currentRange], fetchDashboard);

onMounted(fetchDashboard);
</script>

<style lang="scss" scoped>
.workplace-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 0 34px;
}

.grid-heatmap {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}

.wb-charts-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1.2fr;
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.grid-bottom {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}
</style>
