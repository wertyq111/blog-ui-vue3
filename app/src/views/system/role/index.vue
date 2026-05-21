<template>
  <div class="develop-page admin-workspace-page">
    <el-card shadow="never" class="develop-shell admin-workspace-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">ROLE MANAGEMENT</div>
          <h1 class="develop-hero__title">角色管理</h1>
          <p class="develop-hero__desc">配置系统角色与权限分配</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
          <el-form-item prop="filter[name]" label="角色名称">
            <el-input
              v-model="queryParams['filter[name]']"
              placeholder="角色名称"
              clearable
              @keyup.enter="handleQuery"
            />
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
            <div class="develop-table-shell__title">角色列表</div>
            <div class="develop-table-shell__desc">管理系统权限角色，可分配菜单访问与操作权限。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button type="success" icon="plus" @click="handleCreateClick()">新增角色</el-button>
            <el-button
              type="danger"
              :disabled="ids.length === 0"
              icon="delete"
              @click="handleBatchDelete()"
            >
              批量删除
            </el-button>
          </div>
        </div>

        <el-table
          ref="dataTableRef"
          v-loading="loading"
          :data="roleList"
          highlight-current-row
          border
          class="develop-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="角色名称" prop="name" min-width="100" />
          <el-table-column label="角色编码" prop="code" width="150" />

          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
              <el-tag v-else type="info">禁用</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="排序" align="center" width="80" prop="sort" />
          <el-table-column label="备注" prop="note" min-width="150" />

          <el-table-column fixed="right" label="操作" width="220">
            <template #default="scope">
              <el-button
                v-hasPerm="'sys:role:permission'"
                type="primary"
                size="small"
                link
                icon="position"
                @click="handleAssignPermClick(scope.row)"
              >
                分配权限
              </el-button>
              <el-button
                type="primary"
                size="small"
                link
                icon="edit"
                @click="handleEditClick(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                link
                icon="delete"
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

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="100px" class="develop-dialog-form">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 100px"
          />
        </el-form-item>

        <el-form-item label="备注" prop="note">
          <el-input v-model="formData.note" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="develop-dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-drawer
      v-model="assignPermDialogVisible"
      :title="'【' + checkedRole.name + '】权限分配'"
      :size="drawerSize"
    >
      <div class="flex-x-between">
        <el-input v-model="permKeywords" clearable class="w-[150px]" placeholder="菜单权限名称">
          <template #prefix>
            <Search />
          </template>
        </el-input>

        <div class="flex-center ml-5">
          <el-button type="primary" size="small" plain @click="togglePermTree">
            <template #icon>
              <Switch />
            </template>
            {{ isExpanded ? "收缩" : "展开" }}
          </el-button>
          <el-checkbox
            v-model="parentChildLinked"
            class="ml-5"
            @change="handleParentChildLinkedChange"
          >
            父子联动
          </el-checkbox>

          <el-tooltip placement="bottom">
            <template #content>
              如果只需勾选菜单权限，不需要勾选子菜单或者按钮权限，请关闭父子联动
            </template>
            <el-icon class="ml-1 color-[--el-color-primary] inline-block cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-tree
        ref="permTreeRef"
        node-key="value"
        show-checkbox
        :data="menuPermOptions"
        :filter-node-method="handlePermFilter"
        :default-expand-all="true"
        :check-strictly="!parentChildLinked"
        class="mt-5"
      >
        <template #default="{ data }">
          {{ data.label }}
        </template>
      </el-tree>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-hasPerm="'sys:role:permission'" type="primary" @click="handleAssignPermSubmit">
            确定
          </el-button>
          <el-button @click="assignPermDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app";
import { DeviceEnum } from "@/enums/settings";

import RoleAPI from "@/api/system/role";
import type { RoleItem, RoleForm, RoleQueryParams, BackendPermissionItem } from "@/types/api";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const appStore = useAppStore();

const queryFormRef = ref();
const roleFormRef = ref();
const permTreeRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<RoleQueryParams>({
  pageNum: 1,
  pageSize: 10,
});

// 角色表格数据
const roleList = ref<RoleItem[]>();
// 菜单权限树
const menuPermOptions = ref<OptionItem[]>([]);

// 弹窗
const dialogState = reactive({
  title: "",
  visible: false,
});

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

// 角色表单
const formData = reactive<RoleForm>({
  sort: 1,
  status: 1,
});

const rules = reactive({
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "blur" }],
});

// 选中的角色
interface CheckedRole {
  id?: string;
  name?: string;
}
const checkedRole = ref<CheckedRole>({});
const assignPermDialogVisible = ref(false);

const permKeywords = ref("");
const isExpanded = ref(true);

const parentChildLinked = ref(true);

/**
 * 将后端平铺权限列表构建为 el-tree 所需的树结构
 */
