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
        style="width: 160px !important;"
      />
      <AnimalDatePicker
        v-else-if="config.type === 'week'"
        v-model="config.weekRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        class="report-field-wide"
        style="width: 240px !important;"
      />
      <AnimalDatePicker
        v-else
        v-model="config.year"
        type="year"
        placeholder="选择年份"
        value-format="YYYY"
        class="report-field"
        style="width: 160px !important;"
      />

      <Select
        v-model="config.model"
        class="report-field report-field-model"
        placeholder="AI模型(可选)"
        :options="modelOptions"
      />

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
          style="width: 120px !important;"
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
import { computed, onMounted, reactive, ref } from "vue";
import { type UploadFile } from "element-plus";
import { Button, Select } from "animal-island-vue";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import AnimalUpload from "@/components/AnimalUpload/index.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import WorkDailyAPI from "@/api/develop/work-daily";

const emit = defineEmits<{ imported: [] }>();

const exporting = ref(false);
const reportModels = ref<string[]>([]);

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

const modelOptions = computed(() => [
  { key: "", label: "AI模型(可选)" },
  ...reportModels.value.map((m) => ({ key: m, label: m })),
]);

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

onMounted(fetchModels);
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
</style>
