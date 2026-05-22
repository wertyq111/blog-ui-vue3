<!-- 会员管理 -->
<template>
  <div class="page-card">
    <div class="page-head">
      <div class="page-eyebrow">MEMBER MANAGEMENT</div>
      <h1 class="page-title">会员管理</h1>
      <p class="page-desc">管理注册会员的资料、等级与账户状态，统一维护会员体系。</p>
    </div>

    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">昵称：</label>
        <Input
          v-model="queryParams.nickname"
          class="filter-input"
          placeholder="请输入昵称"
          allow-clear
          @keyup.enter="handleQuery"
        />
      </div>
      <div class="filter-field">
        <label class="filter-label">手机号：</label>
        <Input
          v-model="queryParams.phone"
          class="filter-input"
          placeholder="请输入手机号"
          allow-clear
          @keyup.enter="handleQuery"
        />
      </div>
      <div class="filter-field">
        <label class="filter-label">会员等级：</label>
        <Select
          v-model="levelModel"
          class="filter-select"
          placeholder="全部"
          :options="levelFilterOptions"
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
          <div class="list-title">会员列表</div>
          <div class="list-sub">所有注册会员的基础信息与账户状态。</div>
        </div>
      </div>

      <div class="toolbar">
        <Button v-hasPerm="'sys:member:add'" type="primary" size="small" @click="handleCreateClick">
          <SystemIco name="plus" :size="13" />
          添加
        </Button>
        <Button
          v-hasPerm="'sys:member:delete'"
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
              <th style="width: 80px">头像</th>
              <th>昵称</th>
              <th>真实姓名</th>
              <th style="width: 80px">性别</th>
              <th>会员等级</th>
              <th style="width: 90px">状态</th>
              <th style="width: 110px">设备</th>
              <th style="width: 90px">登录次数</th>
              <th>创建时间</th>
              <th style="width: 150px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in memberList" :key="row.id">
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
              <td>
                <img
                  class="member-avatar"
                  :src="resolveAvatar(row.avatar, row.gender)"
                  :alt="row.nickname"
                />
              </td>
              <td>{{ row.nickname }}</td>
              <td>{{ row.realname || "-" }}</td>
              <td>{{ genderText(row.gender) }}</td>
              <td>
                <AnimalTag type="primary">{{ getLevelName(row.memberLevel) }}</AnimalTag>
              </td>
              <td>
                <Switch
                  v-hasPerm="'sys:member:status'"
                  :model-value="row.status === 1"
                  size="small"
                  :loading="statusLoadingId === row.id"
                  @update:model-value="(val: boolean) => handleStatusToggle(row, val)"
                />
              </td>
              <td class="cell-mono">{{ row.device || "-" }}</td>
              <td class="cell-num">{{ row.loginCount ?? 0 }}</td>
              <td class="cell-mono">{{ row.createTime }}</td>
              <td>
                <span class="tbl-actions">
                  <span
                    v-hasPerm="'sys:member:edit'"
                    class="action-link act-edit"
                    @click="handleEditClick(row)"
                  >
                    <SystemIco name="edit" :size="12" />
                    修改
                  </span>
                  <span
                    v-hasPerm="'sys:member:delete'"
                    class="action-link act-del"
                    @click="handleDelete(row.id)"
                  >
                    <SystemIco name="trash" :size="12" />
                    删除
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && memberList.length === 0" class="empty-row">
              <td colspan="12">暂无数据</td>
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

    <MemberEdit v-model:visible="editVisible" :data="editingMember" @done="handleQuery" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Button, Input, Select, Switch } from "animal-island-vue";
import MemberAPI from "@/api/member/member";
import MemberLevelAPI from "@/api/member/member-level";
import type { MemberItem, MemberQueryParams } from "@/types/api";
import MemberEdit from "./member-edit.vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import AnimalTag from "@/components/AnimalTag/index.vue";
import { useTableSelection } from "@/composables/useTableSelection";
import { resolveAvatar } from "@/utils/avatar";

defineOptions({
  name: "Member",
  inheritAttrs: false,
});

const queryParams = reactive<MemberQueryParams>({
  pageNum: 1,
  pageSize: 10,
  nickname: "",
  phone: "",
  status: undefined,
  memberLevel: undefined,
});

const memberList = ref<MemberItem[]>([]);
const total = ref(0);
const loading = ref(false);
const editVisible = ref(false);
const editingMember = ref<MemberItem | null>(null);
const levelOptions = ref<Array<{ label: string; value: number }>>([]);
const statusLoadingId = ref<number | null>(null);

const statusOptions = [
  { key: "", label: "全部" },
  { key: "1", label: "正常" },
  { key: "0", label: "禁用" },
];

const levelFilterOptions = computed(() => [
  { key: "", label: "全部" },
  ...levelOptions.value.map((item) => ({ key: String(item.value), label: item.label })),
]);

const statusModel = computed<string>({
  get: () => (queryParams.status == null ? "" : String(queryParams.status)),
  set: (value) => {
    queryParams.status = value === "" ? undefined : Number(value);
  },
});

const levelModel = computed<string>({
  get: () => (queryParams.memberLevel == null ? "" : String(queryParams.memberLevel)),
  set: (value) => {
    queryParams.memberLevel = value === "" ? undefined : Number(value);
  },
});

const { checkedIds, allChecked, hasSelection, isChecked, toggleRow, toggleAll, clearSelection } =
  useTableSelection(memberList, (row) => row.id);

function genderText(gender?: number): string {
  if (gender === 1) return "男";
  if (gender === 2) return "女";
  return "保密";
}

function getLevelName(levelId?: number): string {
  const level = levelOptions.value.find((item) => item.value === levelId);
  return level ? level.label : "未分级";
}

async function fetchLevelOptions(): Promise<void> {
  levelOptions.value = await MemberLevelAPI.getOptions();
}

async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await MemberAPI.getPage(queryParams);
    memberList.value = data.list;
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
  queryParams.nickname = "";
  queryParams.phone = "";
  queryParams.status = undefined;
  queryParams.memberLevel = undefined;
  handleQuery();
}

async function handleStatusToggle(row: MemberItem, val: boolean): Promise<void> {
  const next = val ? 1 : 0;
  statusLoadingId.value = row.id;
  try {
    await MemberAPI.updateStatus(row.id, next);
    row.status = next;
    ElMessage.success(next === 1 ? "已启用" : "已禁用");
  } finally {
    statusLoadingId.value = null;
  }
}

function handleCreateClick(): void {
  editingMember.value = null;
  editVisible.value = true;
}

function handleEditClick(row: MemberItem): void {
  editingMember.value = row;
  editVisible.value = true;
}

function handleDelete(id?: number): void {
  const ids = id ? [id] : checkedIds.value.map(Number);
  if (!ids.length) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除选中的会员吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      const request = ids.length === 1 ? MemberAPI.deleteById(ids[0]) : MemberAPI.deleteByIds(ids);
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
  fetchLevelOptions();
  handleQuery();
});
</script>

<style lang="scss" scoped>
.member-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  vertical-align: middle;
  background: #fff;
  border: 1.5px solid var(--ai-border, #e8e2d6);
}
</style>
