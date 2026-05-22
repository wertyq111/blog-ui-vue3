<template>
  <div class="page-card">
    <!-- 页头 -->
    <div class="page-head">
      <div class="page-eyebrow">SYSTEM MANAGEMENT</div>
      <h1 class="page-title">角色管理</h1>
      <p class="page-desc">维护角色标识、授权能力与状态信息，统一后台权限角色体系。</p>
    </div>

    <!-- 搜索栏 -->
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
        <Ico name="search" :size="13" />
        查询
      </Button>
      <Button type="default" size="small" @click="handleResetQuery">重置</Button>
    </div>

    <!-- 列表卡片 -->
    <div class="list-card">
      <div class="list-head">
        <div>
          <div class="list-title">角色列表</div>
          <div class="list-sub">支持批量删除、角色编辑与权限维护。</div>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <Button type="primary" size="small" @click="handleCreateClick">
          <Ico name="plus" :size="13" />
          添加
        </Button>
        <Button
          type="default"
          size="small"
          danger
          :disabled="checkedIds.length === 0"
          @click="handleBatchDelete"
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
              <th style="width: 60px">ID</th>
              <th style="width: 90px">操作</th>
              <th>角色名称</th>
              <th>角色标识</th>
              <th style="width: 130px">
                职级状态
                <span class="sort-ic"><Ico name="chev" :size="10" /></span>
              </th>
              <th style="width: 100px">排序号</th>
              <th>备注</th>
              <th style="width: 220px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in roleList" :key="r.id">
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
              <td>
                <span class="action-link act-edit" @click="handleEditClick(r)">
                  <Ico name="edit" :size="12" />
                  修改
                </span>
              </td>
              <td>{{ r.name }}</td>
              <td class="cell-mono">{{ r.code }}</td>
              <td>
                <span class="swt" :class="{ 'is-on': r.status === 1 }" />
              </td>
              <td class="cell-num">{{ r.sort }}</td>
              <td class="cell-note">{{ r.note || "" }}</td>
              <td>
                <span class="tbl-actions">
                  <span class="action-link act-edit" @click="handleEditClick(r)">
                    <Ico name="edit" :size="12" />
                    修改
                  </span>
                  <span
                    v-hasPerm="'sys:role:permission'"
                    class="action-link act-assign"
                    @click="handleAssignPermClick(r)"
                  >
                    <Ico name="shield" :size="12" />
                    分配权限
                  </span>
                  <span class="action-link act-del" @click="handleDelete(r.id)">
                    <Ico name="trash" :size="12" />
                    删除
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && (!roleList || roleList.length === 0)" class="empty-row">
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

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form
        ref="roleFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="develop-dialog-form"
      >
        <div class="field-desc">维护角色名称、权限编码与启用状态，决定后台权限范围。</div>
        <el-form-item label="角色名称" prop="name">
          <Input v-model="formData.name" placeholder="请输入角色名称" allow-clear />
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <Input v-model="formData.code" placeholder="请输入角色编码" allow-clear />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <Switch v-model="statusOn">
            <template #checked>正常</template>
            <template #unchecked>停用</template>
          </Switch>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <Input v-model="sortModel" type="number" placeholder="请输入排序" />
        </el-form-item>

        <el-form-item label="备注" prop="note">
          <AnimalTextarea
            v-model="formData.note"
            :rows="3"
            :maxlength="200"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="develop-dialog-footer">
          <Button type="primary" @click="handleSubmit">确定</Button>
          <Button type="default" @click="closeDialog">取消</Button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-drawer
      v-model="assignPermDialogVisible"
      :title="'【' + checkedRole.name + '】权限分配'"
      :size="drawerSize"
    >
      <div class="assign-toolbar">
        <Input v-model="permKeywords" allow-clear class="assign-search" placeholder="菜单权限名称">
          <template #prefix>
            <Ico name="search" :size="13" />
          </template>
        </Input>

        <div class="assign-actions">
          <Button type="primary" size="small" @click="togglePermTree">
            <Ico name="chev" :size="12" />
            {{ isExpanded ? "收缩" : "展开" }}
          </Button>
          <label class="linked-switch">
            <span>父子联动</span>
            <Switch
              v-model="parentChildLinked"
              size="small"
              @change="handleParentChildLinkedChange"
            />
          </label>

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
          <Button v-hasPerm="'sys:role:permission'" type="primary" @click="handleAssignPermSubmit">
            确定
          </Button>
          <Button type="default" @click="assignPermDialogVisible = false">取消</Button>
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
import { Button, Input, Switch } from "animal-island-vue";
import AnimalTextarea from "@/components/AnimalTextarea/index.vue";

defineOptions({
  name: "Role",
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
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
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

const appStore = useAppStore();

const roleFormRef = ref();
const permTreeRef = ref();

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<RoleQueryParams>({
  pageNum: 1,
  pageSize: 10,
});

// 角色表格数据
const roleList = ref<RoleItem[]>();
// 菜单权限树
const menuPermOptions = ref<OptionItem[]>([]);

// 选择状态（角色 id 为字符串）
const checkedIds = ref<string[]>([]);
const allChecked = computed(
  () =>
    !!roleList.value?.length &&
    roleList.value.every((r) => r.id != null && checkedIds.value.includes(r.id))
);
function isChecked(id?: string): boolean {
  return id != null && checkedIds.value.includes(id);
}
function toggleRow(id?: string): void {
  if (id == null) return;
  const idx = checkedIds.value.indexOf(id);
  if (idx >= 0) checkedIds.value.splice(idx, 1);
  else checkedIds.value.push(id);
}
function toggleAll(): void {
  checkedIds.value = allChecked.value
    ? []
    : (roleList.value ?? []).map((r) => r.id).filter((id): id is string => id != null);
}

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

const statusOn = computed<boolean>({
  get: () => formData.status === 1,
  set: (v) => {
    formData.status = v ? 1 : 0;
  },
});

const sortModel = computed<string>({
  get: () => (formData.sort == null ? "" : String(formData.sort)),
  set: (v) => {
    formData.sort = v === "" ? undefined : Number(v);
  },
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
    checkedIds.value = [];
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
  queryParams["filter[name]"] = undefined;
}

/**
 * 重置查询条件并重新查询
 */
function handleResetQuery(): void {
  resetQuery();
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
  roleFormRef.value?.resetFields();
  roleFormRef.value?.clearValidate();

  formData.id = undefined;
  formData.name = undefined;
  formData.code = undefined;
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
function handleDelete(roleId?: string): void {
  const roleIds = roleId ? [roleId] : checkedIds.value;
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
          ? RoleAPI.deleteById(roleIds[0])
          : RoleAPI.batchDelete(roleIds.map(Number));
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
      const checkedMenuIds = permList.filter((p) => p.checked).map((p) => p.id);
      checkedMenuIds.forEach((menuId) => permTreeRef.value?.setChecked(menuId, true, false));
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
  z-index: 2;
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

.assign-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.assign-search {
  width: 180px;
}
.assign-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
.linked-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ai-text);
  font-weight: 700;
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
.tbl th .sort-ic {
  color: var(--ai-text-3);
  margin-left: 4px;
  vertical-align: middle;
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
.cell-note {
  color: var(--ai-text-2);
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
.act-assign {
  color: var(--ai-success);
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
  .filter-input {
    width: 100%;
  }
  .assign-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
