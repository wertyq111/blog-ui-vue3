<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="520px"
    class="develop-dialog"
    @update:model-value="handleVisibleChange"
    @close="closeDialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="82px"
      class="develop-dialog-form"
    >
      <div class="field-desc">维护文档分类层级、图标与排序。</div>
      <el-form-item label="分类名称" prop="name">
        <Input v-model="formData.name" placeholder="请输入分类名称" :maxlength="30" allow-clear />
      </el-form-item>
      <el-form-item label="父分类" prop="parentId">
        <Select v-model="parentModel" placeholder="无（作为根分类）" :options="parentOptions" />
      </el-form-item>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="图标" prop="icon">
            <Input v-model="formData.icon" placeholder="图标名称" allow-clear />
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="排序" prop="sort">
            <Input v-model="sortModel" type="number" placeholder="排序号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述" prop="description">
        <Input v-model="formData.description" placeholder="请输入描述" allow-clear />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <Switch v-model="statusOn">
          <template #checked>启用</template>
          <template #unchecked>停用</template>
        </Switch>
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
import { computed, nextTick, reactive, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Button, Input, Select } from "animal-island-vue";
import WorkDocCategoryAPI from "@/api/develop/work-doc-category";
import type { WorkDocCategoryForm, WorkDocCategoryItem } from "@/types/api/work-doc-category";

const props = defineProps<{
  visible: boolean;
  data?: WorkDocCategoryItem | null;
  defaultParentId?: number;
  categoryOptions?: Array<{ key: string; label: string }>;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const initialFormData: WorkDocCategoryForm = {
  name: "",
  parentId: undefined,
  icon: "",
  description: "",
  sort: 0,
  status: 1,
};

const formData = reactive<WorkDocCategoryForm>({ ...initialFormData });

const title = computed(() => (props.data ? "编辑分类" : "新增分类"));

// 父分类不能选自己
const parentOptions = computed(() => [
  { key: "", label: "无（作为根分类）" },
  ...(props.categoryOptions ?? []).filter((o) => o.key !== String(formData.id)),
]);

const parentModel = computed<string>({
  get: () => (formData.parentId ? String(formData.parentId) : ""),
  set: (value) => {
    formData.parentId = value === "" ? undefined : Number(value);
  },
});

const sortModel = computed<string>({
  get: () => (formData.sort == null ? "" : String(formData.sort)),
  set: (value) => {
    formData.sort = value === "" ? 0 : Number(value);
  },
});

const statusOn = computed<boolean>({
  get: () => formData.status === 1,
  set: (value) => {
    formData.status = value ? 1 : 0;
  },
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
};

function resetForm(): void {
  Object.assign(formData, { ...initialFormData, id: undefined });
  formRef.value?.clearValidate();
}

async function openDialog(): Promise<void> {
  resetForm();
  if (props.data) {
    Object.assign(formData, {
      id: props.data.id,
      name: props.data.name,
      parentId: props.data.parentId || undefined,
      icon: props.data.icon,
      description: props.data.description,
      sort: props.data.sort,
      status: props.data.status,
    });
  } else if (props.defaultParentId) {
    formData.parentId = props.defaultParentId;
  }
  await nextTick();
  formRef.value?.clearValidate();
}

function closeDialog(): void {
  emit("update:visible", false);
  resetForm();
}

function handleVisibleChange(value: boolean): void {
  if (!value) closeDialog();
}

const handleSubmit = useDebounceFn(async () => {
  const valid = await formRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      await WorkDocCategoryAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await WorkDocCategoryAPI.create(formData);
      ElMessage.success("新增成功");
    }
    emit("done");
    closeDialog();
  } finally {
    loading.value = false;
  }
}, 300);

watch(
  () => props.visible,
  (visible) => {
    if (visible) openDialog();
  }
);
</script>
