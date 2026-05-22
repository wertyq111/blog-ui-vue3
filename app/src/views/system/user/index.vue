<!-- 用户管理 -->
<template>
  <div class="page-card">
    <!-- 页头 -->
    <div class="page-head">
      <div class="page-eyebrow">SYSTEM MANAGEMENT</div>
      <h1 class="page-title">用户管理</h1>
      <p class="page-desc">维护后台账号、角色分配与启用状态，统一系统用户信息。</p>
    </div>

    <!-- 搜索栏 -->
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
        <Ico name="search" :size="13" />
        查询
      </Button>
      <Button type="default" size="small" @click="handleResetQuery">重置</Button>
    </div>

    <!-- 列表卡片 -->
    <div class="list-card">
      <div class="list-head">
        <div>
          <div class="list-title">用户列表</div>
          <div class="list-sub">支持按账号、性别和角色快速筛选。</div>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <Button v-hasPerm="['sys:user:add']" type="primary" size="small" @click="handleCreateClick">
          <Ico name="plus" :size="13" />
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
          <Ico name="trash" :size="13" />
          删除
        </Button>
        <div class="toolbar-spacer" />
        <div class="tool-group">
          <Button class="btn-icon" type="default" size="small" title="刷新" @click="fetchList">
            <Ico name="refresh" :size="14" />
          </Button>
          <Button class="btn-icon" type="default" size="small" title="密度">
            <Ico name="density" :size="14" />
          </Button>
          <Button class="btn-icon" type="default" size="small" title="列设置">
            <Ico name="settings" :size="14" />
          </Button>
          <Button class="btn-icon" type="default" size="small" title="全屏">
            <Ico name="full" :size="14" />
          </Button>
        </div>
      </div>

      <!-- 表格 -->
      <div v-loading="loading" class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width: 44px">
                <span class="cbx" :class="{ 'is-checked': allChecked }" @click="toggleAll">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
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
            <tr v-for="r in userList" :key="r.id">
              <td>
                <span
                  class="cbx"
                  :class="{ 'is-checked': isChecked(r.id) }"
                  @click="toggleRow(r.id)"
                >
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M2.5 6.5l2.5 2.5 5-6" />
                  </svg>
                </span>
              </td>
              <td class="cell-num">{{ r.id }}</td>
              <td>{{ r.username }}</td>
              <td class="cell-mono">{{ r.phone || "" }}</td>
              <td>
                <span v-if="r.roleNames" class="pill pill-role">{{ r.roleNames }}</span>
                <span v-else class="cell-empty">—</span>
              </td>
              <td>
                <span
                  class="swt"
                  :class="{ 'is-on': r.status === CommonStatus.ENABLED }"
                  :aria-label="r.status === CommonStatus.ENABLED ? '正常' : '禁用'"
                />
              </td>
              <td class="cell-mono">{{ formatDateTime(r.createTime) }}</td>
              <td class="cell-mono">{{ formatDateTime(r.updateTime) }}</td>
              <td>
                <span class="tbl-actions">
                  <span
                    v-hasPerm="'sys:user:edit'"
                    class="action-link act-edit"
                    @click="handleEditClick(r.id)"
                  >
                    <Ico name="edit" :size="12" />
                    修改
                  </span>
                  <span
                    v-hasPerm="'sys:user:delete'"
                    class="action-link act-del"
                    @click="handleDelete(r.id)"
                  >
                    <Ico name="trash" :size="12" />
                    删除
                  </span>
                  <span
                    v-hasPerm="'sys:user:resetPwd'"
                    class="action-link act-reset"
                    @click="handleResetPassword(r)"
                  >
                    <Ico name="key" :size="12" />
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

    <!-- 用户表单 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="680px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form
        ref="userFormRef"
        :model="formData"
        :rules="rules"
        label-width="82px"
        class="develop-dialog-form"
      >
        <div class="field-desc">维护后台账号、角色和状态，保证访问权限一致。</div>
        <el-row :gutter="15">
          <el-col :sm="12">
            <el-form-item label="邮箱" prop="email">
              <Input
                v-model="formData.email"
                placeholder="请输入邮箱"
                :maxlength="100"
                allow-clear
              />
            </el-form-item>
            <el-form-item label="用户账号" prop="username">
              <Input
                v-model="formData.username"
                :readonly="!!formData.id"
                placeholder="请输入用户账号"
                :maxlength="20"
                allow-clear
              />
            </el-form-item>
            <el-form-item label="登录密码" prop="password">
              <Input
                v-model="formData.password"
                type="password"
                placeholder="请输入登录密码"
                :maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :sm="12">
            <el-form-item label="手机号" prop="phone">
              <Input
                v-model="formData.phone"
                placeholder="请输入手机号"
                :maxlength="11"
                allow-clear
              />
            </el-form-item>
            <el-form-item label="角色" prop="roleIds">
              <AnimalMultiSelect
                v-model="roleIdsModel"
                :options="roleSelectOptions"
                placeholder="请选择角色"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <Switch v-model="statusOn">
                <template #checked>正常</template>
                <template #unchecked>禁用</template>
              </Switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="develop-dialog-footer">
          <Button type="default" @click="closeDialog">取消</Button>
          <Button type="primary" @click="handleSubmit">保存</Button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import type { UserForm, UserQueryParams, UserItem } from "@/types/api";
