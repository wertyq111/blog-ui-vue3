<!-- 用户管理 -->
<template>
  <div class="develop-page admin-workspace-page">
    <el-card shadow="never" class="develop-shell admin-workspace-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">USER MANAGEMENT</div>
          <h1 class="develop-hero__title">用户管理</h1>
          <p class="develop-hero__desc">管理系统用户账号、角色分配与状态控制</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto" class="develop-form">
          <el-form-item label="用户名" prop="filter[username]">
            <el-input
              v-model="queryParams['filter[username]']"
              placeholder="用户名"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>

          <el-form-item label="手机号" prop="filter[phone]">
            <el-input
              v-model="queryParams['filter[phone]']"
              placeholder="手机号"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>

          <el-form-item label="状态" prop="filter[status]">
            <el-select
              v-model="queryParams['filter[status]']"
              placeholder="全部"
              clearable
              style="width: 100px"
            >
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>

          <el-form-item class="search-buttons">
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="develop-table-shell">
        <div class="develop-table-shell__header">
          <div>
            <div class="develop-table-shell__title">用户数据列表</div>
            <div class="develop-table-shell__desc">包含系统所有管理员与操作员账号，支持按用户名、手机号筛选。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button
              v-hasPerm="['sys:user:add']"
              type="success"
              icon="plus"
              @click="handleCreateClick"
            >
              新增用户
            </el-button>
            <el-button
              v-hasPerm="'sys:user:delete'"
              type="danger"
              icon="delete"
              :disabled="!hasSelection"
              @click="handleDelete()"
            >
              批量删除
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="userList"
          border
          stripe
          highlight-current-row
          class="develop-table"
          row-key="id"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="用户名" prop="username" />
          <el-table-column label="昵称" width="200" align="center" prop="member.nickname" />
          <el-table-column label="性别" width="100" align="center">
            <template #default="scope">
              <template v-if="scope.row.member">
                <span v-if="scope.row.member.gender === 1">男</span>
                <span v-else-if="scope.row.member.gender === 2">女</span>
                <span v-else>未知</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="角色" align="center" prop="roleNames" min-width="160" />
          <el-table-column label="手机号码" align="center" prop="phone" width="120" />
          <el-table-column label="邮箱" align="center" prop="email" width="160" />
          <el-table-column label="状态" align="center" prop="status" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === CommonStatus.ENABLED ? 'success' : 'info'">
                {{ scope.row.status === CommonStatus.ENABLED ? "正常" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createdAt" width="180" />
          <el-table-column label="操作" fixed="right" width="220">
            <template #default="scope">
              <el-button
                v-hasPerm="'sys:user:resetPwd'"
                type="primary"
                icon="RefreshLeft"
                size="small"
                link
                @click="handleResetPassword(scope.row)"
              >
                重置密码
              </el-button>
              <el-button
                v-hasPerm="'sys:user:edit'"
                type="primary"
                icon="edit"
                link
                size="small"
                @click="handleEditClick(scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-hasPerm="'sys:user:delete'"
                type="danger"
                icon="delete"
                link
                size="small"
                @click="handleDelete(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-if="total > 0"
          v-model:total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="fetchList"
        />
      </div>
    </el-card>

    <!-- 用户表单 -->
    <el-drawer
      v-model="dialogState.visible"
      :title="dialogState.title"
      append-to-body
      :size="drawerSize"
      class="develop-drawer"
      @close="closeDialog"
    >
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item v-if="!formData.id" label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="formData.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            inline-prompt
            active-text="正常"
            inactive-text="禁用"
            :active-value="CommonStatus.ENABLED"
            :inactive-value="CommonStatus.DISABLED"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import type { UserForm, UserQueryParams, UserItem } from "@/types/api";
import UserAPI from "@/api/system/user";
import RoleAPI from "@/api/system/role";
import { useUserStore, useAppStore } from "@/store";
import { DeviceEnum, DialogMode, CommonStatus } from "@/enums";
import { useTableSelection } from "@/composables";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

const appStore = useAppStore();
const userStore = useUserStore();

// 表单引用
const queryFormRef = ref<FormInstance>();
const userFormRef = ref<FormInstance>();

// 查询参数
const queryParams = reactive<UserQueryParams>({
  pageNum: 1,
  pageSize: 10,
  "filter[username]": "",
  "filter[phone]": "",
  "filter[status]": undefined,
});

// 列表数据
const userList = ref<UserItem[]>([]);
const total = ref(0);
const loading = ref(false);

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

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur", min: 6 }],
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

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<UserItem>();

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
  queryFormRef.value?.resetFields();
  queryParams["filter[username]"] = "";
  queryParams["filter[phone]"] = "";
  queryParams["filter[status]"] = undefined;
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
      await UserAPI.update(formData.id, formData);
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
  const userIds = id ?? selectedIds.value.join(",");
  if (!userIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  // 安全检查：防止删除当前登录用户
  const currentUserId = userStore.userInfo?.userId;
  if (currentUserId) {
    const isCurrentUserInList = id
      ? id === currentUserId
      : selectedIds.value.some((selectedId) => String(selectedId) === currentUserId);
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

<style scoped lang="scss"></style>
