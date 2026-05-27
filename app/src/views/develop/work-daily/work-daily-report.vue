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

      <Button type="primary" size="small" :loading="exporting" @click="handleExport">
        导出报表
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
  </div>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { type UploadFile } from "element-plus";
import { ArrowDown, ArrowRight, Check } from "@element-plus/icons-vue";
import { Button, Select } from "animal-island-vue";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import AnimalUpload from "@/components/AnimalUpload/index.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import WorkDailyAPI from "@/api/develop/work-daily";

const emit = defineEmits<{ imported: [] }>();

const exporting = ref(false);
const reportModels = ref<string[]>([]);
const modelMenuOpen = ref(false);
const activeAgentKey = ref("");
const modelSelectRef = ref<HTMLElement>();

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
  const openClawModels = reportModels.value.filter((model) => !isLocalCodexModel(model));
  const codexModels = reportModels.value.filter(isLocalCodexModel);
  if (!codexModels.includes("local-codex/codex-cli")) {
    codexModels.push("local-codex/codex-cli");
  }
  const agents: ModelAgent[] = [];

  if (openClawModels.length) {
    agents.push({ key: "openclaw", label: "OpenClaw", models: openClawModels });
  }
  if (codexModels.length) {
    agents.push({ key: "codex", label: "Codex", models: codexModels });
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

function isLocalCodexModel(model: string): boolean {
  return model.startsWith("local-codex/");
}

function formatModelLabel(model: string): string {
  if (model === "local-codex/codex-cli") return "Codex CLI";
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

  exporting.value = true;
  try {
    // API 以 blob 响应返回，但类型标注为 AxiosResponse，这里按运行时实际值处理
    let blob: any;
    let name: string;
    if (config.type === "month") {
      blob = await WorkDailyAPI.reportMonth(config.month, config.model);
      name = `工作月报_${config.month}.md`;
    } else if (config.type === "week") {
      blob = await WorkDailyAPI.reportWeek(config.weekRange[0], config.weekRange[1], config.model);
      name = `工作周报_${config.weekRange[0]}_${config.weekRange[1]}.md`;
    } else {
      blob = await WorkDailyAPI.reportYear(config.year, config.model);
      name = `工作年报_${config.year}.md`;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    message.success("导出成功");
  } catch {
    message.error("导出失败");
  } finally {
    exporting.value = false;
  }
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

onMounted(() => {
  fetchModels();
  document.addEventListener("click", handleModelOutsideClick);
});

onBeforeUnmount(() => {
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