import UserAPI from "@/api/system/user";
import { Button, Input, Select, Switch } from "animal-island-vue";
import AnimalMultiSelect from "@/components/AnimalMultiSelect/index.vue";
import { useUserStore } from "@/store";
import { DialogMode, CommonStatus } from "@/enums";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

// 线性图标（还原设计稿 Ico）
const ICO_PATHS: Record<string, string> = {
  search: '<circle cx="10" cy="10" r="6"/><path d="M14 14l4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
  refresh:
    '<path d="M4 12a8 8 0 0114-5l3 3M20 12a8 8 0 01-14 5l-3-3"/><path d="M17 4v4h-4M7 20v-4h4"/>',
  full: '<path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/>',
  edit: '<path d="M4 16L15 5l3 3-11 11H4v-3z"/>',
  key: '<circle cx="8" cy="15" r="3"/><path d="M11 15l9-9-2-2-2 2-2-2-2 2"/>',
  density: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.4a7 7 0 000-2.8l2-1.6-2-3.4-2.4 1a7 7 0 00-2.4-1.4L14.2 2.5h-4l-.4 2.7a7 7 0 00-2.4 1.4l-2.4-1-2 3.4 2 1.6a7 7 0 000 2.8l-2 1.6 2 3.4 2.4-1a7 7 0 002.4 1.4l.4 2.7h4l.4-2.7a7 7 0 002.4-1.4l2.4 1 2-3.4z"/>',
};

const Ico = defineComponent({
  name: "Ico",
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 14 },
  },
  setup(props) {
    return () =>
      h("svg", {
        viewBox: "0 0 24 24",
        width: props.size,
        height: props.size,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 1.8,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        innerHTML: ICO_PATHS[props.name] || "",
      });
  },
});

const userStore = useUserStore();

const userFormRef = ref<FormInstance>();

// 查询参数
const queryParams = reactive<UserQueryParams>({
  pageNum: 1,
  pageSize: 10,
  "filter[username]": "",
  "filter[phone]": "",
  "filter[gender]": undefined,
  "filter[status]": undefined,
});

// 性别筛选（动森 Select 仅接受字符串，做一层 string↔number 转换；"" 表示全部）
const genderOptions = [
  { key: "", label: "全部" },
  { key: "1", label: "男" },
  { key: "2", label: "女" },
  { key: "3", label: "未知" },
];
const genderModel = computed<string>({
  get: () => (queryParams["filter[gender]"] == null ? "" : String(queryParams["filter[gender]"])),
  set: (v) => {
    queryParams["filter[gender]"] = v === "" ? undefined : Number(v);
  },
});

