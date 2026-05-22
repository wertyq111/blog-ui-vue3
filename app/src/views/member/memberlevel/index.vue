<!-- 会员等级管理 -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">MEMBER LEVEL</div>
      <h1 class="page-title">会员等级</h1>
      <p class="page-desc">配置会员等级体系与排序，定义会员成长权益结构。</p>
    </div>

    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">等级名称：</label>
        <Input
          v-model="queryParams.name"
          class="filter-input"
          placeholder="请输入等级名称"
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
          <div class="list-title">等级定义列表</div>
          <div class="list-sub">维护会员等级名称与展示排序。</div>
        </div>
      </div>

      <div class="toolbar">
        <Button
          v-hasPerm="'sys:memberlevel:add'"
          type="primary"
          size="small"
          @click="handleCreateClick"
        >
          <SystemIco name="plus" :size="13" />
          添加
        </Button>
        <Button
          v-hasPerm="'sys:memberlevel:delete'"
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
          <Button class="btn-icon" type="default" size="small" title="密度">
            <SystemIco name="density" :size="14" />
          </Button>
          <Button class="btn-icon" type="default" size="small" title="列设置">
            <SystemIco name="settings" :size="14" />
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
              <th>等级名称</th>
              <th style="width: 120px">排序号</th>
              <th>创建时间</th>
              <th style="width: 150px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in levelList" :key="row.id">
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
              <td>{{ row.name }}</td>
              <td class="cell-num">{{ row.sort }}</td>
              <td class="cell-mono">{{ row.createTime }}</td>
              <td>
                <span class="tbl-actions">
                  <span
                    v-hasPerm="'sys:memberlevel:edit'"
                    class="action-link act-edit"
                    @click="handleEditClick(row)"
                  >
                    <SystemIco name="edit" :size="12" />
                    修改
                  </span>
                  <span
                    v-hasPerm="'sys:memberlevel:delete'"
                    class="action-link act-del"
                    @click="handleDelete(row.id)"
                  >
                    <SystemIco name="trash" :size="12" />
                    删除
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && levelList.length === 0" class="empty-row">
              <td colspan="6">暂无数据</td>
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

    <MemberLevelEdit v-model:visible="editVisible" :data="editingLevel" @done="handleQuery" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Button, Input } from "animal-island-vue";
import MemberLevelAPI from "@/api/member/member-level";
import type { MemberLevelItem, MemberLevelQueryParams } from "@/types/api";
import MemberLevelEdit from "./memberlevel-edit.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import { useTableSelection } from "@/composables/useTableSelection";

defineOptions({
  name: "MemberLevel",
  inheritAttrs: false,
});

const queryParams = reactive<MemberLevelQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
});

const levelList = ref<MemberLevelItem[]>([]);
const total = ref(0);
const loading = ref(false);
const editVisible = ref(false);
const editingLevel = ref<MemberLevelItem | null>(null);

const { checkedIds, allChecked, hasSelection, isChecked, toggleRow, toggleAll, clearSelection } =
  useTableSelection(levelList, (row) => row.id);

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await MemberLevelAPI.getPage(queryParams);
    levelList.value = data.list;
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
  editingLevel.value = null;
  editVisible.value = true;
}

function handleEditClick(row: MemberLevelItem): void {
  editingLevel.value = row;
  editVisible.value = true;
}

function handleDelete(id?: number): void {
  const ids = id ? [id] : checkedIds.value.map(Number);
  if (!ids.length) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除选中的会员等级吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      const request =
        ids.length === 1 ? MemberLevelAPI.deleteById(ids[0]) : MemberLevelAPI.deleteByIds(ids);
      request
        .then(() => {
          ElMessage.success("删除成功");
          handleQuery();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => ElMessage.info("已取消删除")
  );
}

onMounted(() => {
  handleQuery();
});
</script>
