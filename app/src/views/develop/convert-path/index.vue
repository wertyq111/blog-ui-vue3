<!-- 路径转换 -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">DEVELOP WORKSPACE</div>
      <h1 class="page-title">路径转换</h1>
      <p class="page-desc">管理项目的本地与服务器路径映射，并提供快捷的路径转换工具。</p>
    </div>

    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">项目名称：</label>
        <Input
          v-model="queryParams.name"
          class="filter-input"
          placeholder="请输入项目名称"
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
          <div class="list-title">路径映射列表</div>
          <div class="list-sub">配置本地开发路径与服务器部署路径的对应关系。</div>
        </div>
      </div>

      <div class="toolbar">
        <Button
          v-hasPerm="'sys:convert-path:add'"
          type="primary"
          size="small"
          @click="handleCreateClick"
        >
          <SystemIco name="plus" :size="13" />
          添加
        </Button>
        <Button
          v-hasPerm="'sys:convert-path:delete'"
          type="default"
          size="small"
          danger
          :disabled="!hasSelection"
          @click="handleDelete()"
        >
          <SystemIco name="trash" :size="13" />
          删除
        </Button>
        <Button type="default" size="small" @click="toolVisible = !toolVisible">
          <SystemIco name="refresh" :size="13" />
          {{ toolVisible ? "收起工具" : "路径转换工具" }}
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

      <ConvertPathTool v-if="toolVisible" />

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
              <th style="width: 140px">项目编码</th>
              <th style="width: 150px">项目名称</th>
              <th>网址</th>
              <th>服务器地址</th>
              <th style="width: 80px">排序</th>
              <th style="width: 150px">操作</th>
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
              <td class="cell-mono">
                <a v-if="row.url" :href="row.url" target="_blank" class="action-link act-edit">
                  {{ row.url }}
                </a>
                <span v-else>-</span>
              </td>
              <td class="cell-mono">{{ row.target }}</td>
              <td class="cell-num">{{ row.sort }}</td>
              <td>
                <span class="tbl-actions">
                  <span
                    v-hasPerm="'sys:convert-path:edit'"
                    class="action-link act-edit"
                    @click="handleEditClick(row)"
                  >
                    <SystemIco name="edit" :size="12" />
                    修改
                  </span>
                  <span
                    v-hasPerm="'sys:convert-path:delete'"
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

    <ConvertPathEdit v-model:visible="editVisible" :data="editingRow" @done="handleQuery" />
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { onMounted, reactive, ref } from "vue";

import { Button, Input } from "animal-island-vue";
import ServerPathAPI from "@/api/develop/server-path";
import type { ServerPathItem, ServerPathQueryParams } from "@/types/api/server-path";
import ConvertPathEdit from "./convert-path-edit.vue";
import ConvertPathTool from "./convert-path-tool.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import { useTableSelection } from "@/composables/useTableSelection";

defineOptions({ name: "ConvertPath", inheritAttrs: false });

const queryParams = reactive<ServerPathQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
});

const loading = ref(false);
const total = ref(0);
const dataList = ref<ServerPathItem[]>([]);
const editVisible = ref(false);
const editingRow = ref<ServerPathItem | null>(null);
const toolVisible = ref(false);

const { checkedIds, allChecked, hasSelection, isChecked, toggleRow, toggleAll, clearSelection } =
  useTableSelection(dataList, (row) => row.id);

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await ServerPathAPI.getPage(queryParams);
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
  queryParams.name = "";
  handleQuery();
}

function handleCreateClick(): void {
  editingRow.value = null;
  editVisible.value = true;
}

function handleEditClick(row: ServerPathItem): void {
  editingRow.value = row;
  editVisible.value = true;
}

function handleDelete(id?: number): void {
  const ids = id ? [id] : checkedIds.value.map(Number);
  if (!ids.length) {
    message.warning("请勾选删除项");
    return;
  }

  confirm("确认删除选中的路径映射吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      const request =
        ids.length === 1 ? ServerPathAPI.deleteById(ids[0]) : ServerPathAPI.batchDelete(ids);
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