// 列表数据
const userList = ref<UserItem[]>([]);
const total = ref(0);
const loading = ref(false);

// 选择状态
const checkedIds = ref<string[]>([]);
const allChecked = computed(
  () => userList.value.length > 0 && userList.value.every((u) => checkedIds.value.includes(u.id))
);
const hasSelection = computed(() => checkedIds.value.length > 0);

function isChecked(id: string): boolean {
  return checkedIds.value.includes(id);
}
function toggleRow(id: string): void {
  const idx = checkedIds.value.indexOf(id);
  if (idx >= 0) checkedIds.value.splice(idx, 1);
  else checkedIds.value.push(id);
}
function toggleAll(): void {
  checkedIds.value = allChecked.value ? [] : userList.value.map((u) => u.id);
}

// 弹窗状态
const dialogState = reactive({
  visible: false,
  title: "新增用户",
  mode: DialogMode.CREATE,
});

// 表单初始数据
const initialFormData: UserForm = {
  status: CommonStatus.ENABLED,
  roleIds: [],
};

// 表单数据
const formData = reactive<UserForm>({ ...initialFormData });

// 下拉选项
const roleOptions = ref<any[]>();

// 动森多选适配：选项 {key,label}；值在 string[](组件) 与 number[](表单) 间转换
const roleSelectOptions = computed(() =>
  (roleOptions.value ?? []).map((item) => ({ key: String(item.value), label: item.label }))
);
const roleIdsModel = computed<string[]>({
  get: () => (formData.roleIds ?? []).map((id) => String(id)),
  set: (keys) => {
    formData.roleIds = keys.map((k) => Number(k));
  },
});

// 动森 Switch 用布尔，状态做布尔↔枚举转换
const statusOn = computed<boolean>({
  get: () => formData.status === CommonStatus.ENABLED,
  set: (v) => {
    formData.status = v ? CommonStatus.ENABLED : CommonStatus.DISABLED;
  },
});

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户账号", trigger: "blur" }],
  password: [
    {
      trigger: "blur",
      validator: (_rule, value, callback) => {
        if (!formData.id && !value) return callback(new Error("请输入登录密码"));
        if (value && value.length < 6) return callback(new Error("密码至少 6 位"));
        callback();
      },
    },
  ],
  roleIds: [{ required: true, message: "请选择用户角色", trigger: "change" }],
  email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }],
};

/**
 * 加载用户列表数据
 */
async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await UserAPI.getPage(queryParams);
    userList.value = data.list.map((user) => ({
      ...user,
      roleNames: user.roles?.map((r) => r.name).join(","),
    }));
    total.value = data.total ?? 0;
    checkedIds.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 加载表单下拉选项数据
 */
async function loadFormOptions(): Promise<void> {
  const options = await UserAPI.getOptions();
  roleOptions.value = options.map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
}

/**
 * 执行查询（重置页码）
 */
function handleQuery(): void {
  queryParams.pageNum = 1;
  fetchList();
}

/**
 * 重置查询条件
 */
function resetQuery(): void {
  queryParams["filter[username]"] = "";
  queryParams["filter[phone]"] = "";
  queryParams["filter[gender]"] = undefined;
  queryParams["filter[status]"] = undefined;
}

function formatDateTime(value?: string): string {
  if (!value) return "—";

  return value
    .replace("T", " ")
    .replace(/\.\d+Z$/, "")
    .slice(0, 19);
}

/**
 * 重置查询条件并重新查询
 */
function handleResetQuery(): void {
  resetQuery();
  handleQuery();
}

/**
 * 重置用户密码
 * @param userId 用户ID
 */
async function resetPassword(userId: string): Promise<void> {
  await UserAPI.resetPassword(userId);
  ElMessage.success("密码重置成功，新密码为 123456");
}

/**
 * 删除用户
 * @param userIds 用户ID列表，多个ID用逗号分隔
 */
