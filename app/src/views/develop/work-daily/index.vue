<!-- 工作日常 -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">DEVELOP WORKSPACE</div>
      <h1 class="page-title">工作日常</h1>
      <p class="page-desc">按日期记录各平台工作内容，支持报表导出与 Markdown 导入。</p>
    </div>

    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">平台：</label>
        <Select
          v-model="platformModel"
          class="filter-select"
          placeholder="全部"
          :options="platformOptions"
        />
      </div>
      <div class="filter-field">
        <label class="filter-label">日期范围：</label>
        <AnimalDatePicker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />
      </div>
      <div class="filter-field">
        <label class="filter-label">内容：</label>
        <Input
          v-model="queryParams.content"
          class="filter-input"
          placeholder="请输入内容"
          allow-clear
          @keyup.enter="handleQuery"
        />
      </div>
      <Button type="primary" size="small" @click="handleQuery">
        <SystemIco name="search" :size="13" />
        查询
      </Button>
      <Button type="default" size="small" @click="handleResetQuery">重置</Button>
    </div>

    <WorkDailyReport @imported="handleQuery" />

    <div class="list-card">
      <div class="list-head">
        <div>
          <div class="list-title">日常记录列表</div>
          <div class="list-sub">记录每日开发进度，悬停内容可预览 Markdown。</div>
        </div>
      </div>

      <div class="toolbar">
        <Button type="primary" size="small" @click="handleCreateClick">
          <SystemIco name="plus" :size="13" />
          添加
        </Button>
        <div class="toolbar-spacer" />
        <div class="tool-group">
          <Button class="btn-icon" type="default" size="small" title="刷新" @click="fetchList">
            <SystemIco name="refresh" :size="14" />
          </Button>
        </div>
      </div>

      <div v-loading="loading" class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width: 70px">ID</th>
              <th style="width: 120px">日期</th>
              <th>内容</th>
              <th style="width: 170px">创建时间</th>
              <th style="width: 130px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dataList" :key="row.id">
              <td class="cell-num">{{ row.id }}</td>
              <td class="cell-mono">{{ row.logDate }}</td>
              <td>
                <div v-if="isPlatformContent(row.content)" class="daily-summary">
                  <el-popover
                    v-for="p in row.content.platforms"
                    :key="p.platformId"
                    trigger="hover"
                    :width="520"
                    placement="top"
                  >
                    <template #reference>
                      <div class="daily-brief">
                        <div class="daily-cell-markdown">
                          <AnimalMarkdown :model-value="p.content || ''" preview-only height="auto" />
                        </div>
                      </div>
                    </template>
                    <div class="daily-preview">
                      <AnimalMarkdown :model-value="p.content || ''" preview-only height="auto" />
                    </div>
                  </el-popover>
                </div>
                <div v-else class="daily-summary">
                  <el-popover
                    trigger="hover"
                    :width="520"
                    placement="top"
                  >
                    <template #reference>
                      <div class="daily-brief">
                        <div class="daily-cell-markdown">
                          <AnimalMarkdown :model-value="String(row.content)" preview-only height="auto" />
                        </div>
                      </div>
                    </template>
                    <div class="daily-preview">
                      <AnimalMarkdown :model-value="String(row.content)" preview-only height="auto" />
                    </div>
                  </el-popover>
                </div>
              </td>
              <td class="cell-mono">{{ row.createTime }}</td>
              <td>
                <span class="tbl-actions">
                  <span class="action-link act-edit" @click="handleEditClick(row)">
                    <SystemIco name="edit" :size="12" />
                    修改
                  </span>
                  <span class="action-link act-del" @click="handleDelete(row.id)">
                    <SystemIco name="trash" :size="12" />
                    删除
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && dataList.length === 0" class="empty-row">
              <td colspan="5">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchList"
      />
    </div>

    <WorkDailyEdit v-model:visible="editVisible" :data="editingRow" @done="handleQuery" />
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { computed, onMounted, reactive, ref } from "vue";

import { Button, Input, Select } from "animal-island-vue";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import AnimalMarkdown from "@/components/AnimalMarkdown/index.vue";
import WorkDailyAPI from "@/api/develop/work-daily";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { WorkDailyItem, WorkDailyQueryParams } from "@/types/api/work-daily";
import type { WorkPlatformItem } from "@/types/api/work-platform";
import WorkDailyEdit from "./work-daily-edit.vue";
import WorkDailyReport from "./work-daily-report.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";

defineOptions({ name: "WorkDaily", inheritAttrs: false });

const queryParams = reactive<WorkDailyQueryParams>({
  pageNum: 1,
  pageSize: 10,
  platformId: undefined,
  content: "",
});

const dateRange = ref<[string, string]>();
const loading = ref(false);
const total = ref(0);
const dataList = ref<WorkDailyItem[]>([]);
const platforms = ref<WorkPlatformItem[]>([]);
const editVisible = ref(false);
const editingRow = ref<WorkDailyItem | null>(null);

const platformOptions = computed(() => [
  { key: "", label: "全部" },
  ...platforms.value.map((p) => ({ key: String(p.id), label: p.name })),
]);

const platformModel = computed<string>({
  get: () => (queryParams.platformId == null ? "" : String(queryParams.platformId)),
  set: (value) => {
    queryParams.platformId = value === "" ? undefined : Number(value);
  },
});

function isPlatformContent(content: any): boolean {
  return content && typeof content === "object" && Array.isArray(content.platforms);
}

function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

async function fetchPlatforms(): Promise<void> {
  platforms.value = await WorkPlatformAPI.getList(1);
}

async function fetchList(): Promise<void> {
  queryParams.startDate = dateRange.value ? dateRange.value[0] : undefined;
  queryParams.endDate = dateRange.value ? dateRange.value[1] : undefined;
  loading.value = true;
  try {
    const data = await WorkDailyAPI.getPage(queryParams);
    dataList.value = data.list;
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleQuery(): void {
  queryParams.pageNum = 1;
  fetchList();
}

function handleResetQuery(): void {
  dateRange.value = undefined;
  queryParams.platformId = undefined;
  queryParams.content = "";
  handleQuery();
}

function handleCreateClick(): void {
  editingRow.value = null;
  editVisible.value = true;
}

function handleEditClick(row: WorkDailyItem): void {
  editingRow.value = row;
  editVisible.value = true;
}

function handleDelete(id: number): void {
  confirm("确认删除该记录吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      WorkDailyAPI.deleteById(id)
        .then(() => {
          message.success("删除成功");
          fetchList();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => message.info("已取消删除")
  );
}

onMounted(async () => {
  await fetchPlatforms();
  handleQuery();
});
</script>

<style lang="scss" scoped>
.daily-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.daily-brief {
  font-size: 13px;
  line-height: 1.6;
  color: var(--ai-text-2, #9f927d);
  cursor: pointer;
}

.daily-brief__platform {
  color: var(--ai-primary-active, #11a89b);
  font-weight: 700;
}

.daily-cell-markdown {
  max-height: 80px;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 24px;
    background: linear-gradient(to bottom, transparent, var(--ai-bg-card, #fcfaf2));
    pointer-events: none;
  }
}

.daily-preview {
  max-height: 400px;
  overflow-y: auto;
}
</style>
