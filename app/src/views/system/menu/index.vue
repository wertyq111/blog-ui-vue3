<template>
  <div class="page-card">
    <!-- 页头 -->
    <div class="page-head">
      <div class="page-eyebrow">SYSTEM MANAGEMENT</div>
      <h1 class="page-title">菜单管理</h1>
      <p class="page-desc">维护菜单层级、路由能力与权限标识，统一后台导航入口。</p>
    </div>

    <!-- 搜索栏 -->
    <div class="filter-bar">
      <div class="filter-field">
        <label class="filter-label">菜单名称：</label>
        <Input
          v-model="queryParams['filter[title]']"
          class="filter-input"
          placeholder="请输入菜单名称"
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
          <div class="list-title">菜单列表</div>
          <div class="list-sub">支持层级查看、展开收起和菜单结构维护。</div>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <Button v-hasPerm="['sys:menu:addz']" type="primary" size="small" @click="openDialog(0)">
          <Ico name="plus" :size="13" />
          添加
        </Button>
        <Button type="default" size="small" @click="expandAll">
          <Ico name="expand" :size="13" />
          展开全部
        </Button>
        <Button type="default" size="small" @click="collapseAll">
          <Ico name="collapse" :size="13" />
          折叠全部
        </Button>
        <div class="toolbar-spacer" />
        <div class="tool-group">
          <Button class="btn-icon" type="default" size="small" title="刷新" @click="fetchData">
            <Ico name="refresh" :size="14" />
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
              <th style="width: 60px">序</th>
              <th class="tbl-name-cell">菜单名称</th>
              <th style="width: 100px">菜单类型</th>
              <th>路由地址</th>
              <th>组件路径</th>
              <th>权限标识</th>
              <th style="width: 110px">排序</th>
              <th style="width: 80px">状态</th>
              <th style="width: 220px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in flatRows" :key="r.id">
              <td class="cell-num">{{ i + 1 }}</td>
              <td class="tbl-name-cell">
                <span class="tree-indent" :style="{ paddingLeft: r.depth * 20 + 'px' }">
                  <button
                    v-if="r.hasChildren"
                    class="tree-caret"
                    :class="{ open: isOpen(r.id) }"
                    type="button"
                    @click="toggle(r.id)"
                  >
                    <Ico name="chevRight" :size="11" />
                  </button>
                  <span v-else class="tree-caret-spacer" />
                  <span class="tree-name">
                    <span v-if="r.type === 0" class="tree-name-ico">
                      <Icon :name="resolveAnimalIcon(r.icon, r.path)" :size="14" />
                    </span>
                    {{ r.title }}
                  </span>
                </span>
              </td>
              <td>
                <span class="pill" :class="r.type === 0 ? 'pill-menu' : 'pill-button'">
                  {{ r.type === 0 ? "菜单" : "按钮" }}
                </span>
              </td>
              <td class="cell-mono">{{ r.path || "" }}</td>
              <td class="cell-mono">{{ r.component || "" }}</td>
              <td class="cell-mono">{{ r.permission || "" }}</td>
              <td class="cell-num">{{ r.sort }}</td>
              <td>
                <span class="pill" :class="r.hide === 0 ? 'pill-status-on' : 'pill-status-off'">
                  {{ r.hide === 0 ? "正常" : "隐藏" }}
                </span>
              </td>
              <td>
                <span class="tbl-actions">
                  <span
                    v-if="r.type === 0"
                    v-hasPerm="['sys:menu:addz']"
                    class="action-link act-add"
                    @click="openDialog(r.id)"
                  >
                    <Ico name="plus" :size="11" />
                    添加
                  </span>
                  <span
                    v-hasPerm="['sys:menu:edit']"
                    class="action-link act-edit"
                    @click="openDialog(undefined, r.id)"
                  >
                    <Ico name="edit" :size="11" />
                    修改
                  </span>
                  <span
                    v-hasPerm="['sys:menu:delete']"
                    class="action-link act-del"
                    @click="handleDelete(r.id)"
                  >
                    <Ico name="trash" :size="11" />
                    删除
                  </span>
                </span>
              </td>
            </tr>
            <tr v-if="!loading && flatRows.length === 0" class="empty-row">
              <td colspan="9">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="750px"
      class="develop-dialog"
      @close="closeDialog"
    >
      <el-form
        ref="menuFormRef"
        :model="formData"
        :rules="rules"
        label-width="92px"
        class="develop-dialog-form"
      >
        <div class="field-desc">配置菜单层级、打开方式和权限节点，决定路由与按钮权限展示。</div>
        <el-row :gutter="15">
          <el-col :sm="12">
            <el-form-item label="上级菜单" prop="pid">
              <AnimalTreeSelect
                v-model="formData.pid"
                :options="menuOptions"
                placeholder="请选择上级菜单"
              />
            </el-form-item>
            <el-form-item label="菜单名称" prop="title">
              <Input v-model="formData.title" placeholder="请输入菜单名称" allow-clear />
            </el-form-item>
          </el-col>
          <el-col :sm="12">
            <el-form-item label="菜单类型" prop="type">
              <Select v-model="typeModel" :options="menuTypeOptions" placeholder="请选择菜单类型" />
            </el-form-item>
            <el-form-item label="打开方式">
              <Select
                v-model="targetModel"
                :options="menuTargetOptions"
                placeholder="请选择打开方式"
                :disabled="formData.type === 1"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider />

        <el-row :gutter="15">
          <el-col :sm="12">
            <el-form-item label="菜单图标">
              <icon-select v-model="formData.icon" :disabled="formData.type === 1" />
            </el-form-item>
            <el-form-item :label="menuTarget === 2 ? '外链地址' : '路由地址'" prop="path">
              <Input
                v-model="formData.path"
                :disabled="formData.type === 1"
                :placeholder="menuTarget === 2 ? '请输入外链地址' : '请输入路由地址'"
                allow-clear
              />
            </el-form-item>
            <el-form-item :label="menuTarget === 1 ? '内链地址' : '组件路径'">
              <Input
                v-model="formData.component"
                :disabled="formData.type === 1 || menuTarget === 2"
                :placeholder="menuTarget === 1 ? '请输入内链地址' : '请输入组件路径'"
                allow-clear
              />
            </el-form-item>
            <el-form-item label="状态">
              <Switch v-model="menuStatusOn">
                <template #checked>正常</template>
                <template #unchecked>停用</template>
              </Switch>
            </el-form-item>
          </el-col>
          <el-col :sm="12">
            <el-form-item label="权限标识">
              <Input
                v-model="formData.permission"
                :disabled="formData.type === 0"
                placeholder="请输入权限标识"
                allow-clear
              />
            </el-form-item>
            <el-form-item label="排序号" prop="sort">
              <Input v-model="sortModel" type="number" placeholder="请输入排序号" />
            </el-form-item>
            <el-form-item label="是否可见">
              <Switch v-model="visibleOn" :disabled="formData.type === 1">
                <template #checked>显示</template>
                <template #unchecked>隐藏</template>
              </Switch>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="formData.type === 0" label="权限节点">
          <AnimalMultiSelect
            v-model="permNodesModel"
            :options="permNodeOptions"
            placeholder="请选择权限节点"
          />
        </el-form-item>

        <el-form-item label="备注">
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
          <Button type="default" @click="closeDialog">取消</Button>
          <Button type="primary" @click="handleSubmit">保存</Button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import MenuAPI from "@/api/system/menu";