async function deleteUsers(userIds: string): Promise<void> {
  const ids = userIds.split(",");
  for (const id of ids) {
    await UserAPI.deleteById(id);
  }
  ElMessage.success("删除成功");
  handleQuery();
}

/**
 * 打开表单弹窗
 */
function openDialog(): void {
  dialogState.visible = true;
}

/**
 * 关闭表单弹窗
 */
function closeDialog(): void {
  dialogState.visible = false;
  resetForm();
}

/**
 * 重置表单数据和验证状态
 */
function resetForm(): void {
  userFormRef.value?.resetFields();
  userFormRef.value?.clearValidate();
  Object.assign(formData, initialFormData);
}

/**
 * 重置密码按钮点击事件
 * @param row 用户数据
 */
function handleResetPassword(row: UserItem): void {
  ElMessageBox.confirm(`确认重置用户【${row.username}】的密码吗？`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => resetPassword(row.id),
    () => {
      /* 用户取消 */
    }
  );
}

/**
 * 新增按钮点击事件
 */
async function handleCreateClick(): Promise<void> {
  dialogState.title = "新增用户";
  dialogState.mode = DialogMode.CREATE;
  await loadFormOptions();
  openDialog();
}

/**
 * 编辑按钮点击事件
 * @param id 用户ID
 */
async function handleEditClick(id: string): Promise<void> {
  dialogState.title = "修改用户";
  dialogState.mode = DialogMode.EDIT;
  await loadFormOptions();
  const data = await UserAPI.getFormData(id);
  Object.assign(formData, {
    ...data,
    roleIds: data.roleIds ?? [],
  });
  openDialog();
}

/**
 * 提交表单（防抖处理）
 */
const handleSubmit = useDebounceFn(async () => {
  const valid = await userFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      const payload: UserForm = { ...formData };
      if (!payload.password) delete payload.password;
      await UserAPI.update(formData.id, payload);
      ElMessage.success("修改用户成功");
    } else {
      await UserAPI.create(formData);
      ElMessage.success("新增用户成功");
    }
    closeDialog();
    handleQuery();
  } finally {
    loading.value = false;
  }
}, 300);

/**
 * 删除按钮点击事件
 * @param id 用户ID，不传则删除选中的用户
 */
