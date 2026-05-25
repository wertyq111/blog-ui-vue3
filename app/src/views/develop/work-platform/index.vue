<!-- 工作平台 -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">DEVELOP WORKSPACE</div>
      <h1 class="page-title">工作平台</h1>
      <p class="page-desc">维护项目来源、启用状态与展示顺序，为工作日常与文档提供统一平台基座。</p>
    </div>

    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">平台名称：</label>
        <Input
          v-model="queryParams.name"
          class="filter-input"
          placeholder="请输入平台名称"
          allow-clear
          @keyup.enter="handleQuery"
        />
      </div>
      <div class="filter-field">
        <label class="filter-label">状态：</label>
        <Select
          v-model="statusModel"
          class="filter-select"
          placeholder="全部"
          :options="statusOptions"
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
          <div class="list-title">平台排序列表</div>
          <div class="list-sub">拖拽左侧手柄即可调整顺序，排序结果将自动保存。</div>
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
              <th style="width: 56px">排序</th>
              <th>平台名称</th>
              <th style="width: 90px">序号</th>
              <th style="width: 110px">状态</th>
              <th style="width: 170px">创建时间</th>
              <th style="width: 170px">更新时间</th>
              <th style="width: 150px">操作</th>
            </tr>
          </thead>
          <tbody ref="tbodyRef">
            <tr v-for="row in dataList" :key="row.id">
              <td>
                <span class="drag-handle" title="拖拽排序">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <circle cx="5" cy="3" r="1.4" />
                    <circle cx="11" cy="3" r="1.4" />
                    <circle cx="5" cy="8" r="1.4" />
                    <circle cx="11" cy="8" r="1.4" />
                    <circle cx="5" cy="13" r="1.4" />
                    <circle cx="11" cy="13" r="1.4" />
                  </svg>
                </span>
              </td>
              <td>{{ row.name }}</td>
              <td class="cell-num">{{ row.sort }}</td>
              <td>
                <Switch
                  :model-value="row.status === 1"
                  size="small"
                  :loading="statusLoadingId === row.id"
                  @update:model-value="(val: boolean) => handleStatusToggle(row, val)"
                />
              </td>
              <td class="cell-mono">{{ row.createTime }}</td>
              <td class="cell-mono">{{ row.updateTime }}</td>
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
              <td colspan="7">暂无数据</td>
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

    <WorkPlatformEdit v-model:visible="editVisible" :data="editingRow" @done="handleQuery" />
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { computed, nextTick, onMounted, reactive, ref } from "vue";

import { Button, Input, Select, Switch } from "animal-island-vue";
import { useDraggable } from "vue-draggable-plus";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { WorkPlatformItem, WorkPlatformQueryParams } from "@/types/api/work-platform";
import WorkPlatformEdit from "./work-platform-edit.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";

defineOptions({ name: "WorkPlatform", inheritAttrs: false });

const queryParams = reactive<WorkPlatformQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
  status: undefined,
});

const statusOptions = [
  { key: "", label: "全部" },
  { key: "1", label: "启用" },
  { key: "0", label: "禁用" },
];

const statusModel = computed<string>({
  get: () => (queryParams.status == null ? "" : String(queryParams.status)),
  set: (value) => {
    queryParams.status = value === "" ? undefined : Number(value);
  },
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<WorkPlatformItem[]>([]);
const editVisible = ref(false);
const editingRow = ref<WorkPlatformItem | null>(null);
const statusLoadingId = ref<number | null>(null);
const tbodyRef = ref<HTMLElement | null>(null);

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await WorkPlatformAPI.getPage(queryParams);
    dataList.value = data.list;
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function handleReorder(): Promise<void> {
  const list = dataList.value.map((item, index) => ({ id: item.id, sort: index }));
  loading.value = true;
  try {
    await WorkPlatformAPI.reorder(list);
    message.success("排序已保存");
  } finally {
    fetchList();
  }
}

function handleQuery(): void {
  queryParams.pageNum = 1;
  fetchList();
}

function handleResetQuery(): void {
  queryParams.name = "";
  queryParams.status = undefined;
  handleQuery();
}

function handleCreateClick(): void {
  editingRow.value = null;
  editVisible.value = true;
}

function handleEditClick(row: WorkPlatformItem): void {
  editingRow.value = row;
  editVisible.value = true;
}

async function handleStatusToggle(row: WorkPlatformItem, val: boolean): Promise<void> {
  const next = val ? 1 : 0;
  statusLoadingId.value = row.id;
  try {
    await WorkPlatformAPI.update(row.id, { name: row.name, status: next, sort: row.sort });
    row.status = next;
    message.success(val ? "已启用" : "已禁用");
  } finally {
    statusLoadingId.value = null;
  }
}

function handleDelete(id: number): void {
  confirm("确认删除该平台吗？这将导致关联的日常记录显示异常。", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      WorkPlatformAPI.deleteById(id)
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
  handleQuery();
  await nextTick();
  if (tbodyRef.value) {
    useDraggable(tbodyRef, dataList, {
      handle: ".drag-handle",
      animation: 150,
      onEnd: handleReorder,
    });
  }
});
</script>

<style lang="scss" scoped>
.drag-handle {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  cursor: move;
  color: var(--ai-text-3, #c4b89e);
  border-radius: 8px;

  &:hover {
    color: var(--ai-primary, #19c8b9);
    background: rgba(25, 200, 185, 0.1);
  }
}
</style>
