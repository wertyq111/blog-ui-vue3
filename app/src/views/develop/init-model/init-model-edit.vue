<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="640px"
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
      <div class="field-desc">定义不同技术栈的 Model/Entity 模板及转换规则。</div>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="框架编码" prop="code">
            <Input
              v-model="formData.code"
              placeholder="请输入框架编码"
              :maxlength="20"
              allow-clear
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="框架名称" prop="name">
            <Input
              v-model="formData.name"
              placeholder="请输入框架名称"
              :maxlength="20"
              allow-clear
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="模板提示" prop="tip">
        <Input v-model="formData.tip" placeholder="请输入模板提示" :maxlength="200" allow-clear />
      </el-form-item>
      <el-form-item label="模型模板" prop="template">
        <el-input
          v-model="formData.template"
          type="textarea"
          :rows="8"
          placeholder="请输入模型模板内容"
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
import { computed, nextTick, reactive, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Button, Input } from "animal-island-vue";
import InitModelAPI from "@/api/develop/init-model";
import type { InitModelForm, InitModelItem } from "@/types/api/init-model";

const props = defineProps<{
  visible: boolean;
  data?: InitModelItem | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const initialFormData: InitModelForm = {
  code: "",
  name: "",
  template: "",
  tip: "",
};

const formData = reactive<InitModelForm>({ ...initialFormData });

const title = computed(() => (props.data ? "编辑模型初始化" : "新增模型初始化"));

const rules: FormRules = {
  code: [{ required: true, message: "请输入框架编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入框架名称", trigger: "blur" }],
  tip: [{ required: true, message: "请输入模板提示", trigger: "blur" }],
  template: [{ required: true, message: "请输入模型模板", trigger: "blur" }],
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
      code: props.data.code,
      name: props.data.name,
      template: props.data.template,
      tip: props.data.tip,
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
      await InitModelAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await InitModelAPI.create(formData);
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
