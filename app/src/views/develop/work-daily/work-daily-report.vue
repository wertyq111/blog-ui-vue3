<!-- 工作日常：数据报表导出与 Markdown 导入 -->
<template>
  <div class="report-panel">
    <div class="report-panel__head">
      <div class="report-panel__title">数据报表与导入</div>
      <div class="report-panel__desc">快速生成阶段性工作汇报，或从外部 Markdown 文件导入记录。</div>
    </div>
    <div class="report-panel__row">
      <Select v-model="config.type" class="report-field" :options="typeOptions" />

      <AnimalDatePicker
        v-if="config.type === 'month'"
        v-model="config.month"
        type="month"
        placeholder="选择月份"
        value-format="YYYY-MM"
        class="report-field"
        style="width: 160px !important"
      />
      <AnimalDatePicker
        v-else-if="config.type === 'week'"
        v-model="config.weekRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        class="report-field-wide"
        style="width: 240px !important"
      />
      <AnimalDatePicker
        v-else
        v-model="config.year"
        type="year"
        placeholder="选择年份"
        value-format="YYYY"
        class="report-field"
        style="width: 160px !important"
      />

      <div ref="modelSelectRef" class="report-model-select">
        <button
          type="button"
          class="report-model-select__trigger"
          :class="{ 'is-open': modelMenuOpen }"
          @click="toggleModelMenu"
        >
          <span>{{ selectedModelLabel }}</span>
          <el-icon><ArrowDown /></el-icon>
        </button>
        <div v-if="modelMenuOpen" class="report-model-select__menu">
          <button
            v-for="agent in modelAgents"
            :key="agent.key"
            type="button"
            class="report-model-select__agent"
            :class="{
              'is-active': activeAgentKey === agent.key,
              'is-selected': isAgentSelected(agent),
            }"
            @mouseenter="activeAgentKey = agent.key"
            @click="handleAgentClick(agent)"
          >
            <span>{{ agent.label }}</span>
            <el-icon v-if="agent.models.length > 1"><ArrowRight /></el-icon>
            <el-icon v-else-if="isAgentSelected(agent)"><Check /></el-icon>
          </button>
        </div>
        <div v-if="activeAgentWithChildren" class="report-model-select__submenu">
          <button
            v-for="model in activeAgentWithChildren.models"
            :key="model"
            type="button"
            class="report-model-select__model"
            :class="{ 'is-selected': config.model === model }"
            @click="selectModel(model)"
          >
            <span>{{ formatModelLabel(model) }}</span>
            <el-icon v-if="config.model === model"><Check /></el-icon>
          </button>
        </div>
      </div>

      <Button
        type="primary"
        size="small"
        :loading="exportButtonLoading"
        :disabled="isExportActive"
        @click="handleExport"
      >
        {{ isExportActive ? "生成中" : "导出报表" }}
      </Button>

      <Button type="default" size="small" @click="openExportHistory">
        查询进度
      </Button>

      <div class="import-group">
        <AnimalDatePicker
          v-model="config.importYear"
          type="year"
          placeholder="导入年份"
          value-format="YYYY"
          class="report-field-import"
          style="width: 120px !important"
        />
        <AnimalUpload accept=".md" @change="handleImport">
          <Button type="default" size="small">
            <SystemIco name="plus" :size="13" />
            导入 MD
          </Button>
        </AnimalUpload>
      </div>
    </div>
    <AdminAnimalModal
      v-model:visible="historyVisible"
      title="报表生成记录"
      :width="820"
      :show-footer="false"
      @close="handleHistoryClose"
    >
      <div class="export-history">
        <div class="export-history__toolbar">
          <span class="export-history__hint">
            仅显示当前用户最近的导出任务。生成中的记录每 5 秒自动刷新。
          </span>
          <Button type="default" size="small" :loading="historyLoading" @click="refreshHistory">
            刷新
          </Button>
        </div>
        <div v-if="historyLoading && !historyItems.length" class="export-history__empty">
          加载中...
        </div>
        <div v-else-if="!historyItems.length" class="export-history__empty">
          暂无生成记录
        </div>
        <table v-else class="export-history__table">
          <thead>
            <tr>
              <th>创建时间</th>
              <th>类型</th>
              <th>区间</th>
              <th>模型</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in historyItems" :key="item.id">
              <td>{{ formatTimestamp(item.createdAt) }}</td>
              <td>{{ formatExportType(item.type) }}</td>
              <td>{{ formatExportPeriod(item) }}</td>
              <td>{{ formatModelLabel(item.model || "") || "-" }}</td>
              <td>
                <span class="export-history__status" :class="`is-${item.status}`">
                  {{ formatStatus(item.status) }}
                </span>
              </td>
              <td>
                <Button
                  v-if="item.status === 'completed'"
                  type="default"
                  size="small"
                  @click="handleDownloadItem(item)"
                >
                  下载
                </Button>
                <span
                  v-else-if="item.status === 'failed'"
                  class="export-history__error"
                  :title="item.errorMessage || ''"
                >
                  {{ item.errorMessage || "失败（无详细信息）" }}
                </span>
                <span v-else class="export-history__pending">处理中...</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminAnimalModal>
  </div>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { type UploadFile } from "element-plus";
