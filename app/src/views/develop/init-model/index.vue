<!-- 模型初始化 -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">DEVELOP WORKSPACE</div>
      <h1 class="page-title">模型初始化</h1>
      <p class="page-desc">管理框架模板，按列定义快捷生成模型初始化代码。</p>
    </div>

    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">框架编码：</label>
        <Input
          v-model="queryParams.code"
          class="filter-input"
          placeholder="请输入框架编码"
          allow-clear
          @keyup.enter="handleQuery"
        />
      </div>
      <div class="filter-field">
        <label class="filter-label">框架名称：</label>
        <Input
          v-model="queryParams.name"
          class="filter-input"
          placeholder="请输入框架名称"
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
          <div class="list-title">框架模板列表</div>
          <div class="list-sub">定义不同技术栈的 Model/Entity 模板及其转换规则。</div>
        </div>
      </div>

      <div class="toolbar">
        <Button
          v-hasPerm="'sys:init-model:add'"
          type="primary"
          size="small"
          @click="handleCreateClick"
        >
          <SystemIco name="plus" :size="13" />
          添加
        </Button>
        <Button
          v-hasPerm="'sys:init-model:delete'"
          type="default"
          size="small"
          danger
          :disabled="!hasSelection"
          @click="handleDelete()"
        >
          <SystemIco name="trash" :size="13" />
          删除
        </Button>
        <div class="toolbar-spacer" />
        <div class="tool-group">
          <Button class="btn-icon" type="default" size="small" title="刷新" @click="fetchList">
            <SystemIco name="refresh" :size="14" />
          </Button>
          <Button class="btn-icon" type="default" size="small" title="全屏">
            <SystemIco name="full" :size="14" />
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
              <th style="width: 130px">框架编码</th>
              <th style="width: 150px">框架名称</th>
              <th>参考格式</th>
              <th style="width: 170px">创建时间</th>
              <th style="width: 170px">更新时间</th>
              <th style="width: 200px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dataList" :key="row.id">
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
              <td class="cell-mono">{{ row.code }}</td>
              <td>{{ row.name }}</td>
              <td class="cell-note">{{ row.tip }}</td>
              <td class="cell-mono">{{ row.createTime }}</td>
              <td class="cell-mono">{{ row.updateTime }}</td>
              <td>
                <span class="tbl-actions">
                  <span
                    v-hasPerm="'sys:init-model:convert'"
                    class="action-link act-assign"
                    @click="handleConvertClick(row)"
                  >
                    <SystemIco name="refresh" :size="12" />
                    转换
                  </span>
                  <span
                    v-hasPerm="'sys:init-model:edit'"
                    class="action-link act-edit"
                    @click="handleEditClick(row)"
                  >
                    <SystemIco name="edit" :size="12" />
                    修改
                  </span>
                  <span
                    v-hasPerm="'sys:init-model:delete'"
                    class="action-link act-del"
                    @click="handleDelete(row.id)"
                  >
                    <SystemIco name="trash" :size="12" />
                    删除
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && dataList.length === 0" class="empty-row">
              <td colspan="8">暂无数据</td>
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

    <InitModelEdit v-model:visible="editVisible" :data="editingRow" @done="handleQuery" />
    <InitModelConvert v-model:visible="convertVisible" :model-id="convertId" />
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { onMounted, reactive, ref } from "vue";

import { Button, Input } from "animal-island-vue";
import InitModelAPI from "@/api/develop/init-model";
import type { InitModelItem, InitModelQueryParams } from "@/types/api/init-model";
import InitModelEdit from "./init-model-edit.vue";
import InitModelConvert from "./init-model-convert.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import { useTableSelection } from "@/composables/useTableSelection";

defineOptions({ name: "InitModel", inheritAttrs: false });

const queryParams = reactive<InitModelQueryParams>({
  pageNum: 1,
  pageSize: 10,
  code: "",
  name: "",
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<InitModelItem[]>([]);
const editVisible = ref(false);
const editingRow = ref<InitModelItem | null>(null);
const convertVisible = ref(false);
const convertId = ref<number>();

const { checkedIds, allChecked, hasSelection, isChecked, toggleRow, toggleAll, clearSelection } =
  useTableSelection(dataList, (row) => row.id);

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await InitModelAPI.getPage(queryParams);
    dataList.value = data.list;
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
  queryParams.code = "";
  queryParams.name = "";
  handleQuery();
}

function handleCreateClick(): void {
  editingRow.value = null;
  editVisible.value = true;
}

function handleEditClick(row: InitModelItem): void {
  editingRow.value = row;
  editVisible.value = true;
}

function handleConvertClick(row: InitModelItem): void {
  convertId.value = row.id;
  convertVisible.value = true;
}

function handleDelete(id?: number): void {
  const ids = id ? [id] : checkedIds.value.map(Number);
  if (!ids.length) {
    message.warning("请勾选删除项");
    return;
  }

  confirm("确认删除选中的模板吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      const request =
        ids.length === 1 ? InitModelAPI.deleteById(ids[0]) : InitModelAPI.batchDelete(ids);
      request
        .then(() => {
          message.success("删除成功");
          handleQuery();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => message.info("已取消删除")
  );
}

onMounted(() => {
  handleQuery();
});
</script>
