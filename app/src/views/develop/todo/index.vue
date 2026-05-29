<!-- 待办列表 -->
<template>
  <div class="page-card">
    <section class="develop-hero">
      <div class="page-head">
        <div class="page-eyebrow">DEVELOP WORKSPACE</div>
        <h1 class="page-title">待办列表</h1>
        <p class="page-desc">统一管理开发任务与待办事项，支持状态跟踪、优先级管理和平台关联。</p>
      </div>
      <!-- 右上角按照精美动森徽章贴纸风格显示的统计项 -->
      <div class="develop-hero__meta">
        <div class="ac-stat-badge">
          <span class="ac-stat-label">总计</span>
          <span class="ac-stat-value ac-stat-value--total">{{ statistics.total }}</span>
        </div>
        <div class="ac-stat-badge">
          <span class="ac-stat-label">待办</span>
          <span class="ac-stat-value ac-stat-value--pending">{{ statistics.pending }}</span>
        </div>
        <div class="ac-stat-badge">
          <span class="ac-stat-label">进行中</span>
          <span class="ac-stat-value ac-stat-value--progress">{{ statistics.inProgress }}</span>
        </div>
        <div class="ac-stat-badge">
          <span class="ac-stat-label">已完成</span>
          <span class="ac-stat-value ac-stat-value--done">{{ statistics.completed }}</span>
        </div>
      </div>
    </section>

    <div class="filter-bar" style="z-index: 10">
      <div class="filter-field">
        <label class="filter-label">状态：</label>
        <AnimalSelect
          v-model="statusModel"
          class="filter-select"
          placeholder="全部状态"
          :options="statusOptions"
        />
      </div>
      <div class="filter-field">
        <label class="filter-label">优先级：</label>
        <AnimalSelect
          v-model="priorityModel"
          class="filter-select"
          placeholder="全部优先级"
          :options="priorityOptions"
        />
      </div>
      <div class="filter-field">
        <label class="filter-label">截止日期：</label>
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
          v-model="queryParams.keyword"
          class="filter-input"
          placeholder="请输入关键字"
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

    <div class="list-card">
      <div class="list-head">
        <div>
          <div class="list-title">待办事项列表</div>
          <div class="list-sub">支持在列表内行内快捷编辑状态、优先级、截止日期与所属平台。</div>
        </div>
      </div>

      <div class="toolbar">
        <Button type="primary" size="small" @click="handleCreateClick">
          <SystemIco name="plus" :size="13" />
          添加
        </Button>
        <Button
          type="default"
          size="small"
          danger
          :disabled="!hasSelection"
          @click="handleDelete()"
        >
          <SystemIco name="trash" :size="13" />
          删除
        </Button>
        <div class="batch-status" :class="{ 'batch-status--disabled': !hasSelection }">
          <AnimalTableSelect
            :model-value="batchStatusModel"
            :options="batchStatusOptions"
            mode="tag"
            @change="handleBatchStatus"
          />
        </div>
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
              <th style="width: 44px">
                <span class="cbx" :class="{ 'is-checked': allChecked }" @click="toggleAll">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4">
                    <path d="M2.5 6.5l2.5 2.5 5-6" />
                  </svg>
                </span>
              </th>
              <th style="width: 70px">ID</th>
              <th>待办标题</th>
              <th style="width: 130px">状态</th>
              <th style="width: 120px">优先级</th>
              <th style="width: 156px">截止日期</th>
              <th style="width: 166px">平台</th>
              <th style="width: 170px">创建时间</th>
              <th style="width: 140px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in todoList" :key="row.id">
              <td>
                <span
                  class="cbx"
                  :class="{ 'is-checked': isChecked(row.id) }"
                  @click="toggleRow(row.id)"
                >
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4">
                    <path d="M2.5 6.5l2.5 2.5 5-6" />
                  </svg>
                </span>
              </td>
              <td class="cell-num">{{ row.id }}</td>
              <td class="tbl-name-cell">
                <div class="todo-title-cell">
                  <span
                    class="todo-title-link"
                    :class="{ 'todo-title--done': row.status === 2 }"
                    title="点击预览内容"
                    @click="openPreview(row)"
                    >{{ row.title }}</span
                  >
                  <div v-if="row.tags && row.tags.length" class="todo-tags-inline">
                    <AnimalTag v-for="(tag, idx) in row.tags" :key="idx" size="small" type="info">
                      {{ tag }}
                    </AnimalTag>
                  </div>
                </div>
              </td>
              <td>
                <!-- 状态：替换为全新的动森风表格下拉组件 -->
                <AnimalTableSelect
                  :model-value="row.status"
                  :options="statusOptionsWithTypes"
                  mode="tag"
                  @change="(cmd: number) => handleQuickStatus(row, cmd)"
                />
              </td>
              <td>
                <!-- 优先级：替换为全新的动森风表格下拉组件 -->
                <AnimalTableSelect
                  :model-value="row.priority"
                  :options="priorityOptionsWithTypes"
                  mode="tag"
                  @change="(cmd: number) => handleQuickPriority(row, cmd)"
                />
              </td>
              <td>
                <!-- 截止日期：替换为全新的动森风表格日期选择组件 -->
                <AnimalTableDatePicker
                  :model-value="row.dueDate"
                  :is-overdue="isOverdue(row)"
                  placeholder="选择日期"
                  @change="
                    (value: any) =>
                      handleQuickField(row, { due_date: value || null }, '截止日期已更新')
                  "
                />
              </td>
              <td>
                <!-- 关联平台：替换为全新的动森风输入款表格下拉组件 -->
                <AnimalTableSelect
                  :model-value="rowPlatformId(row)"
                  :options="platformSelectOptions"
                  mode="input"
                  placeholder="选择平台"
                  clearable
                  @change="
                    (value: any) =>
                      handleQuickField(
                        row,
                        { platform_id: value == null ? 0 : Number(value) },
                        '平台已更新'
                      )
                  "
                />
              </td>
              <td class="cell-mono">{{ formatDateTime(row.createTime) }}</td>
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
            <tr v-if="!loading && todoList.length === 0" class="empty-row">
              <td colspan="9">暂无数据</td>
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

    <!-- 编辑/添加弹窗 -->
    <TodoEdit
      v-model:visible="editVisible"
      :data="editingRow"
      :platforms="platforms"
      @done="handleQuery"
    />

    <!-- 内容预览弹窗 -->
    <AdminAnimalModal
      v-model:visible="previewVisible"
      :title="previewTitle"
      :width="720"
      :show-footer="false"
      content-class="todo-preview-modal"
    >
      <AnimalMarkdown
        v-if="previewContent"
        :model-value="previewContent"
        preview-only
        height="auto"
      />
      <div v-else class="todo-preview-empty">暂无内容</div>
    </AdminAnimalModal>
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { loadingService } from "@/directives/loading";
import { computed, onMounted, reactive, ref } from "vue";
import { Button, Input } from "animal-island-vue";
import AnimalSelect from "@/components/AnimalSelect/index.vue";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import AnimalTableSelect from "@/components/AnimalTableSelect/index.vue";
import AnimalTableDatePicker from "@/components/AnimalTableDatePicker/index.vue";
import TodoAPI from "@/api/develop/todo";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { TodoItem, TodoQueryParams, TodoForm, TodoStatistics } from "@/types/api/todo";
import type { WorkPlatformItem } from "@/types/api/work-platform";
import TodoEdit from "./todo-edit.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AnimalTag from "@/components/AnimalTag/index.vue";
import AnimalMarkdown from "@/components/AnimalMarkdown/index.vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import { useTableSelection } from "@/composables/useTableSelection";
import { formatDateTime } from "@/utils/format";