import { ArrowDown, ArrowRight, Check } from "@element-plus/icons-vue";
import { Button, Select } from "animal-island-vue";
import { downloadFile } from "@/utils/download";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import AnimalUpload from "@/components/AnimalUpload/index.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import WorkDailyAPI, { type WorkDailyReportExport } from "@/api/develop/work-daily";

const emit = defineEmits<{ imported: [] }>();

const creatingExport = ref(false);
const reportModels = ref<string[]>([]);
const modelMenuOpen = ref(false);
const activeAgentKey = ref("");
const modelSelectRef = ref<HTMLElement>();
const currentExport = ref<WorkDailyReportExport | null>(null);
let exportPollTimer: number | undefined;

const historyVisible = ref(false);
const historyLoading = ref(false);
const historyItems = ref<WorkDailyReportExport[]>([]);
let historyRefreshTimer: number | undefined;

const config = reactive({
  type: "month" as "month" | "week" | "year",
  month: new Date().toISOString().substring(0, 7),
  weekRange: [] as string[],
  year: new Date().getFullYear().toString(),
  model: "",
  importYear: new Date().getFullYear().toString(),
});

const typeOptions = [
  { key: "month", label: "月报" },
  { key: "week", label: "周报" },
  { key: "year", label: "年报" },
];

interface ModelAgent {
  key: string;
  label: string;
  models: string[];
}

const modelAgents = computed<ModelAgent[]>(() => {
  const openClawModels = reportModels.value.filter(
    (model) => !isLocalCodexModel(model) && !isLocalGeminiModel(model),
  );
  const codexModels = reportModels.value.filter(isLocalCodexModel);
  if (!codexModels.includes("local-codex/codex-cli")) {
    codexModels.push("local-codex/codex-cli");
  }
  const geminiModels = reportModels.value.filter(isLocalGeminiModel);
  if (!geminiModels.includes("local-gemini/gemini-cli")) {
    geminiModels.push("local-gemini/gemini-cli");
  }
  const agents: ModelAgent[] = [];

  if (openClawModels.length) {
    agents.push({ key: "openclaw", label: "OpenClaw", models: openClawModels });
  }
  if (codexModels.length) {
    agents.push({ key: "codex", label: "Codex", models: codexModels });
  }
  if (geminiModels.length) {
    agents.push({ key: "gemini", label: "Gemini", models: geminiModels });
  }

  return agents;
});

const activeAgentWithChildren = computed(() => {
  if (!modelMenuOpen.value) return null;
  const agent = modelAgents.value.find((item) => item.key === activeAgentKey.value);
  return agent && agent.models.length > 1 ? agent : null;
});

const selectedModelLabel = computed(() => {
  if (!config.model) return "AI模型";
  const agent = modelAgents.value.find((item) => item.models.includes(config.model));
  if (!agent) return config.model;
  return agent.models.length === 1
    ? agent.label
    : `${agent.label} / ${formatModelLabel(config.model)}`;
});

const isExportActive = computed(() => {
  return currentExport.value ? ["pending", "running"].includes(currentExport.value.status) : false;
});