function handleDelete(id?: string): void {
  const userIds = id ?? checkedIds.value.join(",");
  if (!userIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  // 安全检查：防止删除当前登录用户
  const currentUserId = userStore.userInfo?.userId;
  if (currentUserId) {
    const isCurrentUserInList = id
      ? id === currentUserId
      : checkedIds.value.some((selectedId) => String(selectedId) === currentUserId);
    if (isCurrentUserInList) {
      ElMessage.error("不能删除当前登录用户");
      return;
    }
  }

  ElMessageBox.confirm("确认删除选中的用户吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => deleteUsers(userIds),
    () => {
      /* 用户取消 */
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>

<style scoped lang="scss">
@import url("https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800;900&family=Mochiy+Pop+One&display=swap");

.page-card {
  --ai-primary: #19c8b9;
  --ai-primary-active: #11a89b;
  --ai-text: #794f27;
  --ai-text-2: #9f927d;
  --ai-text-3: #c4b89e;
  --ai-border: #e8e2d6;
  --ai-shadow-color: #bdaea0;
  --ai-leaf: #7cba70;
  --ai-leaf-d: #4a8a36;
  --ai-leaf-l: #d8ecc6;
  --ai-red: #fc736d;
  --ai-info: #5b9eee;
  --ai-success: #6fba2c;

  position: relative;
  font-family:
    "M PLUS Rounded 1c", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: var(--ai-text);
  font-size: 13px;
  line-height: 1.6;
  background:
    radial-gradient(600px 320px at 90% -10%, rgba(216, 236, 198, 0.8) 0%, transparent 60%),
    radial-gradient(400px 240px at 5% 100%, rgba(247, 220, 130, 0.3) 0%, transparent 60%),
    linear-gradient(180deg, rgba(248, 250, 230, 0.78) 0%, rgba(232, 244, 210, 0.78) 100%);
  border: 2px solid var(--ai-border);
  border-radius: 36px 44px 32px 40px / 38px 32px 44px 36px;
  padding: 24px 28px;
  box-shadow:
    0 4px 0 0 rgba(74, 138, 54, 0.06),
    0 12px 32px rgba(110, 80, 40, 0.06);
  overflow: hidden;
}
.page-card::before {
  content: "";
  position: absolute;
  top: -20px;
  right: -30px;
  width: 200px;
  height: 200px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 90c0-40 30-80 80-80 0 50-40 80-80 80z" fill="%237cba70" opacity="0.18"/><path d="M14 88c4-30 24-58 60-72" stroke="%234a8a36" stroke-width="1.5" fill="none" opacity="0.4"/></svg>')
    no-repeat;
  background-size: contain;
  pointer-events: none;
}
.page-card::after {
  content: "";
  position: absolute;
  bottom: -30px;
  left: -30px;
  width: 160px;
  height: 160px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M90 10c0 40-30 80-80 80 0-50 40-80 80-80z" fill="%23d1da49" opacity="0.22"/><path d="M86 14c-4 30-24 58-60 72" stroke="%23a3ad28" stroke-width="1.5" fill="none" opacity="0.4"/></svg>')
    no-repeat;
  background-size: contain;
  pointer-events: none;
}

* {
  box-sizing: border-box;
}

/* 页头 */
.page-head {
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}
.page-eyebrow {
  font-size: 11px;
  letter-spacing: 4px;
  font-weight: 800;
  color: var(--ai-leaf-d);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.page-eyebrow::before {
  content: "";
  width: 22px;
  height: 2px;
  background: var(--ai-leaf-d);
  border-radius: 2px;
}
.page-title {
  font-family: "Mochiy Pop One", "M PLUS Rounded 1c", sans-serif;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.01em;
  margin: 4px 0 6px;
  color: var(--ai-text);
}
.page-desc {
  margin: 0;
  font-size: 13px;
  color: var(--ai-text-2);
  font-weight: 500;
}

/* 搜索栏 */
.filter-bar {
  position: relative;
  z-index: 30;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.5) 0 12px,
    rgba(255, 255, 255, 0.4) 12px 24px
  );
  border: 2px dashed rgba(74, 138, 54, 0.2);
  border-radius: 22px;
  padding: 16px 22px;
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
}
.filter-bar::before {
  content: "🌾";
  position: absolute;
  left: -14px;
  top: -14px;
  width: 28px;
  height: 28px;
  background: var(--ai-leaf-l);
  border: 2px solid var(--ai-leaf-d);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  box-shadow: 0 2px 0 0 var(--ai-leaf-d);
}
.filter-field {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text);
  white-space: nowrap;
}
.filter-input {
  width: 240px;
}

/* 性别选择器：动森 Select，撑满筛选位宽度 */
.filter-select {
  width: 240px;
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
  font-weight: 800;
  font-size: 13px;
  padding: 0 16px;
  height: 36px;
  border-radius: 999px;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition:
    transform 0.16s,
    box-shadow 0.16s,
    background 0.16s,
    color 0.16s;
}
.btn-primary {
  background: linear-gradient(180deg, #84cf4f 0%, #6fba2c 100%);
  color: #fff;
  border-color: #6fba2c;
  box-shadow: 0 3px 0 0 #5a9e1e;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 0 0 #5a9e1e;
}
.btn-primary:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 0 #5a9e1e;
}
.btn-default {
  background: rgba(255, 255, 255, 0.85);
  color: var(--ai-text);
  border-color: var(--ai-border);
}
.btn-default:hover {
  background: #fff;
  border-color: var(--ai-primary);
  color: var(--ai-primary-active);
}
.btn-danger {
  background: rgba(255, 230, 230, 0.7);
  color: var(--ai-red);
  border-color: rgba(252, 115, 109, 0.4);
}
.btn-danger:hover {
  background: rgba(252, 115, 109, 0.15);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  border: 1.5px solid var(--ai-border);
  color: var(--ai-text-2);
  cursor: pointer;
  transition: all 0.18s;
}
.btn-icon:hover {
  background: #fff;
  color: var(--ai-leaf-d);
  border-color: var(--ai-leaf);
}

/* 列表卡片 */
.list-card {
  position: relative;
  z-index: 2;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 2px solid var(--ai-border);
  border-radius: 24px;
  padding: 20px 22px;
  box-shadow: 0 3px 0 0 rgba(74, 138, 54, 0.05);
}
.list-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 4px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(124, 186, 112, 0.4) 30%,
    rgba(124, 186, 112, 0.4) 70%,
    transparent
  );
  border-radius: 0 0 6px 6px;
}
.list-head {
  margin-bottom: 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.list-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--ai-text);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.list-title::before {
  content: "📜";
  font-size: 16px;
}
.list-sub {
  font-size: 12px;
  color: var(--ai-text-2);
  margin-top: 3px;
  font-weight: 600;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px;
  background: rgba(248, 250, 230, 0.7);
  border-radius: 14px;
}
.toolbar-spacer {
  flex: 1;
}
.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 表格 */
.tbl-wrap {
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid var(--ai-border);
  background: #fff;
}
.tbl {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  color: var(--ai-text);
}
.tbl th,
.tbl td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--ai-border);
  text-align: center;
  vertical-align: middle;
}
.tbl th {
  background: linear-gradient(180deg, rgba(216, 236, 198, 0.45) 0%, rgba(232, 244, 210, 0.45) 100%);
  font-weight: 800;
  color: var(--ai-text);
  font-size: 13px;
  white-space: nowrap;
}
.tbl tbody tr:hover {
  background: rgba(216, 236, 198, 0.18);
}
.tbl tbody tr:last-child td {
  border-bottom: 0;
}
.cell-num {
  font-family: "Mochiy Pop One", sans-serif;
}
.cell-mono {
  font-family: "Mochiy Pop One", sans-serif;
  font-size: 12px;
  color: var(--ai-text-2);
}
.cell-empty {
  color: var(--ai-text-3);
}
.tbl-actions {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
}

