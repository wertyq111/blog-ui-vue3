<template>
  <AdminAnimalModal
    :visible="visible"
    :title="title"
    width="900px"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="develop-dialog-form"
    >
      <div class="field-desc">统一管理开发任务，支持详情编辑、状态追踪和平台关联。</div>

      <div class="develop-dialog-card">
        <div class="develop-dialog-card__title">待办基本信息</div>
        <div class="develop-dialog-card__body">
          <el-row :gutter="15">
            <el-col :sm="24">
              <el-form-item label="标题" prop="title">
                <Input
                  v-model="formData.title"
                  placeholder="请输入待办标题"
                  :maxlength="100"
                  allow-clear
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="15">
            <el-col :sm="8">
              <el-form-item label="状态" prop="status">
                <AnimalSelect
                  v-model="statusModel"
                  :options="statusOptions"
                  placeholder="请选择状态"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="8">
              <el-form-item label="优先级" prop="priority">
                <AnimalSelect
                  v-model="priorityModel"
                  :options="priorityOptions"
                  placeholder="请选择优先级"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="8">
              <el-form-item label="截止日期" prop="due_date">
                <AnimalDatePicker
                  v-model="dueDateModel"
                  type="date"
                  placeholder="选择截止日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="15">
            <el-col :sm="12">
              <el-form-item label="关联平台" prop="platform_id">
                <AnimalSelect
                  v-model="platformModel"
                  :options="platformSelectOptions"
                  placeholder="请选择工作平台"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12">
              <el-form-item label="标签" prop="tagsText">
                <Input
                  v-model="tagsText"
                  placeholder="英文逗号分隔，如：前端,Bug,紧急"
                  allow-clear
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>

      <div class="develop-dialog-card develop-dialog-card--content" style="margin-top: 14px">
        <div class="develop-dialog-card__title">详细描述</div>
        <div class="develop-dialog-card__body">
          <el-row :gutter="15">
            <el-col :sm="24">
              <el-form-item label="内容" prop="content">
                <AnimalMarkdown v-model="formData.content" height="360px" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
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
import { message } from "@/utils/feedback";
import { computed, nextTick, reactive, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { type FormInstance, type FormRules } from "element-plus";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import { Button, Input } from "animal-island-vue";
import AnimalSelect from "@/components/AnimalSelect/index.vue";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import AnimalMarkdown from "@/components/AnimalMarkdown/index.vue";
import TodoAPI from "@/api/develop/todo";
import type { TodoForm, TodoItem } from "@/types/api/todo";
import type { WorkPlatformItem } from "@/types/api/work-platform";

defineOptions({
  name: "TodoEdit",
  inheritAttrs: false,
});

const props = defineProps<{
  visible: boolean;
  data?: TodoItem | null;
  platforms: WorkPlatformItem[];
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const tagsText = ref("");

const initialFormData: TodoForm = {
  id: undefined,
  title: "",
  content: "",
  status: 0,
  priority: 1,
  due_date: null,
  platform_id: null,
  tags: [],
};

const formData = reactive<TodoForm>({ ...initialFormData });

const title = computed(() => (props.data ? "修改待办" : "添加待办"));

const statusOptions = [
  { key: "0", label: "待办" },
  { key: "1", label: "进行中" },
  { key: "2", label: "已完成" },
  { key: "3", label: "已取消" },
];

const priorityOptions = [
  { key: "0", label: "低" },
  { key: "1", label: "中" },
  { key: "2", label: "高" },
  { key: "3", label: "紧急" },
];

const platformSelectOptions = computed(() => [
  { key: "", label: "无平台" },
  ...props.platforms.map((p) => ({ key: String(p.id), label: p.name })),
]);

const statusModel = computed<string>({
  get: () => String(formData.status ?? 0),
  set: (val) => {
    formData.status = Number(val);
  },
});

const priorityModel = computed<string>({
  get: () => String(formData.priority ?? 1),
  set: (val) => {
    formData.priority = Number(val);
  },
});

const platformModel = computed<string>({
  get: () => (formData.platform_id == null ? "" : String(formData.platform_id)),
  set: (val) => {
    formData.platform_id = val === "" ? null : Number(val);
  },
});

// 对齐后端的 due_date 和前端的 dueDate
const dueDateModel = computed<string>({
  get: () => formData.due_date || "",
  set: (val) => {
    formData.due_date = val || null;
  },
});

const rules: FormRules = {
  title: [{ required: true, message: "请输入待办标题", trigger: "blur" }],
};

function resetForm(): void {
  Object.assign(formData, {
    id: undefined,
    title: "",
    content: "",
    status: 0,
    priority: 1,
    due_date: null,
    platform_id: null,
    tags: [],
  });
  tagsText.value = "";
  formRef.value?.clearValidate();
}

async function openDialog(): Promise<void> {
  resetForm();
  if (props.data) {
    const init = props.data;
    Object.assign(formData, {
      id: init.id,
      title: init.title || "",
      content: init.content || "",
      status: init.status ?? 0,
      priority: init.priority ?? 1,
      due_date: init.due_date || init.dueDate || null,
      platform_id: init.platform_id || init.platformId || null,
      tags: init.tags ?? [],
    });
    tagsText.value = Array.isArray(init.tags) ? init.tags.join(",") : "";
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
    const tags = tagsText.value
      ? tagsText.value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    formData.tags = tags;

    if (formData.id) {
      await TodoAPI.update(formData.id, formData);
      message.success("修改待办成功");
    } else {
      await TodoAPI.create(formData);
      message.success("新增待办成功");
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
.develop-dialog-card {
  padding: 16px;
  border: 1.5px solid var(--ai-border, var(--ai-border));
  border-radius: 18px;
  background:
    radial-gradient(circle at top right, rgba(25, 200, 185, 0.05), transparent 22%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(247, 251, 243, 0.76) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 14px 28px rgba(189, 174, 160, 0.08);
}

.develop-dialog-card__title {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ai-primary-active, var(--ai-primary-active));
}

.develop-dialog-card__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