const exportButtonLoading = computed(() => creatingExport.value || isExportActive.value);

function isLocalCodexModel(model: string): boolean {
  return model.startsWith("local-codex/");
}

function isLocalGeminiModel(model: string): boolean {
  return model.startsWith("local-gemini/");
}

function formatModelLabel(model: string): string {
  if (model === "local-codex/codex-cli") return "Codex CLI";
  if (model === "local-gemini/gemini-cli") return "Gemini CLI";
  return model;
}

function isAgentSelected(agent: ModelAgent): boolean {
  return agent.models.length === 1 && config.model === agent.models[0];
}

function toggleModelMenu(): void {
  modelMenuOpen.value = !modelMenuOpen.value;
  if (modelMenuOpen.value) {
    const selectedAgent = modelAgents.value.find((agent) => agent.models.includes(config.model));
    activeAgentKey.value =
      selectedAgent?.key || modelAgents.value.find((agent) => agent.models.length > 1)?.key || "";
  }
}

function handleAgentClick(agent: ModelAgent): void {
  activeAgentKey.value = agent.key;
  if (agent.models.length === 1) {
    selectModel(agent.models[0]);
  }
}

function selectModel(model: string): void {
  config.model = model;
  modelMenuOpen.value = false;
}

function handleModelOutsideClick(event: MouseEvent): void {
  if (!modelSelectRef.value) return;
  if (modelSelectRef.value.contains(event.target as Node)) return;
  modelMenuOpen.value = false;
}

async function fetchModels(): Promise<void> {
  try {
    const res = await WorkDailyAPI.getReportModels();
    reportModels.value = res.models || [];
    if (res.currentModel) config.model = res.currentModel;
  } catch {
    reportModels.value = [];
  }
}

async function handleExport(): Promise<void> {
  if (config.type === "month" && !config.month) {
    message.warning("请选择月份");
    return;
  }
  if (config.type === "week" && (!config.weekRange || config.weekRange.length < 2)) {
    message.warning("请选择周范围");
    return;
  }
  if (config.type === "year" && !config.year) {
    message.warning("请选择年份");
    return;
  }

  creatingExport.value = true;
  try {
    const payload: {
      type: "month" | "week" | "year";
      month?: string;
      start_date?: string;
      end_date?: string;
      year?: string;
      model?: string;
    } = {
      type: config.type,
      model: config.model,
    };
    if (config.type === "month") {
      payload.month = config.month;
    } else if (config.type === "week") {
      payload.start_date = config.weekRange[0];
      payload.end_date = config.weekRange[1];
    } else {
      payload.year = config.year;
    }

    const result = await WorkDailyAPI.createReportExport(payload);
    currentExport.value = result.export;
    if (result.blocked) {
      message.warning("已有报表正在生成");
    } else {
      message.success("导出任务已创建");
    }
    startExportPolling(result.export.id, true);
  } catch {
    message.error("导出失败");
  } finally {
    creatingExport.value = false;
  }
}

async function fetchCurrentExport(): Promise<void> {
  const result = await WorkDailyAPI.getCurrentReportExport();
  currentExport.value = result.export;
  if (result.export && result.active) {
    startExportPolling(result.export.id, false);
  }
}

function startExportPolling(id: number, autoDownload: boolean): void {
  stopExportPolling();
  pollExport(id, autoDownload);
  exportPollTimer = window.setInterval(() => {
    pollExport(id, true);
  }, 3000);
}

function stopExportPolling(): void {
  if (exportPollTimer) {
    window.clearInterval(exportPollTimer);
    exportPollTimer = undefined;
  }
}

async function pollExport(id: number, autoDownload: boolean): Promise<void> {
  try {
    const result = await WorkDailyAPI.getReportExport(id);
    currentExport.value = result.export;
    if (!result.export || result.active) return;

    stopExportPolling();
    if (result.export.status === "completed") {
      if (autoDownload) {
        await downloadExport(result.export);
        message.success("导出成功");
      }
      return;
    }

    message.error(result.export.errorMessage || "导出失败");
  } catch {
    stopExportPolling();
  }
}

