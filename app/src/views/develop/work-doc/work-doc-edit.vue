<template>
  <AdminAnimalModal
    :visible="visible"
    :title="title"
    width="1000px"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="82px"
      class="develop-dialog-form"
    >
      <div class="field-desc">编写工作文档，支持分类、标签、模板类型与 Markdown 正文。</div>
      <el-row :gutter="15">
        <el-col :sm="16">
          <el-form-item label="标题" prop="title">
            <Input v-model="formData.title" placeholder="请输入标题" :maxlength="120" allow-clear />
          </el-form-item>
        </el-col>
        <el-col :sm="8">
          <el-form-item label="分类" prop="categoryId">
            <Select
              v-model="categoryModel"
              placeholder="请选择分类"
              :options="categoryOptions ?? []"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="15">
        <el-col :sm="8">
          <el-form-item label="模板类型" prop="templateType">
            <Select v-model="formData.templateType" :options="templateOptions" />
          </el-form-item>
        </el-col>
        <el-col :sm="8">
          <el-form-item label="项目来源" prop="source">
            <Select
              v-model="formData.source"
              placeholder="请选择来源"
              :options="sourceOptions ?? []"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="8">
          <el-form-item label="优先级" prop="priority">
            <Input v-model="priorityModel" type="number" placeholder="0-10" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="15">
        <el-col :sm="16">
          <el-form-item label="标签" prop="tagString">
            <Input v-model="formData.tagString" placeholder="多个标签用英文逗号分隔" allow-clear />
          </el-form-item>
        </el-col>
        <el-col :sm="4">
          <el-form-item label="状态" prop="status">
            <Switch v-model="statusOn">
              <template #checked>启用</template>
              <template #unchecked>停用</template>
            </Switch>
          </el-form-item>
        </el-col>
        <el-col :sm="4">
          <el-form-item label="置顶" prop="isPin">
            <Switch v-model="pinOn" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="内容" prop="content">
        <AnimalMarkdown v-model="formData.content" height="460px" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="develop-dialog-footer">
        <Button type="default" @click="closeDialog">取消</Button>
        <Button type="primary" :loading="loading" @click="handleSubmit">保存</Button>
      </div>
    </template>
  </AdminAnimalModal>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import { Button, Input, Select, Switch } from "animal-island-vue";
import AnimalMarkdown from "@/components/AnimalMarkdown/index.vue";
import WorkDocAPI from "@/api/develop/work-doc";
import type { WorkDocForm, WorkDocItem } from "@/types/api/work-doc";

const props = defineProps<{
  visible: boolean;
  data?: WorkDocItem | null;
  defaultCategoryId?: number;
  categoryOptions?: Array<{ key: string; label: string }>;
  sourceOptions?: Array<{ key: string; label: string }>;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

interface DocFormState {
  id?: number;
  categoryId?: number;
  title: string;
  content: string;
  templateType: string;
  tagString: string;
  status: number;
  priority: number;
  source: string;
  isPin: number;
}

const initialFormData: DocFormState = {
  id: undefined,
  categoryId: undefined,
  title: "",
  content: "",
  templateType: "custom",
  tagString: "",
  status: 1,
  priority: 0,
  source: "",
  isPin: 0,
};

const formData = reactive<DocFormState>({ ...initialFormData });

const title = computed(() => (props.data ? "编辑工作文档" : "新增工作文档"));

const templateOptions = [
  { key: "custom", label: "自定义" },
  { key: "troubleshooting", label: "故障排查" },
  { key: "design", label: "方案设计" },
  { key: "knowledge", label: "知识点" },
];

const categoryModel = computed<string>({
  get: () => (formData.categoryId ? String(formData.categoryId) : ""),
  set: (value) => {
    formData.categoryId = value === "" ? undefined : Number(value);
  },
});

const priorityModel = computed<string>({
  get: () => String(formData.priority ?? 0),
  set: (value) => {
    const n = Number(value);
    formData.priority = Number.isNaN(n) ? 0 : Math.min(10, Math.max(0, n));
  },
});

const statusOn = computed<boolean>({
  get: () => formData.status === 1,
  set: (value) => {
    formData.status = value ? 1 : 0;
  },
});

const pinOn = computed<boolean>({
  get: () => formData.isPin === 1,
  set: (value) => {
    formData.isPin = value ? 1 : 0;
  },
});

const rules: FormRules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入内容", trigger: "blur" }],
  categoryId: [
    {
      trigger: "change",
      validator: (_r, _v, cb) => (formData.categoryId ? cb() : cb(new Error("请选择分类"))),
    },
  ],
};

function resetForm(): void {
  Object.assign(formData, { ...initialFormData });
  formRef.value?.clearValidate();
}

async function openDialog(): Promise<void> {
  resetForm();
  if (props.data) {
    loading.value = true;
    try {
      const info = await WorkDocAPI.getInfo(props.data.id);
      Object.assign(formData, {
        id: info.id,
        categoryId: info.categoryId,
        title: info.title,
        content: info.content,
        templateType: info.templateType || "custom",
        tagString: info.tags?.join(",") || "",
        status: info.status ?? 1,
        priority: info.priority ?? 0,
        source: info.source || "",
        isPin: info.isPin ?? 0,
      });
    } finally {
      loading.value = false;
    }
  } else if (props.defaultCategoryId) {
    formData.categoryId = props.defaultCategoryId;
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

  const tags = formData.tagString
    ? formData.tagString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const payload: WorkDocForm = {
    id: formData.id,
    categoryId: formData.categoryId as number,
    title: formData.title,
    content: formData.content,
    templateType: formData.templateType,
    tags,
    status: formData.status,
    priority: formData.priority,
    source: formData.source,
    isPin: formData.isPin,
  };

  loading.value = true;
  try {
    if (payload.id) {
      await WorkDocAPI.update(payload.id, payload);
      ElMessage.success("修改成功");
    } else {
      await WorkDocAPI.create(payload);
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
