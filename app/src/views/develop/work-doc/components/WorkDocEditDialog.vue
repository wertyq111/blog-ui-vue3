<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改文档' : '添加文档'"
    width="920px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="work-doc-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="work-doc-edit-dialog__form"
    >
      <div class="work-doc-edit-dialog__section">
        <div class="work-doc-edit-dialog__section-title">
          文档信息
        </div>

        <el-row :gutter="16">
          <el-col :md="12">
            <el-form-item
              label="标题"
              prop="title"
            >
              <el-input
                v-model="form.title"
                clearable
                maxlength="120"
                placeholder="请输入标题"
              />
            </el-form-item>
          </el-col>

          <el-col :md="12">
            <el-form-item
              label="分类"
              prop="categoryId"
            >
              <el-select
                v-model="form.categoryId"
                filterable
                placeholder="请选择分类"
                style="width: 100%"
              >
                <el-option
                  v-for="item in categories"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :md="8">
            <el-form-item label="模板">
              <el-select
                v-model="form.templateType"
                placeholder="请选择模板"
                style="width: 100%"
                @change="applyTemplate"
              >
                <el-option
                  v-for="item in templates"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :md="8">
            <el-form-item label="状态">
              <el-switch
                v-model="form.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="停用"
              />
            </el-form-item>
          </el-col>

          <el-col :md="8">
            <el-form-item label="优先级">
              <el-input-number
                v-model="form.priority"
                :min="0"
                :max="99"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :md="12">
            <el-form-item label="标签">
              <el-input
                v-model="tagsText"
                clearable
                placeholder="使用英文逗号分隔"
              />
            </el-form-item>
          </el-col>

          <el-col :md="12">
            <el-form-item label="项目来源">
              <el-select
                v-model="form.source"
                clearable
                filterable
                placeholder="请选择工作平台"
                style="width: 100%"
              >
                <el-option
                  v-for="item in sourceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="置顶">
          <el-switch
            v-model="form.isPin"
            :active-value="1"
            :inactive-value="0"
            active-text="置顶"
            inactive-text="普通"
          />
        </el-form-item>
      </div>

      <div class="work-doc-edit-dialog__section">
        <div class="work-doc-edit-dialog__section-title">
          正文内容
        </div>

        <el-form-item
          label="内容"
          prop="content"
        >
          <el-input
            v-model="form.content"
            :rows="16"
            type="textarea"
            placeholder="请输入 Markdown 文档内容"
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="handleVisibleChange(false)">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="submit"
      >
        保存
      </el-button>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import AppDialog from '@/components/AppDialog.vue'
import type { WorkDailyPlatformOption } from '@/types/work-daily'
import type { WorkDocCategoryRow, WorkDocFormValue } from '@/types/work-doc'
import type { WorkDocTemplateOption } from '../use-work-doc-page'

const props = defineProps<{
  visible: boolean
  value: WorkDocFormValue
  categories: WorkDocCategoryRow[]
  templates: WorkDocTemplateOption[]
  platforms: WorkDailyPlatformOption[]
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: WorkDocFormValue): void
}>()

const formRef = ref<FormInstance>()
const tagsText = ref('')
const form = reactive<WorkDocFormValue>({
  categoryId: null,
  title: '',
  content: '',
  templateType: 'custom',
  tags: [],
  status: 1,
  priority: 0,
  source: '',
  isPin: 0,
})

function applyValue(value: WorkDocFormValue): void {
  form.id = value.id
  form.categoryId = value.categoryId
  form.title = value.title
  form.content = value.content
  form.templateType = value.templateType || 'custom'
  form.tags = [...value.tags]
  form.status = value.status
  form.priority = value.priority
  form.source = value.source
  form.isPin = value.isPin
  tagsText.value = value.tags.join(', ')
}

watch(
  () => props.value,
  (value) => {
    applyValue(value)
    formRef.value?.clearValidate()
  },
  {
    deep: true,
    immediate: true,
  },
)

const sourceOptions = computed(() => props.platforms.map((item) => ({
  label: item.name,
  value: item.name,
})))

const rules: FormRules<WorkDocFormValue> = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

function applyTemplate(templateType: string): void {
  const template = props.templates.find((item) => item.value === templateType)

  if (template && form.content.trim().length === 0) {
    form.content = template.content
  }
}

function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    categoryId: form.categoryId,
    title: form.title.trim(),
    content: form.content.trim(),
    templateType: form.templateType,
    tags: tagsText.value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
    status: form.status,
    priority: form.priority,
    source: form.source.trim(),
    isPin: form.isPin,
  })
}
</script>

<style scoped>
.work-doc-edit-dialog__form {
  display: grid;
  gap: 16px;
}

.work-doc-edit-dialog__section {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(248, 250, 252, 0.86);
}

.work-doc-edit-dialog__section-title {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
</style>