async function downloadExport(exportItem: WorkDailyReportExport): Promise<void> {
  const response = await WorkDailyAPI.downloadReportExport(exportItem.id);
  downloadFile(response, exportItem.fileName);
}

async function handleImport(file: UploadFile): Promise<void> {
  const raw = file.raw;
  if (!raw) return;
  try {
    await WorkDailyAPI.importMarkdown(raw, config.importYear);
    message.success("导入成功");
    emit("imported");
  } catch {
    message.error("导入失败");
  }
}

function openExportHistory(): void {
  historyVisible.value = true;
  refreshHistory();
}

function handleHistoryClose(): void {
  stopHistoryAutoRefresh();
}

async function refreshHistory(): Promise<void> {
  historyLoading.value = true;
  try {
    const result = await WorkDailyAPI.listReportExports({ page: 1, page_size: 20 });
    historyItems.value = result.items || [];
    const hasActive = historyItems.value.some(
      (item) => item.status === "pending" || item.status === "running",
    );
    if (hasActive && historyVisible.value) {
      startHistoryAutoRefresh();
    } else {
      stopHistoryAutoRefresh();
    }
  } catch {
    message.error("加载记录失败");
  } finally {
    historyLoading.value = false;
  }
}

function startHistoryAutoRefresh(): void {
  if (historyRefreshTimer) return;
  historyRefreshTimer = window.setInterval(() => {
    if (!historyVisible.value) {
      stopHistoryAutoRefresh();
      return;
    }
    refreshHistory();
  }, 5000);
}

function stopHistoryAutoRefresh(): void {
  if (historyRefreshTimer) {
    window.clearInterval(historyRefreshTimer);
    historyRefreshTimer = undefined;
  }
}

async function handleDownloadItem(item: WorkDailyReportExport): Promise<void> {
  try {
    await downloadExport(item);
  } catch {
    message.error("下载失败");
  }
}

function formatExportType(type: string): string {
  return ({ month: "月报", week: "周报", year: "年报" } as Record<string, string>)[type] || type;
}

function formatExportPeriod(item: WorkDailyReportExport): string {
  if (item.type === "month") return (item.periodStart || "").slice(0, 7);
  if (item.type === "year") return (item.periodStart || "").slice(0, 4);
  return `${item.periodStart || ""} ~ ${item.periodEnd || ""}`;
}

function formatStatus(status: string): string {
  return (
    { pending: "排队中", running: "生成中", completed: "已完成", failed: "失败" } as Record<
      string,
      string
    >
  )[status] || status;
}

function formatTimestamp(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "" || value === 0) return "-";
  const d = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

onMounted(() => {
  fetchModels();
  fetchCurrentExport().catch(() => undefined);
  document.addEventListener("click", handleModelOutsideClick);
});

onBeforeUnmount(() => {
  stopExportPolling();
  stopHistoryAutoRefresh();
  document.removeEventListener("click", handleModelOutsideClick);
});
</script>

<style lang="scss" scoped>
.report-panel {
  margin-bottom: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1.5px solid var(--ai-border, #e8e2d6);
  background:
    radial-gradient(circle at top right, rgba(172, 236, 109, 0.14), transparent 30%),
    rgba(255, 255, 255, 0.6);
}

.report-panel__head {
  margin-bottom: 12px;
}

.report-panel__title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ai-text, #794f27);
}

.report-panel__desc {
  margin-top: 3px;
  font-size: 12px;
  color: var(--ai-text-2, #9f927d);
}

.report-panel__row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  overflow: visible;
  padding-bottom: 4px;
}