function buildPermTree(flatList: BackendPermissionItem[]): OptionItem[] {
  const map = new Map<number, OptionItem & { _pid: number }>();
  for (const item of flatList) {
    map.set(item.id, {
      value: item.id,
      label: item.title,
      children: [],
      _pid: item.pid,
    } as any);
  }
  const roots: OptionItem[] = [];
  for (const node of map.values()) {
    const pid = (node as any)._pid;
    if (pid === 0 || !map.has(pid)) {
      roots.push(node);
    } else {
      const parent = map.get(pid)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    }
  }
  return roots;
}

/**
 * 加载角色列表数据
 */
async function fetchList(): Promise<void> {
  loading.value = true;
  try {
    const data = await RoleAPI.getPage(queryParams);
    roleList.value = data.list;
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
}

// 查询（重置页码后获取数据）
function handleQuery(): void {
  queryParams.pageNum = 1;
  fetchList();
}

/**
 * 重置查询条件
 */
function resetQuery(): void {
  queryFormRef.value?.resetFields();
  queryParams["filter[name]"] = undefined;
}

/**
 * 重置查询条件并重新查询
 */
function handleResetQuery(): void {
  resetQuery();
  handleQuery();
}

// 行复选框选中
function handleSelectionChange(selection: any): void {
  ids.value = selection.map((item: any) => item.id);
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
  roleFormRef.value?.resetFields();
  roleFormRef.value?.clearValidate();

  formData.id = undefined;
  formData.sort = 1;
  formData.status = 1;
  formData.note = undefined;
}

/**
 * 新增按钮点击事件
 */
function handleCreateClick(): void {
  dialogState.title = "新增角色";
  openDialog();
}

/**
 * 编辑按钮点击事件（直接使用列表行数据）
 */
function handleEditClick(row: RoleItem): void {
  dialogState.title = "修改角色";
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    sort: row.sort,
    status: row.status,
    note: row.note,
  });
  openDialog();
}

// 提交角色表单
async function handleSubmit(): Promise<void> {
  const valid = await roleFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    const roleId = formData.id;
    if (roleId) {
      await RoleAPI.update(roleId, formData);
      ElMessage.success("修改成功");
    } else {
      await RoleAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

// 删除角色
function handleDelete(roleId?: number): void {
  const roleIds = roleId ? [roleId] : ids.value;
  if (!roleIds.length) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      const promise =
        roleIds.length === 1
          ? RoleAPI.deleteById(String(roleIds[0]))
          : RoleAPI.batchDelete(roleIds);
      promise
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

/**
 * 批量删除按钮点击事件
 */
function handleBatchDelete(): void {
  handleDelete();
}

// 打开分配菜单权限弹窗
async function handleAssignPermClick(row: RoleItem): Promise<void> {
  const roleId = row.id;
  if (roleId) {
    assignPermDialogVisible.value = true;
    loading.value = true;

    checkedRole.value.id = roleId;
    checkedRole.value.name = row.name;

    try {
      // 后端返回所有菜单的平铺列表，已勾选的 checked=true
      const permList = await RoleAPI.getPermissionList(roleId);

      // 构建树结构
      menuPermOptions.value = buildPermTree(permList);

      // 勾选已有权限
      await nextTick();
      const checkedIds = permList.filter((p) => p.checked).map((p) => p.id);
      checkedIds.forEach((menuId) => permTreeRef.value?.setChecked(menuId, true, false));
    } finally {
      loading.value = false;
    }
  }
}

// 分配菜单权限提交
function handleAssignPermSubmit() {
  const roleId = checkedRole.value.id;
  if (roleId) {
    const checkedMenuIds: number[] = permTreeRef
      .value!.getCheckedNodes(false, true)
      .map((node: any) => node.value);

    loading.value = true;
    RoleAPI.savePermissions(roleId, checkedMenuIds)
      .then(() => {
        ElMessage.success("分配权限成功");
        assignPermDialogVisible.value = false;
        handleResetQuery();
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

// 展开/收缩 菜单权限树
function togglePermTree(): void {
  isExpanded.value = !isExpanded.value;
  if (permTreeRef.value) {
    Object.values(permTreeRef.value.store.nodesMap).forEach((node: any) => {
      if (isExpanded.value) {
        node.expand();
      } else {
        node.collapse();
      }
    });
  }
}

// 权限筛选
watch(permKeywords, (val) => {
  permTreeRef.value!.filter(val);
});

function handlePermFilter(
  value: string,
  data: {
    [key: string]: any;
  }
) {
  if (!value) return true;
  return data.label.includes(value);
}

// 父子菜单节点是否联动
function handleParentChildLinkedChange(val: any): void {
  parentChildLinked.value = val;
}

onMounted(() => {
  handleQuery();
});
</script>
