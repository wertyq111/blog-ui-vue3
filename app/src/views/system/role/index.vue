<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">SYSTEM MANAGEMENT</div>
      <h1 class="page-title">角色管理</h1>
      <p class="page-desc">维护角色标识、授权能力与状态信息，统一后台权限角色体系。</p>
    </div>

    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">角色名称：</label>
        <Input
          v-model="queryParams['filter[name]']"
          class="filter-input"
          placeholder="请输入角色名称"
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
          <div class="list-title">角色列表</div>
          <div class="list-sub">支持批量删除、角色编辑与权限维护。</div>
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
          @click="handleBatchDelete"
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
              <th style="width: 60px">ID</th>
              <th>角色名称</th>
              <th>角色标识</th>
              <th style="width: 130px">
                职级状态
                <span class="sort-ic"><SystemIco name="chev" :size="10" /></span>
              </th>
              <th style="width: 100px">排序号</th>
              <th>备注</th>
              <th style="width: 220px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in roleList" :key="row.id">
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
              <td class="cell-mono">{{ row.code }}</td>
              <td>
                <Switch
                  v-hasPerm="'sys:role:status'"
                  :model-value="row.status === 1"
                  size="small"
                  :loading="statusLoadingId === row.id"
                  @update:model-value="(val: boolean) => handleStatusToggle(row, val)"
                />
              </td>
              <td class="cell-num">{{ row.sort }}</td>
              <td class="cell-note">{{ row.note || "" }}</td>
              <td>
                <span class="tbl-actions">
                  <span class="action-link act-edit" @click="handleEditClick(row)">
                    <SystemIco name="edit" :size="12" />
                    修改
                  </span>
                  <span
                    v-hasPerm="'sys:role:permission'"
                    class="action-link act-assign"
                    @click="handleAssignPermClick(row)"
                  >
                    <SystemIco name="shield" :size="12" />
                    分配权限
                  </span>
                  <span class="action-link act-del" @click="handleDelete(row.id)">
                    <SystemIco name="trash" :size="12" />
                    删除
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && roleList.length === 0" class="empty-row">
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

    <RoleEdit v-model:visible="editVisible" :data="editingRole" @done="handleResetQuery" />
    <RoleAuth v-model:visible="authVisible" :role="authRole" @done="handleResetQuery" />
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { onMounted, reactive, ref } from "vue";

import { Button, Input, Switch } from "animal-island-vue";
import RoleAPI from "@/api/system/role";
import type { RoleItem, RoleQueryParams } from "@/types/api";
import RoleEdit from "./role-edit.vue";
import RoleAuth from "./role-auth.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import { useTableSelection } from "@/composables/useTableSelection";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const loading = ref(false);
const total = ref(0);
const roleList = ref<RoleItem[]>([]);
const editVisible = ref(false);
const authVisible = ref(false);
const editingRole = ref<RoleItem | null>(null);
const authRole = ref<RoleItem | null>(null);
const statusLoadingId = ref<string | null>(null);

const queryParams = reactive<RoleQueryParams>({
  pageNum: 1,
  pageSize: 10,
});

const { checkedIds, allChecked, hasSelection, isChecked, toggleRow, toggleAll, clearSelection } =
  useTableSelection(roleList, (row) => row.id);

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await RoleAPI.getPage(queryParams);
    roleList.value = data.list;
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

function resetQuery(): void {
  queryParams["filter[name]"] = undefined;
}

function handleResetQuery(): void {
  resetQuery();
  handleQuery();
}

async function handleStatusToggle(row: RoleItem, val: boolean): Promise<void> {
  if (!row.id) return;
  const next = val ? 1 : 0;
  statusLoadingId.value = row.id;
  try {
    await RoleAPI.updateStatus(row.id, next);
    row.status = next;
    message.success(val ? "已启用" : "已禁用");
  } finally {
    statusLoadingId.value = null;
  }
}

function handleCreateClick(): void {
  editingRole.value = null;
  editVisible.value = true;
}

function handleEditClick(row: RoleItem): void {
  editingRole.value = row;
  editVisible.value = true;
}

function handleAssignPermClick(row: RoleItem): void {
  authRole.value = row;
  authVisible.value = true;
}

function handleDelete(roleId?: string): void {
  const roleIds = roleId ? [roleId] : checkedIds.value;
  if (!roleIds.length) {
    message.warning("请勾选删除项");
    return;
  }

  confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      const request =
        roleIds.length === 1
          ? RoleAPI.deleteById(roleIds[0])
          : RoleAPI.batchDelete(roleIds.map(Number));
      request
        .then(() => {
          message.success("删除成功");
          handleResetQuery();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => {
      message.info("已取消删除");
    }
  );
}

function handleBatchDelete(): void {
  handleDelete();
}

onMounted(() => {
  handleQuery();
});
</script>