.import-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.export-history {
  font-size: 13px;
  color: var(--ai-text, #794f27);
}

.export-history__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.export-history__hint {
  font-size: 12px;
  color: var(--ai-text-2, #9f927d);
}

.export-history__empty {
  padding: 24px;
  text-align: center;
  color: var(--ai-text-2, #9f927d);
}

.export-history__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px dashed var(--ai-border, #e8e2d6);
    text-align: left;
    vertical-align: middle;
  }

  th {
    font-weight: 800;
    color: var(--ai-text-2, #9f927d);
    background: rgba(255, 252, 239, 0.6);
  }

  tbody tr:hover {
    background: rgba(25, 200, 185, 0.04);
  }
}

.export-history__status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(159, 146, 125, 0.18);
  color: var(--ai-text-2, #9f927d);

  &.is-pending {
    background: rgba(255, 196, 87, 0.2);
    color: #c5832a;
  }

  &.is-running {
    background: rgba(25, 200, 185, 0.18);
    color: #11a89b;
  }

  &.is-completed {
    background: rgba(172, 236, 109, 0.32);
    color: #6a8b30;
  }

  &.is-failed {
    background: rgba(231, 96, 96, 0.18);
    color: #c44141;
  }
}

.export-history__error {
  display: inline-block;
  max-width: 280px;
  font-size: 12px;
  color: #c44141;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.export-history__pending {
  font-size: 12px;
  color: var(--ai-text-2, #9f927d);
}
</style>

<style lang="scss">
.report-panel {
  .report-field {
    width: 160px !important;
    flex-shrink: 0;
  }

  .report-field-wide {
    width: 240px !important;
    flex-shrink: 0;
  }

  .report-field-model {
    width: 280px !important;
    flex-shrink: 0;
  }

  .report-field-import {
    width: 120px !important;
    flex-shrink: 0;
  }
}

.report-model-select {
  position: relative;
  width: 280px;
  flex-shrink: 0;
  font-family: inherit;

  &__trigger {
    width: 100%;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 16px;
    border-radius: 18px;
    border: 2px solid var(--ai-border, #d8c9aa);
    background: rgba(255, 252, 239, 0.9);
    color: var(--ai-text, #794f27);
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 3px 0 0 var(--ai-shadow, #d4c9b4);
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-icon {
      flex: 0 0 auto;
      font-size: 13px;
      color: var(--ai-text-2, #9f927d);
      transition: transform 0.18s ease;
    }

    &:hover,
    &.is-open {
      border-color: var(--ai-primary, #19c8b9);
      background: #fffdf4;
    }

    &.is-open {
      transform: translateY(2px);
      box-shadow: 0 1px 0 0 var(--ai-shadow, #d4c9b4);

      .el-icon {
        transform: rotate(180deg);
      }
    }
  }

  &__menu,
  &__submenu {
    position: absolute;
    z-index: 30;
    top: calc(100% + 8px);
    padding: 6px 0;
    border-radius: 20px;
    border: 2px solid var(--ai-border, #e8e2d6);
    background: #fdfbf7;
    box-shadow: 0 4px 16px rgba(121, 79, 39, 0.08);
  }

  &__menu {
    left: 0;
    width: 180px;
  }

  &__submenu {
    left: calc(180px + 8px);
    min-width: 200px;
    max-width: min(420px, calc(100vw - 40px));
    max-height: 320px;
    overflow-y: auto;
  }

  &__agent,
  &__model {
    position: relative;
    width: 100%;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 16px;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--ai-text, #794f27);
    font-size: 13px;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .el-icon {
      flex: 0 0 auto;
      font-size: 13px;
      color: var(--ai-text-2, #9f927d);
      transition:
        color 0.2s ease,
        transform 0.2s ease;
    }

    /* 非选中态：hover 或 is-active（agent 子菜单展开时）显示手指与右移 */
    &:not(.is-selected):hover,
    &:not(.is-selected).is-active {
      background: rgba(25, 200, 185, 0.06);
      color: #11a89b;
      padding-left: 28px;

      .el-icon {
        color: #11a89b;
      }

      &::before {
        content: "";
        position: absolute;
        left: 6px;
        top: 50%;
        width: 18px;
        height: 18px;
        transform: translateY(-50%);
        background: url("../../../assets/select-cursor.svg") no-repeat center / contain;
        animation: animal-dropdown-cursor-in 0.3s ease-out forwards;
        pointer-events: none;
      }
    }

    /* 选中态：绿底深绿字，单层高亮，不出现手指 */
    &.is-selected {
      background: rgba(124, 186, 112, 0.1);
      color: #4a8a36;
      font-weight: 800;

      .el-icon {
        color: #4a8a36;
      }
    }
  }
}
</style>
