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
      <div class="field-desc">维护项目来源平台、启用状态与展示顺序。</div>
      <el-form-item label="平台名称" prop="name">
        <Input v-model="formData.name" placeholder="请输入平台名称" :maxlength="50" allow-clear />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <Switch v-model="statusOn">
          <template #checked>启用</template>
          <template #unchecked>禁用</template>
        </Switch>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <Input v-model="sortModel" type="number" placeholder="请输入排序号" />
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
import { Button, Input, Switch } from "animal-island-vue";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { WorkPlatformForm, WorkPlatformItem } from "@/types/api/work-platform";

const props = defineProps<{
  visible: boolean;
  data?: WorkPlatformItem | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const initialFormData: WorkPlatformForm = {
  name: "",
  status: 1,
  sort: 0,
};

const formData = reactive<WorkPlatformForm>({ ...initialFormData });

const title = computed(() => (props.data ? "编辑工作平台" : "新增工作平台"));

const statusOn = computed<boolean>({
  get: () => formData.status === 1,
  set: (value) => {
    formData.status = value ? 1 : 0;
  },
});

const sortModel = computed<string>({
  get: () => (formData.sort == null ? "" : String(formData.sort)),
  set: (value) => {
    formData.sort = value === "" ? 0 : Number(value);
  },
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入平台名称", trigger: "blur" }],
};

function resetForm(): void {
  Object.assign(formData, { ...initialFormData, id: undefined });
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
}

async function openDialog(): Promise<void> {
  resetForm();
  if (props.data) {
    Object.assign(formData, {
      id: props.data.id,
      name: props.data.name,
      status: props.data.status,
      sort: props.data.sort,
    });
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
      await WorkPlatformAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await WorkPlatformAPI.create(formData);
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
