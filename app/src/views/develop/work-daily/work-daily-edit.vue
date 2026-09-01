<template>
  <AdminAnimalModal
    :visible="visible"
    :title="title"
    width="980px"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="82px"
      class="develop-dialog-form"
    >
      <div class="field-desc">按日期记录各平台的工作内容，支持多平台 Markdown 录入。</div>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="日期" prop="logDate">
            <AnimalDatePicker
              v-model="formData.logDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="平台" prop="platforms">
            <AnimalMultiSelect
              v-model="platformKeys"
              :options="platformOptions"
              placeholder="请选择平台"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="临时平台">
            <Input
              v-model="formData.customPlatformName"
              placeholder="新增临时平台名（可选）"
              allow-clear
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="标签">
            <AnimalTagSelect
              v-model="selectedTags"
              :options="tagList"
              placeholder="选择或输入新标签"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <div v-for="id in selectedPlatformIds" :key="id" class="platform-editor">
        <div class="platform-editor__header">{{ getPlatformName(id) }}</div>
        <AnimalMarkdown v-model="platformContentMap[id]" height="360px" />
      </div>

      <div v-if="formData.customPlatformName" class="platform-editor">
        <div class="platform-editor__header">{{ formData.customPlatformName }} (临时平台)</div>
        <AnimalMarkdown v-model="customPlatformContent" height="360px" />
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
import { computed, reactive, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { type FormInstance, type FormRules } from "element-plus";
import { Button, Input } from "animal-island-vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";
import AnimalMultiSelect from "@/components/AnimalMultiSelect/index.vue";
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";
import AnimalMarkdown from "@/components/AnimalMarkdown/index.vue";
import AnimalTagSelect from "@/components/AnimalTagSelect/index.vue";
import WorkDailyAPI from "@/api/develop/work-daily";
import WorkPlatformAPI from "@/api/develop/work-platform";
import type { WorkDailyForm, WorkDailyItem } from "@/types/api/work-daily";
import type { WorkPlatformItem } from "@/types/api/work-platform";

const props = defineProps<{
  visible: boolean;
  data?: WorkDailyItem | null;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  done: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const platforms = ref<WorkPlatformItem[]>([]);
const selectedPlatformIds = ref<number[]>([]);
const platformContentMap = reactive<Record<number, string>>({});

const selectedTags = ref<Array<number | string>>([]);
const tagList = ref<Array<{ id: number; name: string }>>([]);
const customPlatformContent = ref("");

const formData = reactive<{ id?: number; logDate: string; customPlatformName: string }>({
  id: undefined,
  logDate: "",
  customPlatformName: "",
});

const title = computed(() => (props.data ? "编辑工作日常" : "新增工作日常"));

const platformOptions = computed(() =>
  platforms.value.map((p) => ({ key: String(p.id), label: p.name }))
);

const platformKeys = computed<string[]>({
  get: () => selectedPlatformIds.value.map(String),
  set: (keys) => {
    const ids = keys.map(Number);
    selectedPlatformIds.value = ids;
    ids.forEach((id) => {
      if (!(id in platformContentMap)) platformContentMap[id] = "";
    });
  },
});

const rules: FormRules = {
  logDate: [{ required: true, message: "请选择日期", trigger: "change" }],
};

function getPlatformName(id: number): string {
  return platforms.value.find((p) => p.id === id)?.name || "未知平台";
}

function clearContentMap(): void {
  Object.keys(platformContentMap).forEach((k) => delete platformContentMap[Number(k)]);
}

function resetForm(): void {
  formData.id = undefined;
  formData.logDate = new Date().toISOString().substring(0, 10);
  formData.customPlatformName = "";
  customPlatformContent.value = "";
  selectedPlatformIds.value = [];
  selectedTags.value = [];
  clearContentMap();
  formRef.value?.clearValidate();
}

async function openDialog(): Promise<void> {
  resetForm();
  loading.value = true;
  try {
    if (!platforms.value.length) {
      platforms.value = await WorkPlatformAPI.getList(1);
    }
    const tagsData = await WorkDailyAPI.getTags();
    tagList.value = tagsData || [];

    if (props.data) {
      const info = await WorkDailyAPI.getInfo(props.data.id);
      formData.id = info.id;
      formData.logDate = info.logDate;
      selectedTags.value = (info.tags || []).map((t: any) => t.id);

      let contentObj = info.content;
      if (typeof contentObj === "string") {
        try {
          contentObj = JSON.parse(contentObj);
        } catch {
          contentObj = null;
        }
      }

      if (contentObj && typeof contentObj === "object" && contentObj.platforms) {
        contentObj.platforms.forEach((p: any) => {
          if (p.platformId) {
            selectedPlatformIds.value.push(p.platformId);
            platformContentMap[p.platformId] = p.content;
          } else if (p.platformName) {
            formData.customPlatformName = p.platformName;
            customPlatformContent.value = p.content;
          }
        });
      }
    }
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

const handleSubmit = useDebounceFn(async () => {
  const valid = await formRef.value?.validate().then(
    () => true,
    () => false
  );

  if (!valid) return;
  if (!selectedPlatformIds.value.length && !formData.customPlatformName) {
    message.warning("请选择或填写至少一个平台");
    return;
  }

  loading.value = true;
  try {
    const finalTagIds: number[] = [];
    for (const tag of selectedTags.value) {
      if (typeof tag === "string") {
        try {
          const newTag = await WorkDailyAPI.createTag(tag);
          if (newTag && newTag.id) {
            finalTagIds.push(newTag.id);
            tagList.value.push(newTag);
          }
        } catch (e: any) {
          message.error(`创建标签 "${tag}" 失败: ${e.message}`);
        }
      } else {
        finalTagIds.push(tag);
      }
    }

    const platformsPayload = selectedPlatformIds.value.map((id) => ({
      platform_id: id,
      platform_name: getPlatformName(id),
      content: platformContentMap[id] || "",
    }));

    if (formData.customPlatformName) {
      platformsPayload.push({
        platform_id: 0,
        platform_name: formData.customPlatformName,
        content: customPlatformContent.value || "",
      });
    }

    const payload: WorkDailyForm = {
      id: formData.id,
      logDate: formData.logDate,
      platforms: platformsPayload,
      tag_ids: finalTagIds,
    };

    if (payload.id) {
      await WorkDailyAPI.update(payload.id, payload);
      message.success("修改成功");
    } else {
      await WorkDailyAPI.create(payload);
      message.success("新增成功");
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
.platform-editor {
  margin-top: 16px;
  padding: 14px;
  border: 1.5px solid var(--ai-border, var(--ai-border));
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.5);
}

.platform-editor__header {
  margin-bottom: 8px;
  font-weight: 700;
  color: var(--ai-primary-active, var(--ai-primary-active));
}
</style>