/* 复选框 */
.cbx {
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1.8px solid var(--ai-text-3);
  background: #fff;
  display: inline-grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.18s;
  vertical-align: middle;
}
.cbx.is-checked {
  background: var(--ai-leaf);
  border-color: var(--ai-leaf-d);
  color: #fff;
}
.cbx svg {
  width: 10px;
  height: 10px;
  opacity: 0;
}
.cbx.is-checked svg {
  opacity: 1;
}

/* 开关 */
.swt {
  position: relative;
  width: 44px;
  height: 22px;
  border-radius: 999px;
  background: #c4cad1;
  border: 0;
  display: inline-block;
  vertical-align: middle;
  transition: background 0.18s;
}
.swt::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.18s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
}
.swt.is-on {
  background: linear-gradient(135deg, #3aa3e8, #1c79c8);
}
.swt.is-on::after {
  left: 24px;
}

/* 动作链接 */
.action-link {
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.act-edit {
  color: var(--ai-info);
}
.act-del {
  color: var(--ai-red);
}
.act-reset {
  color: var(--ai-success);
}

/* 标签 */
.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1.5px solid;
  white-space: nowrap;
}
.pill-role {
  color: #3a78d4;
  border-color: #b4c8ee;
  background: #e9efff;
}

/* 空状态 */
.empty-row td {
  padding: 36px;
  color: var(--ai-text-3);
  text-align: center;
}

@media (max-width: 1024px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-field {
    flex-direction: column;
    align-items: flex-start;
  }
  .filter-input,
  .select {
    width: 100%;
  }
}
</style>
