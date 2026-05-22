<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="750px"
    class="develop-dialog"
    @update:model-value="handleVisibleChange"
    @close="closeDialog"
  >
    <el-form
      ref="formRef"
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
        <Button type="primary" :loading="loading" @click="handleSubmit">保存</Button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Button, Input, Select, Switch } from "animal-island-vue";
import AnimalTreeSelect from "@/components/AnimalTreeSelect/index.vue";
import AnimalMultiSelect from "@/components/AnimalMultiSelect/index.vue";
import AnimalTextarea from "@/components/AnimalTextarea/index.vue";
import MenuAPI from "@/api/system/menu";
import type { MenuForm, OptionItem } from "@/types/api";
import { isHttpUrl } from "@/utils/systemManagement";

const props = defineProps<{
  visible: boolean;
  parentId?: number;
  menuId?: number;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const menuOptions = ref<OptionItem[]>([]);
const menuTarget = ref(0);
const checkedPermNodes = ref<number[]>([]);

const initialMenuFormData: MenuForm = {
  id: undefined,
  pid: 0,
  hide: 0,
  sort: 1,
  type: 0,
  status: 1,
};

const formData = ref<MenuForm>({ ...initialMenuFormData });
const title = computed(() => (props.menuId ? "编辑菜单" : "新增菜单"));

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

const menuTypeOptions = [
  { key: "0", label: "菜单" },
  { key: "1", label: "按钮" },
];

const menuTargetOptions = [
  { key: "0", label: "组件" },
  { key: "1", label: "内链" },
  { key: "2", label: "外链" },
];

const permNodeOptions = permNodeList.map((item) => ({ key: String(item.key), label: item.label }));

const typeModel = computed<string>({
  get: () => String(formData.value.type ?? 0),
  set: (value) => {
    formData.value.type = Number(value);
    onMenuTypeChange();
  },
});

const targetModel = computed<string>({
  get: () => String(menuTarget.value),
  set: (value) => {
    menuTarget.value = Number(value);
    onTargetChange();
  },
});

const menuStatusOn = computed<boolean>({
  get: () => formData.value.status === 1,
  set: (value) => {
    formData.value.status = value ? 1 : 0;
  },
});

const visibleOn = computed<boolean>({
  get: () => formData.value.hide === 0,
  set: (value) => {
    formData.value.hide = value ? 0 : 1;
  },
});

const sortModel = computed<string>({
  get: () => (formData.value.sort == null ? "" : String(formData.value.sort)),
  set: (value) => {
    formData.value.sort = value === "" ? undefined : Number(value);
  },
});

const permNodesModel = computed<string[]>({
  get: () => checkedPermNodes.value.map((key) => String(key)),
  set: (keys) => {
    checkedPermNodes.value = keys.map((key) => Number(key));
  },
});

const rules: FormRules = {
  pid: [{ required: true, message: "请选择父级菜单", trigger: "blur" }],
  title: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
  hide: [{ required: true, message: "请选择显示状态", trigger: "change" }],
};

function resetForm(): void {
  formData.value = { ...initialMenuFormData };
  menuTarget.value = 0;
  checkedPermNodes.value = [];
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
}

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

function onTargetChange(): void {
  if (menuTarget.value === 2) {
    formData.value.component = undefined;
  }
}

async function openDialog(): Promise<void> {
  resetForm();
  loading.value = true;
  try {
    const data = await MenuAPI.getOptions(true);
    menuOptions.value = [{ value: 0, label: "顶级菜单", children: data }];

    if (props.menuId) {
      const detail = await MenuAPI.getFormData(props.menuId);
      formData.value = { ...initialMenuFormData, ...detail };
      menuTarget.value = isHttpUrl(detail.path) ? 2 : isHttpUrl(detail.component) ? 1 : 0;
      checkedPermNodes.value = detail.checkedList ?? [];
    } else if (props.parentId !== undefined) {
      formData.value.pid = props.parentId;
    }

    await nextTick();
    formRef.value?.clearValidate();
  } finally {
    loading.value = false;
  }
}

function closeDialog(): void {
  emit("update:visible", false);
  resetForm();
}

function handleVisibleChange(value: boolean): void {
  if (!value) closeDialog();
}

function handleSubmit(): void {
  formRef.value?.validate((isValid) => {
    if (!isValid) return;

    const menuId = formData.value.id;
    if (menuId && formData.value.pid === menuId) {
      ElMessage.error("父级菜单不能为当前菜单");
      return;
    }

    loading.value = true;
    const payload: MenuForm = {
      ...formData.value,
      pid: formData.value.pid || 0,
      target: menuTarget.value === 2 ? "_blank" : "_self",
      checkedList: formData.value.type === 0 ? checkedPermNodes.value : [],
    };

    const action = menuId ? MenuAPI.update(menuId, payload) : MenuAPI.create(payload);
    action
      .then(() => {
        ElMessage.success(menuId ? "修改成功" : "新增成功");
        emit("done");
        closeDialog();
      })
      .finally(() => {
        loading.value = false;
      });
  });
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) openDialog();
  }
);
</script>
