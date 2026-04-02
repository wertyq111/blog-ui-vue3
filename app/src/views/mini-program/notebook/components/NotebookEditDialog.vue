<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改文章' : '添加文章'"
    width="760px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="notebook-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
      class="notebook-edit-dialog__form"
    >
      <el-form-item
        label="标题"
        prop="title"
      >
        <el-input
          v-model="form.title"
          maxlength="100"
          clearable
          placeholder="请输入标题"
        />
      </el-form-item>

      <el-form-item
        label="文章内容"
        prop="content"
      >
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="8"
          maxlength="10000"
          show-word-limit
          placeholder="请输入文章内容"
        />
      </el-form-item>

      <el-form-item label="封面地址">
        <el-input
          v-model="form.cover"
          clearable
          placeholder="请输入封面图片 URL"
        />
      </el-form-item>

      <el-form-item
        label="文章分类"
        prop="categoryId"
      >
        <el-select
          v-model="form.categoryId"
          class="notebook-edit-dialog__select"
          clearable
          filterable
          placeholder="请选择分类"
          @change="handleCategoryChange"
        >
          <el-option
            v-for="category in categoryOptions"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="文章标签">
        <el-select
          v-model="form.labelId"
          class="notebook-edit-dialog__select"
          clearable
          filterable
          placeholder="请选择标签"
        >
          <el-option
            v-for="label in labelOptions"
            :key="label.id"
            :label="label.name"
            :value="label.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="可见状态">
        <el-switch v-model="form.viewStatus" />
      </el-form-item>

      <el-form-item
        v-if="!form.viewStatus"
        label="访问密码"
        prop="password"
      >
        <el-input
          v-model="form.password"
          show-password
          maxlength="32"
          clearable
          placeholder="不可见文章需要访问密码"
        />
      </el-form-item>

      <el-form-item label="允许评论">
        <el-switch v-model="form.commentStatus" />
      </el-form-item>

      <el-form-item label="推荐文章">
        <el-switch v-model="form.recommendStatus" />
      </el-form-item>
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
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import AppDialog from '@/components/AppDialog.vue'
import type {
  NotebookArticleCategoryOption,
  NotebookArticleFormValue,
  NotebookArticleLabelOption,
} from '@/types/notebook-article'

const props = defineProps<{
  visible: boolean
  value: NotebookArticleFormValue
  isEditing: boolean
  submitting: boolean
  categoryOptions: NotebookArticleCategoryOption[]
  labelOptions: NotebookArticleLabelOption[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'category-change', value: number | string | ''): void
  (event: 'submit', value: NotebookArticleFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<NotebookArticleFormValue>({
  title: '',
  content: '',
  cover: '',
  categoryId: '',
  labelId: '',
  viewStatus: true,
  commentStatus: true,
  recommendStatus: false,
  password: '',
})

function applyValue(value: NotebookArticleFormValue): void {
  form.id = value.id
  form.title = value.title
  form.content = value.content
  form.cover = value.cover
  form.categoryId = value.categoryId
  form.labelId = value.labelId
  form.viewStatus = value.viewStatus
  form.commentStatus = value.commentStatus
  form.recommendStatus = value.recommendStatus
  form.password = value.password
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

watch(
  () => form.viewStatus,
  (nextViewStatus) => {
    if (nextViewStatus) {
      form.password = ''
      formRef.value?.clearValidate(['password'])
    }
  },
)

const rules: FormRules<NotebookArticleFormValue> = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (!form.viewStatus && (!value || String(value).trim().length === 0)) {
          callback(new Error('不可见文章需要设置访问密码'))
          return
        }

        callback()
      },
      trigger: 'blur',
    },
  ],
}

function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

function handleCategoryChange(value: number | string | ''): void {
  emit('category-change', value)
}

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    title: form.title.trim(),
    content: form.content.trim(),
    cover: form.cover.trim(),
    categoryId: form.categoryId,
    labelId: form.labelId,
    viewStatus: form.viewStatus,
    commentStatus: form.commentStatus,
    recommendStatus: form.recommendStatus,
    password: form.password.trim(),
  })
}
</script>

<style scoped>
.notebook-edit-dialog__select {
  width: 240px;
}
</style>
