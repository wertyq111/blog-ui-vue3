<template>
  <div class="develop-page">
    <el-card shadow="never" class="develop-shell">
      <!-- Hero 区域 -->
      <div class="develop-hero">
        <div class="develop-hero__copy">
          <div class="develop-hero__eyebrow">MENU MANAGEMENT</div>
          <h1 class="develop-hero__title">菜单管理</h1>
          <p class="develop-hero__desc">管理系统菜单结构与路由配置</p>
        </div>
      </div>

      <!-- 搜索面板 -->
      <div class="develop-panel">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="develop-form">
          <el-form-item label="菜单名称" prop="filter[title]">
            <el-input
              v-model="queryParams['filter[title]']"
              placeholder="菜单名称"
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
            <div class="develop-table-shell__title">菜单结构树</div>
            <div class="develop-table-shell__desc">定义系统导航菜单、子菜单及功能按钮权限标识。</div>
          </div>
          <div class="develop-table-shell__actions">
            <el-button
              v-hasPerm="['sys:menu:create']"
              type="success"
              icon="plus"
              @click="openDialog(0)"
            >
              新增菜单
            </el-button>
          </div>
        </div>

        <el-table
          ref="dataTableRef"
          v-loading="loading"
          row-key="id"
          :data="menuTableData"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          class="develop-table"
          @row-click="handleRowClick"
        >
          <el-table-column label="菜单名称" min-width="200">
            <template #default="scope">
              <div class="menu-name-cell">
                <span class="menu-name-cell__icon">
                  <template v-if="scope.row.icon && scope.row.icon.startsWith('el-icon')">
                    <el-icon style="vertical-align: -0.15em">
                      <component :is="scope.row.icon.replace('el-icon-', '')" />
                    </el-icon>
                  </template>
                  <template v-else-if="scope.row.icon">
                    <span :class="`i-svg:${scope.row.icon}`" />
                  </template>
                </span>
                <span class="menu-name-cell__text">{{ scope.row.title }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="类型" align="center" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.type === 0" type="success">菜单</el-tag>
              <el-tag v-if="scope.row.type === 1" type="danger">权限</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="路由路径" align="left" width="150" prop="path" />
          <el-table-column label="组件路径" align="left" width="250" prop="component" />
          <el-table-column label="权限标识" align="center" width="200" prop="permission" />

          <el-table-column label="状态" align="center" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.hide === 0" type="success">显示</el-tag>
              <el-tag v-else type="info">隐藏</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" align="center" width="80" prop="sort" />
          <el-table-column fixed="right" align="center" label="操作" width="220">
            <template #default="scope">
              <el-button
                v-if="scope.row.type === 0"
                v-hasPerm="['sys:menu:create']"
                type="primary"
                link
                size="small"
                icon="plus"
                @click.stop="openDialog(scope.row.id)"
              >
                新增
              </el-button>

              <el-button
                v-hasPerm="['sys:menu:update']"
                type="primary"
                link
                size="small"
                icon="edit"
                @click.stop="openDialog(undefined, scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-hasPerm="['sys:menu:delete']"
                type="danger"
                link
                size="small"
                icon="delete"
                @click.stop="handleDelete(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-drawer
      v-model="dialogState.visible"
      :title="dialogState.title"
      :size="drawerSize"
      class="develop-drawer"
      @close="closeDialog"
    >
      <el-form ref="menuFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="父级菜单" prop="pid">
          <el-tree-select
            v-model="formData.pid"
            placeholder="选择上级菜单"
            :data="menuOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :value="0">菜单</el-radio>
            <el-radio :value="1">权限</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="formData.type === 0" label="路由路径" prop="path">
          <el-input v-model="formData.path" placeholder="/system 或 user" />
        </el-form-item>

        <el-form-item v-if="formData.type === 0 && !isExternalLink" label="组件路径" prop="component">
          <el-input v-model="formData.component" placeholder="system/user/index" style="width: 95%">
            <template #prepend>src/views/</template>
            <template #append>.vue</template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="formData.type === 0" label="显示状态" prop="hide">
          <el-radio-group v-model="formData.hide">
            <el-radio :value="0">显示</el-radio>
            <el-radio :value="1">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <!-- 权限标识 -->
        <el-form-item v-if="formData.type === 1" label="权限标识" prop="permission">
          <el-input v-model="formData.permission" placeholder="sys:user:create" />
        </el-form-item>

        <el-form-item v-if="formData.type === 0" label="图标" prop="icon">
          <icon-select v-model="formData.icon" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app";
import { DeviceEnum } from "@/enums/settings";
import MenuAPI from "@/api/system/menu";
import type { MenuQueryParams, MenuForm, MenuItem } from "@/types/api";
import type { FormInstance, FormRules } from "element-plus";

defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

const appStore = useAppStore();

const queryFormRef = ref<FormInstance>();
const menuFormRef = ref<FormInstance>();

const queryParams = reactive<MenuQueryParams>({});

const menuTableData = ref<MenuItem[]>([]);
const menuOptions = ref<OptionItem[]>([]);
const loading = ref(false);

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
};
const formData = ref<MenuForm>({ ...initialMenuFormData });
const selectedMenuId = ref<number | undefined>();

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const isExternalLink = computed(
  () =>
    formData.value.type === 0 &&
    !!formData.value.path &&
    /^https?:\/\//.test(formData.value.path)
);

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
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleQuery(): void {
  fetchData();
}

function handleResetQuery(): void {
  queryFormRef.value?.resetFields();
  queryParams["filter[title]"] = undefined;
  fetchData();
}

function handleRowClick(row: MenuItem): void {
  selectedMenuId.value = row.id;
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
          formData.value = data;
        });
      } else {
        dialogState.title = "新增菜单";
        formData.value = { ...initialMenuFormData };
        if (parentId !== undefined) {
          formData.value.pid = parentId;
        }
      }
    });
}

function handleSubmit(): void {
  menuFormRef.value?.validate((isValid) => {
    if (isValid) {
      const menuId = formData.value.id;
      if (menuId) {
        if (formData.value.pid === menuId) {
          ElMessage.error("父级菜单不能为当前菜单");
          return;
        }
        MenuAPI.update(menuId, formData.value).then(() => {
          ElMessage.success("修改成功");
          closeDialog();
          fetchData();
        });
      } else {
        MenuAPI.create(formData.value).then(() => {
          ElMessage.success("新增成功");
          closeDialog();
          fetchData();
        });
      }
    }
  });
}

function handleDelete(menuId: number): void {
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
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.menu-name-cell {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

.menu-name-cell__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  min-width: 18px;
  margin-right: 6px;
}

.menu-name-cell__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