import { Button, Icon, Input, Select, Switch } from "animal-island-vue";
import AnimalTreeSelect from "@/components/AnimalTreeSelect/index.vue";
import AnimalMultiSelect from "@/components/AnimalMultiSelect/index.vue";
import AnimalTextarea from "@/components/AnimalTextarea/index.vue";
import { resolveAnimalIcon } from "@/utils/menuAnimalIcon";
import type { MenuQueryParams, MenuForm, MenuItem } from "@/types/api";
import type { FormInstance, FormRules } from "element-plus";

defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

// 线性图标（还原设计稿 Ico）
const ICO_PATHS: Record<string, string> = {
  search: '<circle cx="10" cy="10" r="6"/><path d="M14 14l4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  expand: '<path d="M4 14v6h6M20 10V4h-6M4 4l6 6M20 20l-6-6"/>',
  collapse: '<path d="M9 4v6H3M15 20v-6h6M3 10l6-6M21 14l-6 6"/>',
  refresh:
    '<path d="M4 12a8 8 0 0114-5l3 3M20 12a8 8 0 01-14 5l-3-3"/><path d="M17 4v4h-4M7 20v-4h4"/>',
  full: '<path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/>',
  chevRight: '<path d="M9 6l6 6-6 6"/>',
  edit: '<path d="M4 16L15 5l3 3-11 11H4v-3z"/>',
  trash: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
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

const menuFormRef = ref<FormInstance>();

const queryParams = reactive<MenuQueryParams>({});

const menuTableData = ref<MenuItem[]>([]);
const menuOptions = ref<OptionItem[]>([]);
const loading = ref(false);

// 树形展开状态
const openMap = ref<Record<number, boolean>>({});

interface FlatRow extends MenuItem {
  depth: number;
  hasChildren: boolean;
}

function collectFlat(nodes: MenuItem[], depth: number, out: FlatRow[]): void {
  for (const node of nodes) {
    const kids = node.children && node.children.length ? node.children : null;
    out.push({ ...node, depth, hasChildren: !!kids });
    if (kids && openMap.value[node.id!]) {
      collectFlat(kids, depth + 1, out);
    }
  }
}

const flatRows = computed<FlatRow[]>(() => {
  const out: FlatRow[] = [];
  collectFlat(menuTableData.value, 0, out);
  return out;
});

function collectParentIds(nodes: MenuItem[], acc: number[]): number[] {
  for (const node of nodes) {
    if (node.children && node.children.length) {
      acc.push(node.id!);
      collectParentIds(node.children, acc);
    }
  }
  return acc;
}

function isOpen(id?: number): boolean {
  return id != null && !!openMap.value[id];
}

function toggle(id?: number): void {
  if (id == null) return;
  openMap.value = { ...openMap.value, [id]: !openMap.value[id] };
}

function expandAll(): void {
  const ids = collectParentIds(menuTableData.value, []);
  openMap.value = Object.fromEntries(ids.map((id) => [id, true]));
}

function collapseAll(): void {
  openMap.value = {};
}

const dialogState = reactive({
  title: "新增菜单",
  visible: false,
});

const initialMenuFormData: MenuForm = {
  id: undefined,
  pid: 0,
  hide: 0,
  sort: 1,
  type: 0,
  status: 1,
};
const formData = ref<MenuForm>({ ...initialMenuFormData });

// 打开方式：0 组件 / 1 内链 / 2 外链（提交时映射为 target: _self/_blank）
const menuTarget = ref(0);
// 权限节点（用于自动创建权限子项）
const checkedPermNodes = ref<number[]>([]);
const permNodeList = [
  { key: 1, label: "查询" },
  { key: 5, label: "添加" },
  { key: 10, label: "修改" },
  { key: 15, label: "删除" },
  { key: 20, label: "详情" },
  { key: 25, label: "状态" },
  { key: 30, label: "批量删除" },
  { key: 35, label: "添加子级" },
  { key: 40, label: "全部展开" },
  { key: 45, label: "全部折叠" },
  { key: 50, label: "导出数据" },
  { key: 55, label: "导入数据" },
  { key: 60, label: "分配权限" },
  { key: 65, label: "重置密码" },
];

function isUrl(url?: string): boolean {
  return !!url && (/^https?:\/\//.test(url) || url.startsWith("//"));
}

// 菜单类型切换：按钮类型禁用路由相关项，菜单类型清空权限标识
function onMenuTypeChange(): void {
  if (formData.value.type === 0) {
    formData.value.permission = undefined;
  } else {
    menuTarget.value = 0;
    formData.value.icon = undefined;
    formData.value.path = undefined;
    formData.value.component = undefined;
    formData.value.hide = 1;
  }
}

// 打开方式切换：外链时清空组件路径
function onTargetChange(): void {
  if (menuTarget.value === 2) {
    formData.value.component = undefined;
  }
}

// 动森组件值代理（动森 Select 用字符串、Switch 用布尔、Input 用字符串）
const menuTypeOptions = [
  { key: "0", label: "菜单" },
  { key: "1", label: "按钮" },
];
const menuTargetOptions = [
  { key: "0", label: "组件" },
  { key: "1", label: "内链" },
  { key: "2", label: "外链" },
];
const typeModel = computed<string>({
  get: () => String(formData.value.type ?? 0),
  set: (v) => {
    formData.value.type = Number(v);
    onMenuTypeChange();
  },
});
const targetModel = computed<string>({
  get: () => String(menuTarget.value),
  set: (v) => {
    menuTarget.value = Number(v);
    onTargetChange();
  },
});
const menuStatusOn = computed<boolean>({
  get: () => formData.value.status === 1,
  set: (v) => {
    formData.value.status = v ? 1 : 0;
  },
});
const visibleOn = computed<boolean>({
  get: () => formData.value.hide === 0,
  set: (v) => {
    formData.value.hide = v ? 0 : 1;
  },
});
const sortModel = computed<string>({
  get: () => (formData.value.sort == null ? "" : String(formData.value.sort)),
  set: (v) => {
    formData.value.sort = v === "" ? undefined : Number(v);
  },
});

// 权限节点：动森多选用 {key,label} + string[]，与 checkedPermNodes(number[]) 互转
const permNodeOptions = permNodeList.map((p) => ({ key: String(p.key), label: p.label }));
const permNodesModel = computed<string[]>({
  get: () => checkedPermNodes.value.map((k) => String(k)),
  set: (keys) => {
    checkedPermNodes.value = keys.map((k) => Number(k));
  },
});

const rules: FormRules = {
  pid: [{ required: true, message: "请选择父级菜单", trigger: "blur" }],
  title: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
  hide: [{ required: true, message: "请选择显示状态", trigger: "change" }],
};

function fetchData(): void {
  loading.value = true;
  MenuAPI.getList(queryParams)
    .then((data) => {
      menuTableData.value = data;
      expandAll();
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleQuery(): void {
  fetchData();
}

function handleResetQuery(): void {
  queryParams["filter[title]"] = undefined;
  fetchData();
}

function openDialog(parentId?: number, menuId?: number): void {
  MenuAPI.getOptions(true)
    .then((data) => {
      menuOptions.value = [{ value: 0, label: "顶级菜单", children: data }];
    })
    .then(() => {
      dialogState.visible = true;
      if (menuId) {
        dialogState.title = "编辑菜单";
        MenuAPI.getFormData(menuId).then((data) => {
          formData.value = { ...initialMenuFormData, ...data };
          menuTarget.value = isUrl(data.path) ? 2 : isUrl(data.component) ? 1 : 0;
          checkedPermNodes.value = data.checkedList ?? [];
        });
      } else {
        dialogState.title = "新增菜单";
        formData.value = { ...initialMenuFormData };
        menuTarget.value = 0;
        checkedPermNodes.value = [];
        if (parentId !== undefined) {
          formData.value.pid = parentId;
        }
      }
    });
}

function handleSubmit(): void {
  menuFormRef.value?.validate((isValid) => {
    if (!isValid) return;

    const menuId = formData.value.id;
    if (menuId && formData.value.pid === menuId) {
      ElMessage.error("父级菜单不能为当前菜单");
      return;
    }

    const payload: MenuForm = {
      ...formData.value,
      pid: formData.value.pid || 0,
      target: menuTarget.value === 2 ? "_blank" : "_self",
      checkedList: formData.value.type === 0 ? checkedPermNodes.value : [],
    };

    const action = menuId ? MenuAPI.update(menuId, payload) : MenuAPI.create(payload);
    action.then(() => {
      ElMessage.success(menuId ? "修改成功" : "新增成功");
      closeDialog();
      fetchData();
    });
  });
}

function handleDelete(menuId?: number): void {
  if (!menuId) {
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
      MenuAPI.deleteById(menuId)
        .then(() => {
          ElMessage.success("删除成功");
          fetchData();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

function closeDialog(): void {
  dialogState.visible = false;
  menuFormRef.value?.resetFields();
  menuFormRef.value?.clearValidate();
  formData.value = { ...initialMenuFormData };
  menuTarget.value = 0;
  checkedPermNodes.value = [];
}

onMounted(() => {
  fetchData();
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

  font-family:
    "M PLUS Rounded 1c", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: var(--ai-text);
  font-size: 13px;
  line-height: 1.6;
}

* {
  box-sizing: border-box;
}

/* 页面容器 */
.page-card {
  position: relative;
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
.tbl-name-cell {
  text-align: left;
}
.cell-num {
  font-family: "Mochiy Pop One", sans-serif;
}
.cell-mono {
  font-family: "Mochiy Pop One", sans-serif;
  font-size: 12px;
  color: var(--ai-text-2);
}
.tbl-actions {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
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
.act-add {
  color: var(--ai-info);
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
.pill-menu {
  color: #3a78d4;
  border-color: #b4c8ee;
  background: #e9efff;
}
.pill-button {
  color: #6a7280;
  border-color: #d6d8dd;
  background: #f1f3f5;
}
.pill-status-on {
  color: var(--ai-success);
  border-color: rgba(111, 186, 44, 0.4);
  background: rgba(111, 186, 44, 0.12);
}
.pill-status-on::before {
  content: "•";
  margin-right: 4px;
  font-size: 18px;
  line-height: 0;
}
.pill-status-off {
  color: var(--ai-text-2);
  border-color: var(--ai-border);
  background: rgba(0, 0, 0, 0.03);
}

/* 树形 */
.tree-indent {
  display: inline-flex;
  align-items: center;
}
.tree-caret {
  width: 16px;
  height: 16px;
  display: inline-grid;
  place-items: center;
  color: var(--ai-text-2);
  transition: transform 0.18s;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.tree-caret.open {
  transform: rotate(90deg);
}
.tree-caret-spacer {
  display: inline-block;
  width: 16px;
}
.tree-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.tree-name-ico {
  color: var(--ai-text-2);
  display: inline-grid;
  place-items: center;
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
}
</style>
