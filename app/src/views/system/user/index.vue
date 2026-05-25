<!-- 用户管理 -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">SYSTEM MANAGEMENT</div>
      <h1 class="page-title">用户管理</h1>
      <p class="page-desc">维护后台账号、角色分配与启用状态，统一系统用户信息。</p>
    </div>

    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">用户账号：</label>
        <Input
          v-model="queryParams['filter[username]']"
          class="filter-input"
          placeholder="请输入用户账号"
          allow-clear
          @keyup.enter="handleQuery"
        />
      </div>
      <div class="filter-field">
        <label class="filter-label">性别：</label>
        <Select
          v-model="genderModel"
          class="filter-select"
          placeholder="请选择性别"
          :options="genderOptions"
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
          <div class="list-title">用户列表</div>
          <div class="list-sub">支持按账号、性别和角色快速筛选。</div>
        </div>
      </div>

      <div class="toolbar">
        <Button v-hasPerm="['sys:user:add']" type="primary" size="small" @click="handleCreateClick">
          <SystemIco name="plus" :size="13" />
          添加
        </Button>
        <Button
          v-hasPerm="'sys:user:delete'"
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
              <th>用户账号</th>
              <th>手机号</th>
              <th>角色</th>
              <th style="width: 110px">状态</th>
              <th>创建时间</th>
              <th>更新时间</th>
              <th style="width: 240px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in userList" :key="row.id">
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
              <td>{{ row.username }}</td>
              <td class="cell-mono">{{ row.phone || "" }}</td>
              <td>
                <AnimalTag v-if="row.roleNames" type="primary">{{ row.roleNames }}</AnimalTag>
                <span v-else class="cell-empty">-</span>
              </td>
              <td>
                <Switch
                  v-hasPerm="'sys:user:status'"
                  :model-value="row.status === CommonStatus.ENABLED"
                  size="small"
                  :loading="statusLoadingId === row.id"
                  @update:model-value="(val: boolean) => handleStatusToggle(row, val)"
                />
              </td>
              <td class="cell-mono">{{ formatDateTime(row.createTime) }}</td>
              <td class="cell-mono">{{ formatDateTime(row.updateTime) }}</td>
              <td>
                <span class="tbl-actions">
                  <span
                    v-hasPerm="'sys:user:edit'"
                    class="action-link act-edit"
                    @click="handleEditClick(row.id)"
                  >
                    <SystemIco name="edit" :size="12" />
                    修改
                  </span>
                  <span
                    v-hasPerm="'sys:user:delete'"
                    class="action-link act-del"
                    @click="handleDelete(row.id)"
                  >
                    <SystemIco name="trash" :size="12" />
                    删除
                  </span>
                  <span
                    v-hasPerm="'sys:user:resetPwd'"
                    class="action-link act-reset"
                    @click="handleResetPassword(row)"
                  >
                    <SystemIco name="key" :size="12" />
                    重置密码
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && userList.length === 0" class="empty-row">
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

    <UserEdit v-model:visible="editVisible" :user-id="editingUserId" @done="handleQuery" />
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { computed, onMounted, reactive, ref } from "vue";

import { Button, Input, Select, Switch } from "animal-island-vue";
import UserAPI from "@/api/system/user";
import { useUserStore } from "@/store";
import { CommonStatus } from "@/enums";
import type { UserItem, UserQueryParams } from "@/types/api";
import UserEdit from "./user-edit.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AnimalTag from "@/components/AnimalTag/index.vue";
import { useTableSelection } from "@/composables/useTableSelection";
import { formatDateTime } from "@/utils/format";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

const userStore = useUserStore();

const queryParams = reactive<UserQueryParams>({
  pageNum: 1,
  pageSize: 10,
  "filter[username]": "",
  "filter[phone]": "",
  "filter[gender]": undefined,
  "filter[status]": undefined,
});

const genderOptions = [
  { key: "", label: "全部" },
  { key: "1", label: "男" },
  { key: "2", label: "女" },
  { key: "3", label: "未知" },
];

const genderModel = computed<string>({
  get: () => (queryParams["filter[gender]"] == null ? "" : String(queryParams["filter[gender]"])),
  set: (value) => {
    queryParams["filter[gender]"] = value === "" ? undefined : Number(value);
  },
});

const userList = ref<UserItem[]>([]);
const total = ref(0);
const loading = ref(false);
const editVisible = ref(false);
const editingUserId = ref<string>();
const statusLoadingId = ref<string | null>(null);

const { checkedIds, allChecked, hasSelection, isChecked, toggleRow, toggleAll, clearSelection } =
  useTableSelection(userList, (row) => row.id);

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await UserAPI.getPage(queryParams);
    userList.value = data.list.map((user) => ({
      ...user,
      roleNames: user.roles?.map((role) => role.name).join(","),
    }));
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
  queryParams["filter[username]"] = "";
  queryParams["filter[phone]"] = "";
  queryParams["filter[gender]"] = undefined;
  queryParams["filter[status]"] = undefined;
}

function handleResetQuery(): void {
  resetQuery();
  handleQuery();
}

async function resetPassword(userId: string): Promise<void> {
  await UserAPI.resetPassword(userId);
  message.success("密码重置成功，新密码为 123456");
}

async function deleteUsers(userIds: string): Promise<void> {
  const ids = userIds.split(",");
  for (const id of ids) {
    await UserAPI.deleteById(id);
  }
  message.success("删除成功");
  handleQuery();
}

async function handleStatusToggle(row: UserItem, val: boolean): Promise<void> {
  const next = val ? CommonStatus.ENABLED : CommonStatus.DISABLED;
  statusLoadingId.value = row.id;
  try {
    await UserAPI.updateStatus(row.id, next);
    row.status = next;
    message.success(val ? "已启用" : "已禁用");
  } finally {
    statusLoadingId.value = null;
  }
}

function handleCreateClick(): void {
  editingUserId.value = undefined;
  editVisible.value = true;
}

function handleEditClick(id: string): void {
  editingUserId.value = id;
  editVisible.value = true;
}

function handleResetPassword(row: UserItem): void {
  confirm(`确认重置用户【${row.username}】的密码吗？`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => resetPassword(row.id),
    () => undefined
  );
}

function handleDelete(id?: string): void {
  const userIds = id ?? checkedIds.value.join(",");
  if (!userIds) {
    message.warning("请勾选删除项");
    return;
  }

  const currentUserId = userStore.userInfo?.userId;
  if (currentUserId) {
    const containsCurrentUser = id
      ? id === currentUserId
      : checkedIds.value.some((selectedId) => selectedId === currentUserId);
    if (containsCurrentUser) {
      message.error("不能删除当前登录用户");
      return;
    }
  }

  confirm("确认删除选中的用户吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => deleteUsers(userIds),
    () => undefined
  );
}

onMounted(() => {
  handleQuery();
});
</script>