defineOptions({
  name: "Todo",
  inheritAttrs: false,
});

const queryParams = reactive<TodoQueryParams>({
  pageNum: 1,
  pageSize: 10,
  status: undefined,
  priority: undefined,
  keyword: "",
});

const dateRange = ref<[string, string]>();
const loading = ref(false);
const total = ref(0);
const todoList = ref<TodoItem[]>([]);
const platforms = ref<WorkPlatformItem[]>([]);
const editVisible = ref(false);
const editingRow = ref<TodoItem | null>(null);

// 内容预览弹窗
const previewVisible = ref(false);
const previewTitle = ref("");
const previewContent = ref("");

// 批量修改状态：首项为占位（触发器显示「批量状态」），选中真实状态后回调
const BATCH_PLACEHOLDER = "";
const batchStatusModel = ref<string | number>(BATCH_PLACEHOLDER);
const batchStatusOptions = [
  { value: BATCH_PLACEHOLDER, label: "批量状态", type: "info" as const },
  { value: 0, label: "待办", type: "info" as const },
  { value: 1, label: "进行中", type: "warning" as const },
  { value: 2, label: "已完成", type: "success" as const },
  { value: 3, label: "已取消", type: "danger" as const },
];

const statistics = reactive<TodoStatistics>({
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
});

