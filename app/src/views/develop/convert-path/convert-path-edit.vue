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
      <div class="field-desc">配置本地开发路径与服务器部署路径的映射关系。</div>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="项目编码" prop="code">
            <Input
              v-model="formData.code"
              placeholder="请输入项目编码"
              :maxlength="20"
              allow-clear
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="项目名称" prop="name">
            <Input
              v-model="formData.name"
              placeholder="请输入项目名称"
              :maxlength="20"
              allow-clear
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="网址" prop="url">
        <Input v-model="formData.url" placeholder="请输入网址" :maxlength="120" allow-clear />
      </el-form-item>
      <el-form-item label="服务器地址" prop="target">
        <Input
          v-model="formData.target"
          placeholder="请输入服务器地址"
          :maxlength="200"
          allow-clear
        />
      </el-form-item>
      <el-form-item label="来源地址">
        <div v-for="(_, index) in sources" :key="index" class="source-row">
          <Input v-model="sources[index]" placeholder="请输入来源地址" allow-clear />
          <Button
            v-if="index === sources.length - 1"
            type="primary"
            size="small"
            class="source-btn"
            @click="addSource"
          >
            <SystemIco name="plus" :size="13" />
          </Button>
          <Button
            v-if="sources.length > 1"
            type="default"
            size="small"
            danger
            class="source-btn"
            @click="removeSource(index)"
          >
            <SystemIco name="trash" :size="13" />
          </Button>
        </div>
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
import { Button, Input } from "animal-island-vue";
import SystemIco from "@/components/AdminPage/SystemIco.vue";
import ServerPathAPI from "@/api/develop/server-path";
import type { ServerPathForm, ServerPathItem } from "@/types/api/server-path";

const props = defineProps<{
  visible: boolean;
  data?: ServerPathItem | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const sources = ref<string[]>([""]);

const initialFormData: ServerPathForm = {
  code: "",
  name: "",
  url: "",
  target: "",
  sort: 0,
};

const formData = reactive<ServerPathForm>({ ...initialFormData });

const title = computed(() => (props.data ? "编辑路径转换" : "新增路径转换"));

const sortModel = computed<string>({
  get: () => (formData.sort == null ? "" : String(formData.sort)),
  set: (value) => {
    formData.sort = value === "" ? 0 : Number(value);
  },
});

const rules: FormRules = {
  code: [{ required: true, message: "请输入项目编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  target: [{ required: true, message: "请输入服务器地址", trigger: "blur" }],
};

function parseSources(raw?: string): string[] {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [""];
  } catch {
    return [""];
  }
}

function addSource(): void {
  sources.value.push("");
}

function removeSource(index: number): void {
  sources.value.splice(index, 1);
}

function resetForm(): void {
  Object.assign(formData, { ...initialFormData, id: undefined });
  sources.value = [""];
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
      url: props.data.url ?? "",
      target: props.data.target,
      sort: props.data.sort,
    });
    sources.value = parseSources(props.data.sources);
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

  const payload: ServerPathForm = {
    ...formData,
    sources: sources.value.filter((s) => s.trim()),
  };

  loading.value = true;
  try {
    if (formData.id) {
      await ServerPathAPI.update(formData.id, payload);
      ElMessage.success("修改成功");
    } else {
      await ServerPathAPI.create(payload);
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

<style lang="scss" scoped>
.source-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.source-btn {
  flex-shrink: 0;
}
</style>
