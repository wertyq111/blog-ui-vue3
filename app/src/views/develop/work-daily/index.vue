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
        <AnimalSelect
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
                <div class="daily-summary">
                  <template v-for="entry in toEntries(row)" :key="entry.key">
                    <el-popover trigger="hover" :width="520" placement="top">
                      <template #reference>
                        <div
                          class="log-row"
                          @click="openPreview(row, entry)"
                        >
                          <div class="log-body">
                            <div class="log-title">
                              <span v-if="entry.platformName" class="log-platform">{{ entry.platformName }}</span>
                              {{ extractTitle(entry.text) }}
                            </div>
                            <div class="log-desc">{{ extractDesc(entry.text) }}</div>
                            <div class="log-meta">
                              <span class="log-words">{{ countWords(entry.text).toLocaleString() }} 字</span>
                              <span
                                v-for="t in (row.tags || [])"
                                :key="typeof t === 'string' ? t : t.id"
                                class="log-tag"
                              >#{{ typeof t === 'string' ? t : t.name }}</span>
                            </div>
                          </div>
                          <button class="log-action" type="button" title="查看完整内容">
                            <SystemIco name="eye" :size="14" />
                          </button>
                        </div>
                      </template>
                      <div class="daily-preview">
                        <AnimalMarkdown :model-value="entry.text" preview-only height="auto" />
                      </div>
                    </el-popover>
                  </template>
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

    <AdminAnimalModal
      v-model:visible="previewVisible"
      :title="previewTitle"
      :width="720"
      :show-footer="false"
      content-class="daily-preview-modal"
    >
      <AnimalMarkdown :model-value="previewContent" preview-only height="auto" />
    </AdminAnimalModal>
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { computed, onDeactivated, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Button, Input } from "animal-island-vue";
import AnimalSelect from "@/components/AnimalSelect/index.vue";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import AnimalMarkdown from "@/components/AnimalMarkdown/index.vue";
import WorkDailyAPI from "@/api/develop/work-daily";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { WorkDailyItem, WorkDailyQueryParams } from "@/types/api/work-daily";
import type { WorkPlatformItem } from "@/types/api/work-platform";
import WorkDailyEdit from "./work-daily-edit.vue";
import WorkDailyReport from "./work-daily-report.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import { extractTitle, extractDesc, countWords, getRawText } from "@/utils/workDailyDisplay";

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

// 内容预览弹窗
const previewVisible = ref(false);
const previewTitle = ref("");
const previewContent = ref("");

interface DailyEntry {
  key: string;
  platformId: number | null;
  platformName: string;
  text: string;
}

function toEntries(row: WorkDailyItem): DailyEntry[] {
  if (isPlatformContent(row.content)) {
    return row.content.platforms.map((p: any) => ({
      key: `${row.id}-${p.platformId ?? p.platform_id ?? 0}`,
      platformId: p.platformId ?? p.platform_id ?? null,
      platformName: resolvePlatformName(p.platformId ?? p.platform_id),
      text: p.content || "",
    }));
  }
  return [
    {
      key: `${row.id}-raw`,
      platformId: null,
      platformName: "",
      text: getRawText(row.content),
    },
  ];
}

function resolvePlatformName(id: number | undefined | null): string {
  if (id == null || id === 0) return "";
  return platforms.value.find((p) => p.id === id)?.name ?? "";
}

function openPreview(row: WorkDailyItem, entry: DailyEntry): void {
  const parts = [row.logDate, entry.platformName].filter(Boolean);
  previewTitle.value = parts.join(" · ") || "内容预览";
  previewContent.value = entry.text;
  previewVisible.value = true;
}

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

const route = useRoute();
const router = useRouter();

// 详情预览是 teleport 到 body 的弹窗，页面被 keep-alive 缓存，跳到工作文档标签时
// 路由变化不会自动关它。失活时主动关闭，避免跳转后残留覆盖。
onDeactivated(() => {
  previewVisible.value = false;
});

onMounted(async () => {
  await fetchPlatforms();
  handleQuery();
  if (route.query.action === "add") {
    handleCreateClick();
    const { action, ...rest } = route.query;
    void action;
    router.replace({ path: route.path, query: rest });
  }
});
</script>

<style lang="scss" scoped>
.daily-summary {
  display: flex;
  flex-direction: column;
}

.log-row {
  display: grid;
  grid-template-columns: 1fr 32px;
  gap: 12px;
  padding: 10px 0;
  border-top: 2px dashed var(--ai-border, var(--ai-border));
  align-items: center;
  cursor: pointer;

  &:first-child {
    border-top: 0;
    padding-top: 2px;
  }

  &:hover .log-action {
    background: var(--ai-primary-bg, var(--ai-primary-bg));
    color: var(--ai-primary-active, var(--ai-primary-active));
  }
}

.log-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--ai-text, var(--ai-text));
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-platform {
  font-size: 11px;
  font-weight: 800;
  color: var(--ai-primary-active, var(--ai-primary-active));
  background: var(--ai-primary-bg, var(--ai-primary-bg));
  padding: 2px 8px;
  border-radius: 999px;
}

.log-desc {
  font-size: 12px;
  color: var(--ai-text-2, var(--ai-text-2));
  margin-top: 3px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.55;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.log-words {
  font-size: 11px;
  color: var(--ai-primary-active, var(--ai-primary-active));
  background: var(--ai-primary-bg, var(--ai-primary-bg));
  padding: 2px 9px;
  border-radius: 999px;
  font-weight: 800;
}

.log-tag {
  font-size: 11px;
  color: var(--ai-text-2, var(--ai-text-2));
  font-weight: 700;
}

.log-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 0;
  background: #fff;
  cursor: pointer;
  color: var(--ai-text, var(--ai-text));
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 3px 0 0 var(--ai-shadow-color, var(--ai-shadow-color));
  transition: background 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 0 0 var(--ai-shadow-color, var(--ai-shadow-color));
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 0 var(--ai-shadow-color, var(--ai-shadow-color));
  }
}

.daily-preview {
  max-height: 400px;
  overflow-y: auto;
}
</style>

<style lang="scss">
.daily-preview-modal {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