const { checkedIds, allChecked, hasSelection, isChecked, toggleRow, toggleAll, clearSelection } =
  useTableSelection(todoList, (row) => row.id);

const statusOptions = [
  { key: "", label: "全部状态" },
  { key: "0", label: "待办" },
  { key: "1", label: "进行中" },
  { key: "2", label: "已完成" },
  { key: "3", label: "已取消" },
];

const priorityOptions = [
  { key: "", label: "全部优先级" },
  { key: "0", label: "低" },
  { key: "1", label: "中" },
  { key: "2", label: "高" },
  { key: "3", label: "紧急" },
];

const statusOptionsWithTypes = computed(() => [
  { value: 0, label: "待办", type: "info" as const },
  { value: 1, label: "进行中", type: "warning" as const },
  { value: 2, label: "已完成", type: "success" as const },
  { value: 3, label: "已取消", type: "danger" as const },
]);

const priorityOptionsWithTypes = computed(() => [
  { value: 0, label: "低", type: "info" as const },
  { value: 1, label: "中", type: "primary" as const },
  { value: 2, label: "高", type: "warning" as const },
  { value: 3, label: "紧急", type: "danger" as const },
]);

const platformSelectOptions = computed(() => {
  return platforms.value.map((p) => ({
    value: p.id,
    label: p.name,
  }));
});

const statusModel = computed<string>({
  get: () => (queryParams.status == null ? "" : String(queryParams.status)),
  set: (value) => {
    queryParams.status = value === "" ? undefined : Number(value);
  },
});

const priorityModel = computed<string>({
  get: () => (queryParams.priority == null ? "" : String(queryParams.priority)),
  set: (value) => {
    queryParams.priority = value === "" ? undefined : Number(value);
  },
});

function rowPlatformId(row: TodoItem): number | null {
  const id = row.platform_id ?? row.platformId ?? (row.platform ? row.platform.id : null);
  return id ? Number(id) : null;
}

function isOverdue(row: TodoItem): boolean {
  if (!row.dueDate || row.status === 2 || row.status === 3) return false;
  return new Date(row.dueDate) < new Date(new Date().toDateString());
}

async function fetchPlatforms(): Promise<void> {
  try {
    platforms.value = await WorkPlatformAPI.getList(1);
  } catch {
    platforms.value = [];
  }
}

async function fetchStatistics(): Promise<void> {
  try {
    const data = await TodoAPI.getStatistics();
    Object.assign(statistics, data);
  } catch {
    // ignore
  }
}

async function fetchList(): Promise<void> {
  queryParams.startDate = dateRange.value ? dateRange.value[0] : undefined;
  queryParams.endDate = dateRange.value ? dateRange.value[1] : undefined;
  loading.value = true;
  try {
    const data = await TodoAPI.getPage(queryParams);
    todoList.value = data.list;
    total.value = data.total ?? 0;
    clearSelection();
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
  queryParams.status = undefined;
  queryParams.priority = undefined;
  queryParams.keyword = "";
  handleQuery();
}

function handleCreateClick(): void {
  editingRow.value = null;
  editVisible.value = true;
}

function handleEditClick(row: TodoItem): void {
  editingRow.value = row;
  editVisible.value = true;
}

function openPreview(row: TodoItem): void {
  previewTitle.value = row.title || "内容预览";
  previewContent.value = row.content ?? "";
  previewVisible.value = true;
}

async function handleQuickStatus(row: TodoItem, status: number): Promise<void> {
  const loadingInstance = loadingService({ lock: true });
  try {
    await TodoAPI.updateStatus(row.id, status);
    row.status = status;
    message.success("状态已更新");
    fetchStatistics();
  } catch {
    // request 拦截器已统一弹出错误提示，避免同一次失败显示两条消息。
  } finally {
    loadingInstance.close();
  }
}

function handleBatchStatus(value: string | number): void {
  if (value === BATCH_PLACEHOLDER) return;
  const ids = [...checkedIds.value];
  if (!ids.length) {
    message.warning("请勾选待办项");
    return;
  }

  const status = Number(value);
  const label = batchStatusOptions.find((o) => o.value === value)?.label ?? "";

  confirm(`确认将选中的 ${ids.length} 项待办状态改为「${label}」吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    async () => {
      const loadingInstance = loadingService({ lock: true });
      try {
        for (const id of ids) {
          await TodoAPI.updateStatus(Number(id), status);
        }
        message.success("状态已批量更新");
        await fetchList();
        fetchStatistics();
      } catch {
        // request 拦截器已统一弹出错误提示
      } finally {
        loadingInstance.close();
      }
    },
    () => undefined
  );
}

function buildQuickUpdatePayload(row: TodoItem, patch: Partial<TodoForm>): TodoForm {
  return {
    title: row.title,
    content: row.content ?? "",
    status: row.status,
    priority: row.priority,
    due_date: row.due_date ?? row.dueDate ?? null,
    platform_id: rowPlatformId(row) ?? 0,
    tags: row.tags ?? [],
    ...patch,
  };
}

async function handleQuickField(
  row: TodoItem,
  payload: Partial<TodoForm>,
  successText: string
): Promise<void> {
  const loadingInstance = loadingService({ lock: true });
  try {
    const updatePayload = buildQuickUpdatePayload(row, payload);
    await TodoAPI.update(row.id, updatePayload);
    if ("due_date" in payload) {
      row.dueDate = updatePayload.due_date ?? null;
      row.due_date = updatePayload.due_date ?? null;
    }
    if ("platform_id" in payload) {
      row.platformId = updatePayload.platform_id;
      row.platform_id = updatePayload.platform_id;
      const target = platforms.value.find((p) => p.id === updatePayload.platform_id);
      row.platform = target ? { id: target.id, name: target.name } : null;
    }
    if ("priority" in payload) {
      row.priority = updatePayload.priority;
    }
    message.success(successText);
    fetchStatistics();
  } catch {
    // request 拦截器已统一弹出错误提示，避免同一次失败显示两条消息。
  } finally {
    loadingInstance.close();
  }
}

function handleQuickPriority(row: TodoItem, priority: number): Promise<void> {
  return handleQuickField(row, { priority }, "优先级已更新");
}

async function deleteTodos(ids: string): Promise<void> {
  const arr = ids.split(",");
  for (const id of arr) {
    await TodoAPI.deleteById(Number(id));
  }
  message.success("删除成功");
  handleQuery();
  fetchStatistics();
}

function handleDelete(id?: number): void {
  const todoIds = id ? String(id) : checkedIds.value.join(",");
  if (!todoIds) {
    message.warning("请勾选删除项");
    return;
  }

  confirm("确认删除选中的待办事项吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      deleteTodos(todoIds).finally(() => {
        loading.value = false;
      });
    },
    () => undefined
  );
}

onMounted(async () => {
  await fetchPlatforms();
  await fetchStatistics();
  handleQuery();
});
</script>

<style lang="scss" scoped>
.todo-title-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 4px;
  width: 100%;

  span {
    display: block;
    width: 100%;
    text-align: left;
  }
}

.batch-status {
  display: inline-flex;
  align-items: center;

  // 触发器与左侧小按钮等高对齐（小按钮约 32px）
  :deep(.animal-table-trigger-tag) {
    height: 32px;

    .ai-tag {
      display: inline-flex;
      align-items: center;
      height: 100%;
      padding: 0 14px;
      border-radius: 999px;
    }
  }

  &--disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}

.todo-title-link {
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: var(--ai-primary, #19c8b9);
    text-decoration: underline;
  }
}

.todo-title--done {
  text-decoration: line-through;
  opacity: 0.6;
}

.todo-tags-inline {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
}

/* 动森贴纸徽章风格统计排版 */
.develop-hero__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
  z-index: 5;
}

.ac-stat-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 2px 2px 10px;
  background: rgba(255, 255, 255, 0.55);
  border: 1.5px solid rgba(121, 79, 39, 0.15);
  border-radius: 999px;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 10px rgba(121, 79, 39, 0.03);

  &:hover {
    transform: translateX(-4px) scale(1.02);
    background: rgba(255, 255, 255, 0.85);
    border-color: var(--ai-primary, #19c8b9);
    box-shadow: 0 6px 12px rgba(25, 200, 185, 0.12);
  }
}

.ac-stat-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--ai-text, #794f27);
  text-shadow: 0 1px 0 #ffffff;
}

.ac-stat-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-family: "Mochiy Pop One", "Nunito", sans-serif;
  font-size: 11px;
  font-weight: 900;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);

  &--total {
    background-color: var(--ai-text-2, #9f927d);
  }
  &--pending {
    background-color: #5b9eee;
  }
  &--progress {
    background-color: #fca130;
  }
  &--done {
    background-color: var(--ai-success, #6fba2c);
  }
}

.todo-preview-empty {
  padding: 32px 0;
  text-align: center;
  color: var(--ai-text-3, #b3a892);
  font-size: 13px;
}
</style>

<style lang="scss">
.todo-preview-modal {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
